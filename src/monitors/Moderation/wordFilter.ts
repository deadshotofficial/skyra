import { DbSet, GuildSettings } from '#lib/database';
import { SkyraEmbed } from '#lib/discord';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { HardPunishment, ModerationMonitor } from '#lib/structures/moderation/ModerationMonitor';
import { GuildMessage } from '#lib/types';
import { Colors } from '#lib/types/Constants';
import { floatPromise, getContent } from '#utils/util';
import { codeBlock, cutText } from '@sapphire/utilities';
import { remove as removeConfusables } from 'confusables';
import { TextChannel } from 'discord.js';
import { TFunction } from 'i18next';

export default class extends ModerationMonitor {
	protected readonly reasonLanguageKey = LanguageKeys.Monitors.ModerationWords;
	protected readonly reasonLanguageKeyWithMaximum = LanguageKeys.Monitors.ModerationWordsWithMaximum;
	protected readonly keyEnabled = GuildSettings.Selfmod.Filter.Enabled;
	protected readonly ignoredChannelsPath = GuildSettings.Selfmod.Filter.IgnoredChannels;
	protected readonly ignoredRolesPath = GuildSettings.Selfmod.Filter.IgnoredRoles;
	protected readonly softPunishmentPath = GuildSettings.Selfmod.Filter.SoftAction;
	protected readonly hardPunishmentPath: HardPunishment = {
		action: GuildSettings.Selfmod.Filter.HardAction,
		actionDuration: GuildSettings.Selfmod.Filter.HardActionDuration,
		adder: 'words'
	};

	public shouldRun(message: GuildMessage) {
		return super.shouldRun(message);
	}

	protected async preProcess(message: GuildMessage) {
		const content = getContent(message);
		if (content === null) return null;

		const regex = await message.guild.readSettings((settings) => settings.wordFilterRegExp);
		return regex ? this.filter(removeConfusables(content), regex) : null;
	}

	protected async onDelete(message: GuildMessage, t: TFunction, value: FilterResults) {
		floatPromise(this, message.nuke());
		if (message.content.length > 25 && (await DbSet.fetchModerationDirectMessageEnabled(message.author.id))) {
			await message.author.send(t(LanguageKeys.Monitors.WordFilterDm, { filtered: codeBlock('md', cutText(value.filtered, 1900)) }));
		}
	}

	protected onAlert(message: GuildMessage, t: TFunction) {
		return message.alert(t(LanguageKeys.Monitors.WordFilter, { user: message.author.toString() }));
	}

	protected onLogMessage(message: GuildMessage, t: TFunction, results: FilterResults) {
		return new SkyraEmbed()
			.splitFields(cutText(results.highlighted, 4000))
			.setColor(Colors.Red)
			.setAuthor(`${message.author.tag} (${message.author.id})`, message.author.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
			.setFooter(`#${(message.channel as TextChannel).name} | ${t(LanguageKeys.Monitors.WordFooter)}`)
			.setTimestamp();
	}

	private filter(str: string, regex: RegExp): FilterResults | null {
		const matches = str.match(regex);
		if (matches === null) return null;

		let last = 0;
		let next = 0;

		const filtered: string[] = [];
		const highlighted: string[] = [];
		for (const match of matches) {
			next = str.indexOf(match, last);
			const section = str.slice(last, next);
			if (section) {
				filtered.push(section, '*'.repeat(match.length));
				highlighted.push(section, `__${match}__`);
			} else {
				filtered.push('*'.repeat(match.length));
				highlighted.push(`__${match}__`);
			}
			last = next + match.length;
		}

		if (last !== str.length) {
			const end = str.slice(last);
			filtered.push(end);
			highlighted.push(end);
		}

		return {
			filtered: filtered.join(''),
			highlighted: highlighted.join('')
		};
	}
}

interface FilterResults {
	filtered: string;
	highlighted: string;
}
