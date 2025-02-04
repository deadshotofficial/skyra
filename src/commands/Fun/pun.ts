import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/commands/SkyraCommand';
import { Mime } from '#utils/constants';
import { fetch } from '#utils/util';
import { ApplyOptions } from '@skyra/decorators';
import { Message } from 'discord.js';

@ApplyOptions<SkyraCommandOptions>({
	cooldown: 5,
	description: LanguageKeys.Commands.Fun.PunDescription,
	extendedHelp: LanguageKeys.Commands.Fun.PunExtended,
	spam: true
})
export default class extends SkyraCommand {
	public async run(message: Message) {
		try {
			const { joke } = await fetch<PunResultOk>('https://icanhazdadjoke.com/', {
				headers: {
					Accept: Mime.Types.ApplicationJson
				}
			});
			return message.send(joke);
		} catch {
			throw await message.resolveKey(LanguageKeys.Commands.Fun.PunError);
		}
	}
}

export interface PunResultOk {
	id: string;
	joke: string;
	status: number;
}
