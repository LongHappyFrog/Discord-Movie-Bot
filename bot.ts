import { Client, Intents } from 'discord.js';
import { logger, LoggingCateogries, LoggingTypes } from './logger/logger';

export class Bot {

	private readonly _client: Client = new Client({
		intents: [
			Intents.FLAGS.GUILDS,
			Intents.FLAGS.GUILD_MESSAGES,
			Intents.FLAGS.GUILD_SCHEDULED_EVENTS,
			Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
	});

	public async login(token: string) {
		return this._client.login(token)
			.catch(err => {
				logger({
					message: err,
					category: LoggingCateogries.LOGIN,
					type: LoggingTypes.ERROR,
				});
			})

		;
	}

	public get client(): Client {
		return this._client;
	}
}