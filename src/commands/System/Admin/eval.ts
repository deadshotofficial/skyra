import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/commands/SkyraCommand';
import { Events, PermissionLevels } from '#lib/types/Enums';
import { EvalExtraData, handleMessage } from '#utils/Parsers/ExceededLength';
import { sleep } from '#utils/Promisified/sleep';
import { clean } from '#utils/Sanitizer/clean';
import { cast } from '#utils/util';
import { Type } from '@sapphire/type';
import { codeBlock, isThenable } from '@sapphire/utilities';
import { ApplyOptions } from '@skyra/decorators';
import { Message } from 'discord.js';
import { Stopwatch } from 'klasa';
import { inspect } from 'util';

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['ev'],
	description: LanguageKeys.Commands.System.EvalDescription,
	extendedHelp: LanguageKeys.Commands.System.EvalExtended,
	guarded: true,
	permissionLevel: PermissionLevels.BotOwner,
	usage: '<expression:str>',
	flagSupport: true
})
export default class extends SkyraCommand {
	private readonly kTimeout = 60000;

	public async run(message: Message, [code]: [string]) {
		const flagTime =
			'no-timeout' in message.flagArgs ? (Reflect.has(message.flagArgs, 'wait') ? Number(message.flagArgs.wait) : this.kTimeout) : Infinity;
		const language = message.flagArgs.lang || message.flagArgs.language || (message.flagArgs.json ? 'json' : 'js');
		const { success, result, time, type } = await this.timedEval(message, code, flagTime);

		if (message.flagArgs.silent) {
			if (!success && result && cast<Error>(result).stack) this.client.emit(Events.Wtf, cast<Error>(result).stack);
			return null;
		}

		const footer = codeBlock('ts', type);
		const sendAs =
			(Reflect.get(message.flagArgs, 'output') || Reflect.get(message.flagArgs, 'output-to') || Reflect.get(message.flagArgs, 'log')) ?? null;

		return handleMessage<Partial<EvalExtraData>>(message, {
			sendAs,
			hastebinUnavailable: false,
			url: null,
			canLogToConsole: true,
			success,
			result,
			time,
			footer,
			language
		});
	}

	private async timedEval(message: Message, code: string, flagTime: number) {
		if (flagTime === Infinity || flagTime === 0) return this.eval(message, code);
		const t = await message.fetchT();
		return Promise.race([
			sleep(flagTime).then(() => ({
				result: t(LanguageKeys.Commands.System.EvalTimeout, { seconds: flagTime / 1000 }),
				success: false,
				time: '⏱ ...',
				type: 'EvalTimeoutError'
			})),
			this.eval(message, code)
		]);
	}

	// Eval the input
	private async eval(message: Message, code: string) {
		const stopwatch = new Stopwatch();
		let success: boolean | undefined = undefined;
		let syncTime: string | undefined = undefined;
		let asyncTime: string | undefined = undefined;
		let result: unknown | undefined = undefined;
		let thenable = false;
		let type: Type | undefined = undefined;
		try {
			if (message.flagArgs.async) code = `(async () => {\n${code}\n})();`;

			// @ts-expect-error 6133
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const msg = message;
			// eslint-disable-next-line no-eval
			result = eval(code);
			syncTime = stopwatch.toString();
			type = new Type(result);
			if (isThenable(result)) {
				thenable = true;
				stopwatch.restart();
				result = await result;
				asyncTime = stopwatch.toString();
			}
			success = true;
		} catch (error) {
			if (!syncTime) syncTime = stopwatch.toString();
			if (thenable && !asyncTime) asyncTime = stopwatch.toString();
			if (!type!) type = new Type(error);
			result = error;
			success = false;
		}

		stopwatch.stop();
		if (typeof result !== 'string') {
			result =
				result instanceof Error
					? result.stack
					: message.flagArgs.json
					? JSON.stringify(result, null, 4)
					: inspect(result, {
							depth: message.flagArgs.depth ? parseInt(message.flagArgs.depth, 10) || 0 : 0,
							showHidden: Boolean(message.flagArgs.showHidden)
					  });
		}
		return { success, type: type!, time: this.formatTime(syncTime, asyncTime ?? ''), result: clean(result as string) };
	}

	private formatTime(syncTime: string, asyncTime: string) {
		return asyncTime ? `⏱ ${asyncTime}<${syncTime}>` : `⏱ ${syncTime}`;
	}
}
