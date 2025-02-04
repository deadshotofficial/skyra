import { DbSet, GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/commands/SkyraCommand';
import { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { WEBHOOK_FEEDBACK } from '#root/config';
import { BrandingColors } from '#utils/constants';
import { isNullish } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { BitFieldResolvable, MessageEmbed, PermissionString, TextChannel, Webhook } from 'discord.js';

const requiredChannelPermissions = ['SEND_MESSAGES', 'READ_MESSAGE_HISTORY', 'VIEW_CHANNEL'] as BitFieldResolvable<PermissionString>;

@ApplyOptions<SkyraCommandOptions>({
	cooldown: 10,
	description: LanguageKeys.Commands.Suggestions.SuggestDescription,
	extendedHelp: LanguageKeys.Commands.Suggestions.SuggestExtended,
	requiredPermissions: ['EMBED_LINKS'],
	runIn: ['text'],
	usage: '<suggestion:string>',
	flagSupport: true
})
export default class extends SkyraCommand {
	// eslint-disable-next-line @typescript-eslint/no-invalid-this
	private kChannelPrompt = this.definePrompt('<channel:textChannel|here>');

	public async run(message: GuildMessage, [suggestion]: [string]) {
		// If including a flag of `--global` send suggestions to #feedbacks in Skyra Lounge
		const globalSuggestion = Reflect.has(message.flagArgs, 'global') && this.client.webhookFeedback;

		// ! NOTE: Once we start sharding we need to have a better solution for this
		const guild = globalSuggestion ? this.client.guilds.cache.get(WEBHOOK_FEEDBACK!.guild_id!)! : message.guild;
		let suggestionsChannel: Webhook | TextChannel | undefined = undefined;

		if (globalSuggestion) {
			suggestionsChannel = this.client.webhookFeedback!;
		} else {
			const [suggestionsChannelID, t] = await guild.readSettings((settings) => [
				settings[GuildSettings.Suggestions.SuggestionsChannel],
				settings.getLanguage()
			]);

			suggestionsChannel = this.client.channels.cache.get(suggestionsChannelID ?? '') as TextChannel | undefined;
			if (!suggestionsChannel?.postable) {
				throw t(LanguageKeys.Commands.Suggestions.SuggestNoPermissions, {
					username: message.author.username,
					channel: (message.channel as TextChannel).toString()
				});
			}
		}

		const [[upvoteEmoji, downvoteEmoji, t], [suggestions, currentSuggestionId]] = await Promise.all([
			guild.readSettings(
				(settings) =>
					[
						settings[GuildSettings.Suggestions.VotingEmojis.UpvoteEmoji],
						settings[GuildSettings.Suggestions.VotingEmojis.DownvoteEmoji],
						settings.getLanguage()
					] as const
			),
			this.getCurrentSuggestionID(guild.id)
		]);

		// Post the suggestion
		const suggestionsMessage = await (suggestionsChannel as TextChannel).send(
			new MessageEmbed()
				.setColor(BrandingColors.Primary)
				.setAuthor(
					`${message.author.tag} (${message.author.id})`,
					message.author.displayAvatarURL({ format: 'png', size: 128, dynamic: true })
				)
				.setTitle(t(LanguageKeys.Commands.Suggestions.SuggestTitle, { id: currentSuggestionId + 1 }))
				.setDescription(suggestion)
		);

		// Commit the suggestion to the DB
		await suggestions.insert({
			id: currentSuggestionId + 1,
			authorID: message.author.id,
			guildID: guild.id,
			messageID: suggestionsMessage.id
		});

		// Add the upvote/downvote reactions
		for (const emoji of [upvoteEmoji, downvoteEmoji]) {
			await suggestionsMessage.react(emoji);
		}

		return message.send(
			t(LanguageKeys.Commands.Suggestions.SuggestSuccess, {
				channel: globalSuggestion ? 'Skyra Lounge' : suggestionsChannel.toString()
			})
		);
	}

	public async inhibit(message: GuildMessage): Promise<boolean> {
		// If the message that triggered this is not this command (potentially help command) or the guild is null, return with no error.
		if (!Object.is(message.command, this) || message.guild === null || Reflect.has(message.flagArgs, 'global')) return false;
		const channelID = await message.guild.readSettings(GuildSettings.Suggestions.SuggestionsChannel);
		if (isNullish(channelID)) return this.setChannel(message);
		return false;
	}

	private async setChannel(message: GuildMessage) {
		// If the user doesn't have the rights to change guild configuration, do not proceed
		const t = await message.fetchT();
		const manageable = await message.hasAtLeastPermissionLevel(PermissionLevels.Administrator);
		if (!manageable) {
			await message.send(t(LanguageKeys.Commands.Suggestions.SuggestNoSetup, { username: message.author.username }));
			return true;
		}

		// Ask the user if they want to setup a channel
		const setup = await message.ask({
			content: t(LanguageKeys.Commands.Suggestions.SuggestNoSetupAsk, { username: message.author.username })
		});
		if (!setup) {
			await message.send(t(LanguageKeys.Commands.Suggestions.SuggestNoSetupAbort));
			return true;
		}

		// Get the channel
		let [channel] = await this.kChannelPrompt
			.createPrompt(message, {
				target: message.author,
				limit: 1,
				time: 30000
			})
			.run<TextChannel[] | string[]>(t(LanguageKeys.Commands.Suggestions.SuggestChannelPrompt));

		channel = (typeof channel === 'string' ? message.channel : channel) as TextChannel;

		if (!channel || channel.guild.id !== message.guild.id) {
			await message.send(t(LanguageKeys.Resolvers.InvalidChannelName, { name: channel.name }));
			return true;
		}

		const missingPermissions = await this.missingBotPermissions(message);

		if (missingPermissions.length) {
			throw t(LanguageKeys.Inhibitors.MissingBotPerms, {
				missing: missingPermissions.map((permission) => t(`permissions:${permission}`))
			});
		}

		// Update settings
		await message.guild.writeSettings([[GuildSettings.Suggestions.SuggestionsChannel, channel.id]]);
		await message.send(t(LanguageKeys.Commands.Admin.ConfMenuSaved));

		return true;
	}

	private async missingBotPermissions(message: GuildMessage) {
		const textChannel = message.channel as TextChannel;
		const permissions = textChannel.permissionsFor(message.guild.me!);
		if (!permissions) throw 'Failed to fetch permissions.';
		const missing = permissions.missing(requiredChannelPermissions, false);

		return missing;
	}

	private async getCurrentSuggestionID(guildID: string) {
		const { suggestions } = await DbSet.connect();

		// Retrieve the ID for the latest suggestion
		const [{ max }] = (await suggestions.query(
			/* sql */ `
			SELECT max(id)
			FROM suggestion
			WHERE guild_id = $1
		`,
			[guildID]
		)) as [MaxQuery];

		return [suggestions, max ?? 0] as const;
	}
}

interface MaxQuery {
	max: number | null;
}
