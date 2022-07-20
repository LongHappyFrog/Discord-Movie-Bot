import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { CompletedMovies } from '../database/models/completedMovies';
import { IMDB, MovieObject } from '../modules/imdb';


class SeenCommand {

	public static data = new SlashCommandBuilder()
		.setName('seen')
		.setDescription('Check details of a watched film')
		.addStringOption(option =>
			option.setName('film')
				.setDescription('Film Name or IMDb Id')
				.setRequired(true));

	// review end (msgId)
	public static async execute(interaction: CommandInteraction) {
		let movieData: MovieObject;
		const filmInput = interaction.options.getString('film');
		try {
			movieData = await IMDB.idSearch(await IMDB.idScrape(filmInput));
		}
		catch (err) {
		    await interaction.reply({ content: 'No movie was found!', ephemeral: true });
			return;
		}

		const rowComplete = await CompletedMovies.findOne({
			where: {
				movieId: movieData.imdbID,
				guildId: interaction.guildId,
			},
		});

		if (!rowComplete) {
			await interaction.reply({ content: 'Film has not been watched before.', ephemeral: true });
			return;
		}

		const formatRes = `${rowComplete.title}\n${(rowComplete.timesWatched > 1) ? ' Last ' : ''}Watched: ${rowComplete.lastDateWatched}\n${(rowComplete.rating != undefined) ? `Rating: ${rowComplete.rating} ${rowComplete.responseTotal} Reviewers` : 'Not Reviewed'}`;

		await interaction.reply({ content: formatRes, ephemeral: true });
	}
}
module.exports.data = SeenCommand.data;
module.exports.execute = SeenCommand.execute;