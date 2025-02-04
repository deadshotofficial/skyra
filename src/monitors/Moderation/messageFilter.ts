import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { HardPunishment, ModerationMonitor } from '#lib/structures/moderation/ModerationMonitor';
import { GuildMessage } from '#lib/types';
import { Colors } from '#lib/types/Constants';
import { getContent } from '#utils/util';
import { MessageEmbed, TextChannel } from 'discord.js';
import { TFunction } from 'i18next';

export default class extends ModerationMonitor {
	protected readonly reasonLanguageKey = LanguageKeys.Monitors.ModerationMessages;
	protected readonly reasonLanguageKeyWithMaximum = LanguageKeys.Monitors.ModerationMessagesWithMaximum;
	protected readonly keyEnabled = GuildSettings.Selfmod.Messages.Enabled;
	protected readonly ignoredChannelsPath = GuildSettings.Selfmod.Messages.IgnoredChannels;
	protected readonly ignoredRolesPath = GuildSettings.Selfmod.Messages.IgnoredRoles;
	protected readonly softPunishmentPath = GuildSettings.Selfmod.Messages.SoftAction;
	protected readonly hardPunishmentPath: HardPunishment = {
		action: GuildSettings.Selfmod.Messages.HardAction,
		actionDuration: GuildSettings.Selfmod.Messages.HardActionDuration,
		adder: 'messages'
	};

	private readonly kChannels = new WeakMap<TextChannel, string[]>();

	protected async preProcess(message: GuildMessage) {
		// Retrieve the threshold
		const [threshold, queueSize] = await message.guild.readSettings([
			GuildSettings.Selfmod.Messages.Maximum,
			GuildSettings.Selfmod.Messages.QueueSize
		]);
		if (threshold === 0) return null;

		// Retrieve the content
		const content = getContent(message);
		if (content === null) return null;

		// Retrieve the contents, then update them to add the new content to the FILO queue.
		const contents = this.getContents(message);
		const count = this.updateContents(contents, content.toLowerCase(), queueSize);

		// If count is bigger than threshold
		// - return `count` (runs the rest of the monitor),
		// - else return `null` (stops)
		return count > threshold ? 1 : null;
	}

	protected onDelete(message: GuildMessage) {
		return message.nuke();
	}

	protected onAlert(message: GuildMessage, t: TFunction) {
		return message.alert(t(LanguageKeys.Monitors.MessageFilter, { user: message.author.toString() }));
	}

	protected onLogMessage(message: GuildMessage, t: TFunction) {
		return new MessageEmbed()
			.setDescription(message.content)
			.setColor(Colors.Red)
			.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setFooter(`#${(message.channel as TextChannel).name} | ${t(LanguageKeys.Monitors.MessageFooter)}`)
			.setTimestamp();
	}

	private getContents(message: GuildMessage) {
		const previousValue = this.kChannels.get(message.channel as TextChannel);
		if (typeof previousValue === 'undefined') {
			const nextValue: string[] = [];
			this.kChannels.set(message.channel as TextChannel, nextValue);
			return nextValue;
		}

		return previousValue;
	}

	private updateContents(contents: string[], content: string, queueSize: number) {
		// Queue FILO behavior, first-in, last-out.
		if (contents.length >= queueSize) contents.length = queueSize - 1;
		contents.unshift(content);

		return contents.reduce((accumulator, ct) => (ct === content ? accumulator + 1 : accumulator), 1);
	}
}
