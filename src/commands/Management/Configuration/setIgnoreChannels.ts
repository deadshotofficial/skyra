import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures/commands/SkyraCommand';
import { GuildMessage } from '#lib/types';
import { PermissionLevels } from '#lib/types/Enums';
import { isTextBasedChannel } from '#utils/util';
import { TextChannel } from 'discord.js';
import { CommandStore } from 'klasa';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 10,
			description: LanguageKeys.Commands.Management.SetIgnoreChannelsDescription,
			extendedHelp: LanguageKeys.Commands.Management.SetIgnoreChannelsExtended,
			permissionLevel: PermissionLevels.Administrator,
			runIn: ['text'],
			usage: '<here|channel:textchannelname>'
		});
	}

	public async run(message: GuildMessage, [channel]: [TextChannel | 'here']) {
		if (channel === 'here') channel = message.channel as TextChannel;
		else if (!isTextBasedChannel(channel)) throw await message.resolveKey(LanguageKeys.Misc.ConfigurationTextChannelRequired);

		const [t, oldLength, newLength] = await message.guild.writeSettings((settings) => {
			const ignoredChannels = settings[GuildSettings.DisabledChannels];
			const oldLength = ignoredChannels.length;

			const channelID = (channel as TextChannel).id;
			const index = ignoredChannels.indexOf(channelID);
			if (index === -1) {
				ignoredChannels.push(channelID);
			} else {
				ignoredChannels.splice(index, 1);
			}

			return [settings.getLanguage(), oldLength, ignoredChannels.length];
		});

		return message.send(
			t(
				oldLength < newLength
					? LanguageKeys.Commands.Management.SetIgnoreChannelsSet
					: LanguageKeys.Commands.Management.SetIgnoreChannelsRemoved,

				{
					channel: channel.toString()
				}
			)
		);
	}
}
