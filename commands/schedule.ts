import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, GuildMember, GuildScheduledEvent } from 'discord.js';
import moment from 'moment';
import { ActiveMovies } from '../database/models/activeMovies';
import { Servers } from '../database/models/guilds';
import { IMDB, MovieObject } from '../modules/imdb';
import { hasReviewPermission } from '../permissions/reviewPerms';


class ScheduleCommand {

	public static data = new SlashCommandBuilder()
		.setName('schedule')
		.setDescription('Check details of a watched film')
		.addStringOption(option =>
			option.setName('film')
				.setDescription('Film Name or IMDb Id')
				.setRequired(true))
		.addChannelOption(option =>
			option.setName('channel')
				.addChannelType(2)
				.setDescription('Voice channel for the event')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('date')
				.setDescription('Date for the movie MM/DD/YY (UTC)')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('time')
				.setDescription('Time for the movie hh:mm AM/PM(UTC)')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('title')
				.setDescription('Extra title (Placed after the movie title)')
				.setRequired(false))
		.addStringOption(option =>
			option.setName('desc')
				.setDescription('Extra description (Placed before the movie plot)')
				.setRequired(false));

	// review end (msgId)
	public static async execute(interaction: CommandInteraction) {
		const guildMember = <GuildMember>interaction.member;
		const filmInput = interaction.options.getString('film');
		const channelInput = interaction.options.getChannel('channel');
		const dateInput = interaction.options.getString('date');
		const timeInput = interaction.options.getString('time');
		const titleInput = interaction.options.getString('title') ? interaction.options.getString('title') : '';
		const descInput = interaction.options.getString('desc') ? interaction.options.getString('desc') : '';
		let movieData: MovieObject;
		let guildEvent: GuildScheduledEvent;

		if (!hasReviewPermission(guildMember)) {
			return await interaction.reply({ content: 'You do not have permission to run this command!', ephemeral: true });
			return;
		}

		const combined = moment.utc(dateInput + ' ' + timeInput, 'MM/DD/YY HH:mm A');

		// Check to make sure the format is valid
		if (!combined.isValid()) {
			await interaction.reply({ content: 'Invalid date/time format!', ephemeral: true });
			return;
		}


		// Check if the date is in the past
		if (combined.isBefore(moment.utc())) {
			await interaction.reply({ content: 'Date has already passed!', ephemeral: true });
			return;
		}

		try {
			movieData = await IMDB.idSearch(await IMDB.idScrape(filmInput));
		}
		catch (err) {
			try {
				await interaction.guild.scheduledEvents.create({
					name: `${filmInput} ${titleInput}`,
					description: descInput,
					scheduledStartTime: combined.toDate(),
					privacyLevel: 'GUILD_ONLY',
					entityType: 'VOICE',
					channel: channelInput.id,
				});
				await interaction.reply({ content: 'No movie was found, custom movie scheduled!', ephemeral: true });
			}
			catch (err2) {
				await interaction.reply({ content: 'Error creating event, bot missing ManageEvents permission!', ephemeral: true });
			}
			finally {
				return;
			}
		}

		try {
			guildEvent = await interaction.guild.scheduledEvents.create({
				name: `${movieData.Title} ${titleInput}`,
				description: `${descInput}\n\n${movieData.Plot}`,
				scheduledStartTime: combined.toDate(),
				privacyLevel: 'GUILD_ONLY',
				entityType: 'VOICE',
				channel: channelInput.id,
			});
		}
		catch (err) {
			await interaction.reply({ content: 'Error creating event, bot missing ManageEvents permission!', ephemeral: true });
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


		// Add guild to active movies table.
		await ActiveMovies.create({
			eventId: guildEvent.id,
			guildId: guildEvent.guildId,
			movieId: movieData.imdbID,
			title: movieData.Title,
		});
		await interaction.reply({ content: 'Movie successfully scheduled!', ephemeral: true });

	}
}
module.exports.data = ScheduleCommand.data;
module.exports.execute = ScheduleCommand.execute;
