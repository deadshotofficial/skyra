import { GuildSettings } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { Colors } from '#lib/types/Constants';
import { Events } from '#lib/types/Enums';
import { MessageLogsEnum } from '#utils/constants';
import { ApplyOptions } from '@skyra/decorators';
import { GuildMember, MessageEmbed } from 'discord.js';
import { TFunction } from 'i18next';
import { Event, EventOptions } from 'klasa';

@ApplyOptions<EventOptions>({ event: Events.GuildMemberUpdate })
export default class extends Event {
	public async run(previous: GuildMember, next: GuildMember) {
		const [enabled, t] = await next.guild.readSettings((settings) => [settings[GuildSettings.Events.MemberRoleUpdate], settings.getLanguage()]);

		if (!enabled) return;

		// Retrieve whether or not role logs should be sent from Guild Settings and
		// whether or not the roles are the same.
		const prevRoles = previous.roles.cache;
		const nextRoles = next.roles.cache;
		if (prevRoles.equals(nextRoles)) return;

		const addedRoles: string[] = [];
		const removedRoles: string[] = [];

		// Check which roles are added and which are removed and
		// get the names of each role for logging
		for (const [key, role] of nextRoles.entries()) {
			if (!prevRoles.has(key)) addedRoles.push(`\`${role.name}\``);
		}

		for (const [key, role] of prevRoles.entries()) {
			if (!nextRoles.has(key)) removedRoles.push(`\`${role.name}\``);
		}

		const { user } = next;

		// Set the Role change log
		this.client.emit(Events.GuildMessageLog, MessageLogsEnum.Member, next.guild, () =>
			new MessageEmbed()
				.setColor(Colors.Yellow)
				.setAuthor(`${user.tag} (${user.id})`, user.displayAvatarURL({ size: 128, format: 'png', dynamic: true }))
				.setDescription(this.getRoleDescription(t, addedRoles, removedRoles) || t(LanguageKeys.Events.GuildMemberNoUpdate))
				.setFooter(t(LanguageKeys.Events.RoleUpdate))
				.setTimestamp()
		);
	}

	private getRoleDescription(t: TFunction, addedRoles: string[], removedRoles: string[]) {
		const description = [];
		if (addedRoles.length) {
			description.push(
				t(LanguageKeys.Events.GuildMemberAddedRoles, {
					addedRoles,
					count: addedRoles.length
				})
			);
		}

		if (removedRoles.length) {
			description.push(t(LanguageKeys.Events.GuildMemberRemovedRoles, { removedRoles, count: removedRoles.length }));
		}

		return description.join('\n');
	}
}
