import { Client, MessageEmbed, TextChannel } from 'discord.js';
import { ActiveMovies } from '../database/models/activeMovies';
import { ActiveReviews } from '../database/models/activeReviews';
import { EventHandler } from '../handlers/eventHandler';
import { logger, LoggingCateogries, LoggingTypes } from '../logger/logger';

class Ready {

	public static async execute(client: Client) {
		await Ready._checkActiveReviews(client);
		await Ready._checkActiveMovies(client);
		logger({
			message: `Ready! Logged in as ${client.user.tag}`,
			category: LoggingCateogries.LOGIN,
			type: LoggingTypes.INFO,
		});
	}


	private static async _checkActiveReviews(client: Client) {
		logger({
			message: 'Correcting Active Reviews...',
			type: LoggingTypes.INFO,
		});
		let corrected = 0;
		const rows = await ActiveReviews.findAll();
		for (let i = 0; i < rows.length; i++) {
			const msgId = rows[i].messageId;
			const channelId = rows[i].channelId;
			try {
				const channel = await client.channels.fetch(channelId) as TextChannel;
				const message = await channel.messages.fetch(msgId);
				await message.edit({ embeds: [Ready._errorEmbed()] });
				message.reactions.removeAll();
			}
			catch (err) {
			}
			finally {
				await ActiveReviews.destroy({
					where: { messageId: msgId },
				});
				corrected++;

			}
		}
		logger({
			message: `${rows.length} Reviews ${corrected} Corrected`,
			type: LoggingTypes.INFO,
		});
	}

	private static async _checkActiveMovies(client: Client) {
		logger({
			message: 'Correcting Active Movies...',
			type: LoggingTypes.INFO,
		});
		let corrected = 0;
		const schEventIds: string[] = [];
		client.guilds.cache.forEach(guild => {
			guild.scheduledEvents.cache.forEach(event => {
				schEventIds.push(event.id);
			});
		});
		const rows = await ActiveMovies.findAll();
		const dataEventIds = rows.map(t => t.eventId);
		for (let j = 0; j < dataEventIds.length; j++) {
			if (!schEventIds.includes(dataEventIds[j])) {
				await ActiveMovies.destroy({ where: { eventId: dataEventIds[j] } });
				corrected++;
			}
		}
		logger({
			message: `${rows.length} Movies ${corrected} Corrected`,
			type: LoggingTypes.INFO,
		});
	}

	private	static _errorEmbed() {
		const embed = new MessageEmbed();
		embed.setColor('RED');
		embed.setTitle('Error has occurred');
		embed.setDescription('Restart the review');
		return embed;
	}

	public static loader(client: Client) {
		new EventHandler({
			client: client,
			eventName: 'ready',
			callback: Ready.execute,
			enabled: true,
			once: true,
		});
	}
}

module.exports.loader = Ready.loader;
