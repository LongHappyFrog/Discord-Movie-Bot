import { Client, Message, PartialMessage } from 'discord.js';
import { ActiveReviews } from '../database/models/activeReviews';
import { EventHandler } from '../handlers/eventHandler';

class MessageDelete {

	public static async execute(message: Message | PartialMessage) {
		if (message.embeds.length = 0) { return; }
		const row = await ActiveReviews.findOne({
			where: { messageId: message.id },
		});
		if (row) {
			await ActiveReviews.destroy({
				where: { messageId: message.id },
			});
		}
	}

	public static loader(client: Client) {
		new EventHandler({
			client: client,
			eventName: 'messageDelete',
			callback: MessageDelete.execute,
			enabled: true,
			once: false,
		});
	}
}

module.exports.loader = MessageDelete.loader;