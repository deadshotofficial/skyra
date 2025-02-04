import { LanguageKeys } from '#lib/i18n/languageKeys';
import { WeebCommand, WeebCommandOptions } from '#lib/structures/commands/WeebCommand';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<WeebCommandOptions>({
	description: LanguageKeys.Commands.Weeb.PatDescription,
	extendedHelp: LanguageKeys.Commands.Weeb.PatExtended,
	queryType: 'pat',
	responseName: LanguageKeys.Commands.Weeb.Pat,
	usage: '<user:username>'
})
export default class extends WeebCommand {}
