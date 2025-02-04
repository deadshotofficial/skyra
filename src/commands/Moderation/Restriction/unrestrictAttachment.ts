import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ModerationCommand, ModerationCommandOptions } from '#lib/structures/commands/ModerationCommand';
import { GuildMessage } from '#lib/types';
import { ArgumentTypes } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<ModerationCommandOptions>({
	aliases: ['un-restricted-attachment', 'ura'],
	description: LanguageKeys.Commands.Moderation.UnrestrictAttachmentDescription,
	extendedHelp: LanguageKeys.Commands.Moderation.UnrestrictAttachmentExtended,
	requiredGuildPermissions: ['MANAGE_ROLES']
})
export default class extends ModerationCommand {
	private readonly kPath = GuildSettings.Roles.RestrictedAttachment;

	public async inhibit(message: GuildMessage) {
		// If the command run is not this one (potentially help command) or the guild is null, return with no error.
		if (message.command !== this || message.guild === null) return false;
		const [id, prefix, t] = await message.guild.readSettings((settings) => [
			settings[this.kPath],
			settings[GuildSettings.Prefix],
			settings.getLanguage()
		]);

		if (id && message.guild.roles.cache.has(id)) return false;
		throw t(LanguageKeys.Commands.Moderation.GuildSettingsRolesRestricted, {
			prefix,
			path: this.kPath
		});
	}

	public async handle(...[message, context]: ArgumentTypes<ModerationCommand['handle']>) {
		return message.guild.security.actions.unRestrictAttachment(
			{
				userID: context.target.id,
				moderatorID: message.author.id,
				reason: context.reason
			},
			await this.getTargetDM(message, context.target)
		);
	}
}
