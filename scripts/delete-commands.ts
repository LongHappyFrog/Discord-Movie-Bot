import { REST } from '@discordjs/rest';
import { Routes, Snowflake } from 'discord-api-types/v9';
import { discord_token, clientId, guildId } from '../config.json';

const arg = process.argv[2];

if (!['guild', 'global', 'all'].includes(arg)) {
	console.log('Invalid Arguments: guild, global, all');
}

const rest = new REST({ version: '9' }).setToken(discord_token);

if (['guild', 'all'].includes(arg)) {
	rest.get(Routes.applicationGuildCommands(clientId, guildId))
		.then(data => {
			const promises = [];
			for (const command of data as Array<CommandData>) {
				const deleteUrl = `${Routes.applicationGuildCommands(clientId, guildId)}/${command.id}` as '/${string}';
				promises.push(rest.delete(deleteUrl));
			}
			return Promise.all(promises);
		});
	console.log('Deleted Guild Commands');
}

if (['global', 'all'].includes(arg)) {
	rest.get(Routes.applicationCommands(clientId))
		.then(data => {
			const promises = [];
			for (const command of data as Array<CommandData>) {
				const deleteUrl = `${Routes.applicationCommands(clientId)}/${command.id}` as '/${string}';
				promises.push(rest.delete(deleteUrl));
			}
			return Promise.all(promises);
		});
	console.log('Deleted Global Commands');
}

type CommandData = {
    id: Snowflake,
}