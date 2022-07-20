import * as fs from 'fs';
import { Collection, Interaction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';


interface CollectionInfo {
    execute(interaction: Interaction): void,
    data: SlashCommandBuilder
}

export class LoadCommands {
	private _commands: Collection<string, CollectionInfo> = new Collection() ;
	private _commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.ts'));

	constructor() {
		for (const file of this._commandFiles) {
			const command = require(`../commands/${file}`);
			this._commands.set(command.data.name, command);
		}
	}

	public get commands(): Collection<string, CollectionInfo> {
		return this._commands;
	}


}
