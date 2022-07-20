import * as fs from 'fs';
import { Awaitable, Client, ClientEvents, Collection, Interaction } from 'discord.js';
import { logger, LoggingCateogries, LoggingTypes } from '../logger/logger';
import { SlashCommandBuilder } from '@discordjs/builders';

interface EventHandlerOptions<Event extends keyof ClientEvents> {
    client: Client,
    eventName: Event,
    callback: (...args: ClientEvents[Event]) => Awaitable<void>,
    enabled?: boolean,
    once?: boolean,
}

export class EventHandler<Event extends keyof ClientEvents> {

	constructor(options: EventHandlerOptions<Event>) {
		if (options.enabled) {
			options.client[options.once ? 'once' : 'on'](options.eventName, options.callback);
			logger({
				message: `LOADED ${options.eventName.toUpperCase()}`,
				category: LoggingCateogries.EVENT_HANDLER,
				type: LoggingTypes.VERBOSE,
			});
		}
	}

}


interface CollectionInfo {
    execute(interaction: Interaction): void,
    data: SlashCommandBuilder
}

export class LoadEvents {

	private readonly _client: Client;
	private _commands;
	private _eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.ts'));

	constructor(client: Client, commands: Collection<string, CollectionInfo>) {
		this._client = client;
		this._commands = commands;

		for (const file of this._eventFiles) {
			if (file == 'interactionHandler.ts') {
				const handler = require(`../events/${file}`);
				handler.commands = this._commands;
				handler.loader(this._client);
			}
			else {
				require(`../events/${file}`)['loader'](this._client);
			}
		}
	}
}