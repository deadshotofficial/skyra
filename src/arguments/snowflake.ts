import { LanguageKeys } from '#lib/i18n/languageKeys';
import { DiscordSnowflake } from '@sapphire/snowflake';
import { Message } from 'discord.js';
import { Argument, Possible } from 'klasa';

export default class extends Argument {
	/**
	 * The validator, requiring all numbers and 17 to 19 digits (future-proof).
	 */
	private readonly kRegExp = /^\d{17,19}$/;

	/**
	 * Stanislav's join day, known as the oldest user in Discord, and practically
	 * the lowest snowflake we can get (as they're bound by the creation date).
	 */
	private readonly kMinimum = new Date(2015, 1, 28).getTime();

	public async run(arg: string, possible: Possible, message: Message) {
		if (!arg) throw await message.resolveKey(LanguageKeys.Resolvers.InvalidSnowflake, { name: possible.name });

		if (this.kRegExp.test(arg)) {
			const snowflake = DiscordSnowflake.deconstruct(arg);
			const timestamp = Number(snowflake.timestamp);
			if (timestamp >= this.kMinimum && timestamp < Date.now()) return arg;
		}
		throw await message.resolveKey(LanguageKeys.Resolvers.InvalidSnowflake, { name: possible.name });
	}
}
