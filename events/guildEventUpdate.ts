import { Client, GuildScheduledEvent } from 'discord.js';
import { EventHandler } from '../handlers/eventHandler';
import { ActiveMovies } from '../database/models/activeMovies';
import { CompletedMovies } from '../database/models/completedMovies';

class GuildEventUpdate {

	public static async execute(oldGuildEvent: GuildScheduledEvent, updatedGuildEvent: GuildScheduledEvent) {
		const eventId = updatedGuildEvent.id;
		const guildId = updatedGuildEvent.guildId;
		const newStatus = updatedGuildEvent.status;

		// if (oldStatus == 'SCHEDULED' && newStatus == 'ACTIVE') {
		// 	if (await ActiveMovies.findOne({
		// 		where: { eventId: eventId },
		// 	})) {
		// 		logger({
		// 			message: 'Movie Event went from Scheduled to Active',
		// 			category: LoggingCateogries.DATABASE,
		// 			type: LoggingTypes.INFO,
		// 		});
		// 	}
		// }

		if (newStatus == 'COMPLETED') {
			const rowActive = await ActiveMovies.findOne({
				where: {
					eventId: eventId,
					guildId: guildId,
				},
			});

			if (!rowActive) { return; }

			const rowComplete = await CompletedMovies.findOne({
				where: {
					movieId: rowActive.movieId,
					guildId: guildId,
				},
			});
			await ActiveMovies.destroy({
				where: {
					eventId: eventId,
					guildId: guildId,
				},
			});

			if (rowComplete) {
				await CompletedMovies.update({
					lastDateWatched: new Date(),
					timesWatched: rowComplete.timesWatched + 1,
				}, {
					where: {
						movieId: rowActive.movieId,
						guildId: guildId,
					},
				});
			}
			else {
				await CompletedMovies.create({
					movieId: rowActive.movieId,
					guildId: guildId,
					title: rowActive.title,
					lastDateWatched: new Date(),
				});
			}
		}
	}

	public static loader(client: Client) {
		new EventHandler({
			client: client,
			eventName: 'guildScheduledEventUpdate',
			callback: GuildEventUpdate.execute,
			enabled: true,
			once: false,
		});
	}
}

module.exports.loader = GuildEventUpdate.loader;