import { Client, GuildScheduledEvent } from 'discord.js';
import { EventHandler } from '../handlers/eventHandler';
import { ActiveMovies } from '../database/models/activeMovies';

class GuildEventDelete {

	public static async execute(guildEvent: GuildScheduledEvent) {
		if (await ActiveMovies.findOne({
			where: { eventId: guildEvent.id },
		})) {
			await ActiveMovies.destroy({
				where: { eventId: guildEvent.id },
			});
		}
	}

	public static loader(client: Client) {
		new EventHandler({
			client: client,
			eventName: 'guildScheduledEventDelete',
			callback: GuildEventDelete.execute,
			enabled: true,
			once: false,
		});
	}
}

module.exports.loader = GuildEventDelete.loader;