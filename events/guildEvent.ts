import { Client, GuildScheduledEvent } from 'discord.js';
import { EventHandler } from '../handlers/eventHandler';
import { IMDB, MovieObject } from '../modules/imdb';
import { ActiveMovies } from '../database/models/activeMovies';
import { Servers } from '../database/models/guilds';

class GuildEvent {

	public static async execute(guildEvent: GuildScheduledEvent) {
		const eventName = guildEvent.name;
		let eventDesc = guildEvent.description;
		let movieData: MovieObject;
		if (eventDesc == undefined) { eventDesc = ''; }

		if (/<movie.+?>/i.test(guildEvent.name)) {
			const regex = /<movie.+?>/i;
			const matches = regex.exec(eventName);
			const parseName = matches[0].replace(/<movie /i, '').replace(/>$/, '');
			try {
				movieData = await IMDB.idSearch(await IMDB.idScrape(parseName));
			}

			// If no movie is found register it as a custom movie
			catch (err) {
				try {
					await guildEvent.edit({ name: eventName.replace(regex, parseName), description: eventDesc });
				}
				catch (err2) {
					await guildEvent.creator.send({ content: 'Error editing event, bot missing ManageEvents permission!' });
				}
				finally {
					return;
				}

			}
			// Replace with searched movie name
			try {
				await guildEvent.edit({ name: eventName.replace(regex, movieData.Title), description: eventDesc.concat(`\n\n${movieData.Plot}`) });
			}
			catch (err) {
				await guildEvent.creator.send({ content: 'Error editing event, bot missing ManageEvents permission!' });
				return;

			}

			// Check if guildId is in guild table
			if (!await Servers.findOne({
				where: { id: guildEvent.guildId },
			})) {
				await Servers.create({
					id: guildEvent.guildId,
				});
			}

			await ActiveMovies.create({
				eventId: guildEvent.id,
				guildId: guildEvent.guildId,
				movieId: movieData.imdbID,
				title: movieData.Title,
			});
		}
	}
	public static loader(client: Client) {
		new EventHandler({
			client: client,
			eventName: 'guildScheduledEventCreate',
			callback: GuildEvent.execute,
			enabled: true,
			once: false,
		});
	}
}

module.exports.loader = GuildEvent.loader;