import { QueueEntry, requireQueueNotEmpty } from '#lib/audio';
import { LanguageKeys } from '#lib/i18n/languageKeys';
import { SkyraCommand, SkyraCommandOptions } from '#lib/structures/commands/SkyraCommand';
import { GuildMessage } from '#lib/types/Discord';
import { map, prependIfNotNull, take } from '#utils/iterator';
import { ApplyOptions } from '@skyra/decorators';
import { serialize } from 'binarytf';

export const maximumExportQueueSize = 100;

@ApplyOptions<SkyraCommandOptions>({
	aliases: ['eq'],
	cooldown: 10,
	description: LanguageKeys.Commands.Music.ExportQueueDescription,
	extendedHelp: LanguageKeys.Commands.Music.ExportQueueExtended,
	requiredPermissions: ['ATTACH_FILES'],
	runIn: ['text']
})
export default class extends SkyraCommand {
	@requireQueueNotEmpty()
	public async run(message: GuildMessage) {
		const { audio, name } = message.guild;
		const head = await audio.getCurrentTrack().then((v) => this.serializeCurrent(v));
		const data = await audio.tracks().then((tracks) => this.serializeQueue(tracks, head));

		return message.channel.send(await message.resolveKey(LanguageKeys.Commands.Music.ExportQueueSuccess, { guildName: name }), {
			files: [{ attachment: Buffer.from(data), name: `${name}-${Date.now()}.squeue` }]
		});
	}

	private serializeCurrent(entry: QueueEntry | null): string | null {
		return entry?.track ?? null;
	}

	private serializeQueue(tracks: QueueEntry[], head: string | null) {
		const sliced = take(tracks.values(), maximumExportQueueSize - (head ? 1 : 0));
		const mapped = map(sliced, (value) => value.track);
		return serialize([...prependIfNotNull(mapped, head)]);
	}
}
