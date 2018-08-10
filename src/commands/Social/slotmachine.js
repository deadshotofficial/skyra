const { Command, Slotmachine } = require('../../index');

module.exports = class extends Command {

	constructor(client, store, file, directory) {
		super(client, store, file, directory, {
			aliases: ['slot', 'slots', 'slotmachines'],
			requiredPermissions: ['ATTACH_FILES'],
			cooldown: 10,
			bucket: 2,
			description: (language) => language.get('COMMAND_SLOTMACHINE_DESCRIPTION'),
			extendedHelp: (language) => language.get('COMMAND_SLOTMACHINE_EXTENDED'),
			runIn: ['text'],
			usage: '<50|100|200|500|1000>'
		});
	}

	async run(msg, [text]) {
		const coins = Number(text);
		if (msg.author.settings.money < coins)
			throw msg.language.get('COMMAND_SLOTMACHINES_MONEY', msg.author.settings.money);

		const attachment = await new Slotmachine(msg, coins).run();
		return msg.channel.send({ files: [{ attachment, name: 'Slotmachine.png' }] });
	}

};
