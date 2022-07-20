import { CommandInteraction, Snowflake } from 'discord.js';

export class ReviewSubEnd {
	public static async execute(interaction: CommandInteraction) {
		const collectors = interaction.client.collectors;
		if (collectors == undefined) { return await interaction.reply({ content: 'There is no active reviews', ephemeral: true }); }

		const msgId = <Snowflake>interaction.options.getString('msgid');

		for (let i = 0; i < collectors.length; i++) {
			if (collectors[i][1] == msgId) {
				try {
					collectors[i][0].stop();
					return await interaction.reply({ content: 'Review successfully ended', ephemeral: true });

				}
				catch (err) {
					return await interaction.reply({ content: 'Failed to end review', ephemeral: true });
				}
			}
		}
		return await interaction.reply({ content: 'This message doen\'t contain a review', ephemeral: true });
	}
}

