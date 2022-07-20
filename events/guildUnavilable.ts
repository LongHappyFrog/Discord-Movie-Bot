import { Client, Guild } from 'discord.js';
import { EventHandler } from '../handlers/eventHandler';
import { logger, LoggingCateogries, LoggingTypes } from '../logger/logger';

class GuildUnavilable {

	public static async execute(guild: Guild) {
		logger({
			message: `${guild.name} with ID: ${guild.id} went down!`,
			category: LoggingCateogries.GUILD,
			type: LoggingTypes.WARNING,
		});
	}

	public static loader(client: Client) {
		new EventHandler({
			client: client,
			eventName: 'guildUnavailable',
			callback: GuildUnavilable.execute,
			enabled: true,
			once: false,
		});
	}
}

module.exports.loader = GuildUnavilable.loader;