const { Event } = require('klasa');

module.exports = class extends Event {

	run() {
		this.client.user.setActivity('Loading...', { type: 'WATCHING' })
			.catch(err => this.client.emit('log', err, 'error'));
	}

};
