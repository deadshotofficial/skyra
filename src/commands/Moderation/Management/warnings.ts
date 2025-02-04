import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/commands/SkyraCommand';
import { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { cast } from '#utils/util';
import { ApplyOptions } from '@skyra/decorators';
import { User } from 'discord.js';
import type Moderations from './moderations';

@ApplyOptions<SkyraCommandOptions>({
	bucket: 2,
	cooldown: 10,
	description: LanguageKeys.Commands.Moderation.WarningsDescription,
	extendedHelp: LanguageKeys.Commands.Moderation.WarningsExtended,
	permissionLevel: PermissionLevels.Moderator,
	requiredPermissions: ['EMBED_LINKS', 'MANAGE_MESSAGES'],
	runIn: ['text'],
	usage: '[user:username]'
})
export default class extends SkyraCommand {
	public run(message: GuildMessage, [target]: [User?]) {
		const moderations = cast<Moderations | undefined>(this.store.get('moderations'));
		if (typeof moderations === 'undefined') throw new Error('Moderations command not loaded yet.');
		return moderations.run(message, ['warnings', target]);
	}
}
