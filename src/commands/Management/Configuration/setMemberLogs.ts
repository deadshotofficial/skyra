import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { ChannelConfigurationCommand, ChannelConfigurationCommandOptions } from '#lib/structures/commands/ChannelConfigurationCommand';
import { ApplyOptions } from '@skyra/decorators';

@ApplyOptions<ChannelConfigurationCommandOptions>({
	description: LanguageKeys.Commands.Management.SetMemberLogsDescription,
	extendedHelp: LanguageKeys.Commands.Management.SetMemberLogsExtended,
	responseKey: LanguageKeys.Commands.Management.SetMemberLogsSet,
	settingsKey: GuildSettings.Channels.MemberLogs
})
export default class extends ChannelConfigurationCommand {}
