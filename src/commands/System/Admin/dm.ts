import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/commands/SkyraCommand';
import { PermissionLevels } from '#lib/types/Enums';
import { ApplyOptions } from '@skyra/decorators';
import { Message, MessageOptions, User } from 'discord.js';

@ApplyOptions<SkyraCommandOptions>({
	description: LanguageKeys.Commands.System.DmDescription,
	extendedHelp: LanguageKeys.Commands.System.DmExtended,
	guarded: true,
	permissionLevel: PermissionLevels.BotOwner,
	usage: '<user:user> <message:...string>',
	usageDelim: ' '
})
export default class extends SkyraCommand {
	public async run(message: Message, [user, content]: [User, string]) {
		const attachment = message.attachments.size > 0 ? message.attachments.first()!.url : null;
		const options: MessageOptions = {};
		if (attachment) options.files = [{ attachment }];

		try {
			await user.send(content, options);
			return await message.alert(`Message successfully sent to ${user}`);
		} catch {
			return message.alert(`I am sorry, I could not send the message to ${user}`);
		}
	}
}
