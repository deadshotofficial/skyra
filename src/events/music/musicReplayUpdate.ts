import { Queue } from '#lib/audio';
import { AudioEvent } from '#lib/structures/events/AudioEvent';
import { OutgoingWebsocketAction } from '#lib/websocket/types';

export default class extends AudioEvent {
	public run(queue: Queue, repeating: boolean) {
		this.broadcastMessageForGuild(queue.guildID, () => ({
			action: OutgoingWebsocketAction.MusicReplayUpdate,
			data: { replay: repeating }
		}));
	}
}
