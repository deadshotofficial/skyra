import { Queue } from '#lib/audio';
import { AudioEvent } from '#lib/structures/events/AudioEvent';
import { OutgoingWebsocketAction } from '#lib/websocket/types';

export default class extends AudioEvent {
	public run(queue: Queue, next: number) {
		return this.broadcastMessageForGuild(queue.guildID, () => ({
			action: OutgoingWebsocketAction.MusicSongVolumeUpdate,
			data: { volume: next }
		}));
	}
}
