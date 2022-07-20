import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import * as fs from 'fs';
import { discord_token, clientId } from '../config.json';

const commands = [];

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.ts'));

for (const file of commandFiles) {
	const command = require(`../commands/${file}`);
	commands.push(command.data);
}

const rest = new REST({ version: '9' }).setToken(discord_token);

rest.put(Routes.applicationCommands(clientId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);