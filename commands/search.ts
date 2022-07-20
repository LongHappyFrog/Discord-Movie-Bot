import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, MessageEmbed } from 'discord.js';
import { IMDB, MovieObject } from '../modules/imdb';

interface SearchEmbedData{
    title: string,
    plot: string,
    poster: string,
    language: string,
    country: string,
    type: string,
    rating: string,
	metascore: string,
	rottenTomato: string,
	year: string,
	id: string,
}

class SearchCommand {

	public static data = new SlashCommandBuilder()
		.setName('search')
		.setDescription('Search a movie on IMDB')
		.addStringOption(option =>
			option.setName('film')
				.setDescription('Film Name')
				.setRequired(true));

	public static async execute(interaction: CommandInteraction) {
		let movieData: MovieObject;
		const search = interaction.options.getString('film');
		try {
			movieData = await IMDB.idSearch(await IMDB.idScrape(search));
		}
		catch (err) {
			await interaction.reply({ content: 'No movie was found!', ephemeral: true });
			return;
		}

		const filterData = SearchCommand._filterData(movieData);

		try {
			await interaction.reply({ embeds: [SearchCommand._searchEmbed({
				title: filterData.title,
				plot: filterData.plot,
				poster: filterData.poster,
				language: filterData.language,
				country: filterData.country,
				type: filterData.type,
				rating: filterData.rating,
				metascore: filterData.metascore,
				rottenTomato: filterData.rottenTomato,
				year: movieData.Year,
				id: movieData.imdbID,

			})] });
		}
		catch (err) {
			await interaction.reply({ content: 'Failed to send embed!', ephemeral: true });
		}


	}
	private static _searchEmbed(embedData: SearchEmbedData) {
		const embed = new MessageEmbed();
		embed.setTitle(`${embedData.title} (${embedData.year})`);
		embed.setURL(`https://www.imdb.com/title/${embedData.id}/`);
		embed.setColor('#eec100');
		embed.setDescription(embedData.plot);
		if (embedData.poster != '') {
			embed.setImage(embedData.poster);
		}
		embed.addField('Country', embedData.country, true);
		embed.addField('Languages', embedData.language, true);
		embed.addField('Type', embedData.type, true);
		embed.setFooter({ text: `IMDb: ${embedData.rating} ${(embedData.metascore != '') ? '    Metascore: ' + embedData.metascore : ''} ${(embedData.metascore != '') ? '    Rotten Tomatoes: ' + embedData.rottenTomato : ''}` });
		return embed;
	}

	private static _filterData(movieData: MovieObject) {
		const title = (movieData['Title'] != 'N/A') ? movieData['Title'] : 'No Title';
		const plot = (movieData['Plot'] != 'N/A') ? movieData['Plot'] : 'Plot empty';
		const poster = (movieData['Poster'] != 'N/A') ? movieData['Poster'] : '';
		const language = (movieData['Language'] != 'N/A') ? movieData['Language'] : 'Empty';
		const country = (movieData['Country'] != 'N/A') ? movieData['Country'] : 'Empty';
		const type = (movieData['Type'] != 'N/A') ? movieData['Type'].charAt(0).toUpperCase() + movieData['Type'].slice(1) : 'Empty';
		const rating = (movieData['imdbRating'] != 'N/A') ? movieData['imdbRating'] : 'No rating';
		const metascore = (movieData['Metascore'] != 'N/A') ? movieData['Metascore'] : '';

		const rottenTomatoeF = movieData.Ratings.filter(x => x.Source === 'Rotten Tomatoes');
		const rottenTomatoe = (rottenTomatoeF.length == 1) ? rottenTomatoeF[0].Value : '';


		return { title: title, plot: plot, poster: poster, language: language, country: country, type: type, rating: rating, metascore: metascore, rottenTomato: rottenTomatoe };
	}
}

module.exports.data = SearchCommand.data;
module.exports.execute = SearchCommand.execute;