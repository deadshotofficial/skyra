import { DbSet, GuildSettings, RolesAuto } from '#lib/database';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand } from '#lib/structures/commands/SkyraCommand';
import { GuildMessage } from '#lib/types';
import { User } from 'discord.js';
import { CommandStore } from 'klasa';

export default class extends SkyraCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			bucket: 2,
			cooldown: 15,
			description: LanguageKeys.Commands.Social.MyLevelDescription,
			extendedHelp: LanguageKeys.Commands.Social.MyLevelExtended,
			runIn: ['text'],
			usage: '[user:username]'
		});

		this.spam = true;
	}

	public async run(message: GuildMessage, [user = message.author]: [User]) {
		const { members } = await DbSet.connect();
		const memberSettings = await members.findOne({ where: { userID: user.id, guildID: message.guild.id } });
		const memberPoints = memberSettings?.points ?? 0;
		const [roles, t] = await message.guild.readSettings((settings) => [settings[GuildSettings.Roles.Auto], settings.getLanguage()]);
		const nextRole = this.getLatestRole(memberPoints, roles);
		const title = nextRole
			? `\n${t(LanguageKeys.Commands.Social.MyLevelNext, {
					remaining: nextRole.points - memberPoints,
					next: nextRole.points
			  })}`
			: '';

		return user.id === message.author.id
			? message.send(t(LanguageKeys.Commands.Social.MyLevelSelf, { points: memberPoints, next: title }))
			: message.send(t(LanguageKeys.Commands.Social.MyLevel, { points: memberPoints, next: title, user: user.username }));
	}

	public getLatestRole(points: number, autoroles: readonly RolesAuto[]) {
		for (const autorole of autoroles) {
			if (autorole.points > points) return autorole;
		}

		return null;
	}
}
