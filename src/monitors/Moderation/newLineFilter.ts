import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { HardPunishment, ModerationMonitor } from '#lib/structures/moderation/ModerationMonitor';
import { GuildMessage } from '#lib/types';
import { Colors } from '#lib/types/Constants';
import { getContent } from '#utils/util';
import { MessageEmbed, TextChannel } from 'discord.js';
import { TFunction } from 'i18next';

const NEW_LINE = '\n';

export default class extends ModerationMonitor {
	protected readonly reasonLanguageKey = LanguageKeys.Monitors.ModerationNewLine;
	protected readonly reasonLanguageKeyWithMaximum = LanguageKeys.Monitors.ModerationNewLineWithMaximum;
	protected readonly keyEnabled = GuildSettings.Selfmod.NewLines.Enabled;
	protected readonly ignoredChannelsPath = GuildSettings.Selfmod.NewLines.IgnoredChannels;
	protected readonly ignoredRolesPath = GuildSettings.Selfmod.NewLines.IgnoredRoles;
	protected readonly softPunishmentPath = GuildSettings.Selfmod.NewLines.SoftAction;
	protected readonly hardPunishmentPath: HardPunishment = {
		action: GuildSettings.Selfmod.NewLines.HardAction,
		actionDuration: GuildSettings.Selfmod.NewLines.HardActionDuration,
		adder: 'newlines'
	};

	protected async preProcess(message: GuildMessage) {
		const threshold = await message.guild.readSettings(GuildSettings.Selfmod.NewLines.Maximum);
		if (threshold === 0) return null;

		const content = getContent(message);
		if (content === null) return null;

		let count = 0;
		for (let index = -2; index !== -1; index = content.indexOf(NEW_LINE, index + 1)) count++;

		return count > threshold ? 1 : null;
	}

	protected onDelete(message: GuildMessage) {
		return message.nuke();
	}

	protected onAlert(message: GuildMessage, t: TFunction) {
		return message.alert(t(LanguageKeys.Monitors.NewLineFilter, { user: message.author.toString() }));
	}

	protected onLogMessage(message: GuildMessage, t: TFunction) {
		return new MessageEmbed()
			.setDescription(message.content)
			.setColor(Colors.Red)
			.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setFooter(`#${(message.channel as TextChannel).name} | ${t(LanguageKeys.Monitors.NewLineFooter)}`)
			.setTimestamp();
	}
}
