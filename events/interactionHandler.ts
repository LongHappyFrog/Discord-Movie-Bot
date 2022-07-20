import { SlashCommandBuilder } from '@discordjs/builders';
import { Client, Collection, Interaction } from 'discord.js';
import { EventHandler } from '../handlers/eventHandler';

export let commands: Collection<string, CollectionInfo>;

interface CollectionInfo {
    execute(interaction: Interaction): void,
    data: SlashCommandBuilder
}

class InteractionHandler {

	public static async execute(interaction: Interaction) 	{
		if (interaction.isCommand()) {
			const command = commands.get(interaction.commandName);
			if (!command) {
				await interaction.reply({ content: 'This command doesnt exist!', ephemeral: true });
				return;
			}
			try {
				await command.execute(interaction);
			}
			catch (error) {
				console.error(error);
				await interaction.reply({ content: 'There was an error executing this command!', ephemeral: true });
			}
		}

		if (interaction.isModalSubmit()) {
			if (interaction.user.id == '263370287838396416') {
				await interaction.reply({ content: `${interaction.user.username} cock size is microscopic` });
			}
			await interaction.reply({ content: `${interaction.user.username} cock size is ${interaction.fields.getTextInputValue('cocksize') }`, ephemeral: false });
		}
	}

	public static loader(client: Client) {
		new EventHandler({
			client: client,
			eventName: 'interactionCreate',
			callback: InteractionHandler.execute,
			enabled: true,
			once: false,
		});
	}
}

module.exports.loader = InteractionHandler.loader;