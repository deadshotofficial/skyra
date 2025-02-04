import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Duration } from '@sapphire/time-utilities';
import { isNumber } from '@sapphire/utilities';
import { Message } from 'discord.js';
import { Argument, Possible } from 'klasa';

export default class extends Argument {
	public async run(arg: string, possible: Possible, message: Message) {
		const duration = new Duration(arg);

		if (duration.offset <= 0 || !isNumber(duration.fromNow.getTime())) {
			throw await message.resolveKey(LanguageKeys.Resolvers.InvalidDuration, { name: possible.name });
		}

		const { min, max } = possible;

		// @ts-expect-error 2341
		return (await Argument.minOrMax(this.client, duration.offset, min, max, possible, message, '')) ? duration.offset : null;
	}
}
