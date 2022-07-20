import { CommandInteraction, GuildMember } from 'discord.js';
import { ActiveReviews } from '../../database/models/activeReviews';
import { CompletedMovies } from '../../database/models/completedMovies';
import { IMDB, MovieObject } from '../../modules/imdb';
import { StartReview } from '../../modules/StartReview';
import { getSeconds } from '../../utils/getSeconds';

declare module 'discord.js' {
    export interface Client {
        collectors: [ [ ReactionCollector | null, string | null ] ];
    }
}

export class ReviewSubStart {

	public static async execute(interaction: CommandInteraction): Promise<void> {
		const guildMember = <GuildMember>interaction.member;
		const user = await interaction.client.users.fetch(guildMember.id);
		const time = (interaction.options.getString('time') == null) ? false : getSeconds(interaction.options.getString('time'));
		const channel = interaction.channel;
		let movieId: string;
		let movieData: MovieObject;

		// If getSeconds fails
		if (time === 0) { return await interaction.reply({ content: 'Invalid time', ephemeral: true }); }

		try {
			movieId = await IMDB.idScrape(interaction.options.getString('film'));
			movieData = await IMDB.idSearch(movieId);
		}
		catch (err) { return await interaction.reply({ content: 'Movie not found!', ephemeral: true }); }

		const rowComplete = await CompletedMovies.findOne({
			where: {
				movieId: movieId,
				guildId: interaction.guildId,
			},
		});

		const activeReviews = await ActiveReviews.findOne({
			where: {
				movieId: movieId,
				guildId: interaction.guildId,
			},
		});

		if (!rowComplete) { return await interaction.reply({ content: 'Movie has not been watched before!', ephemeral: true }); }
		if (rowComplete.rating != undefined) { return await interaction.reply({ content: 'There is already a review for this movie', ephemeral: true }); }
		if (activeReviews) { return await interaction.reply({ content: 'Review is already active for this movie!', ephemeral: true }); }

		await interaction.reply({ content: 'Review successfully started!', ephemeral: true });
		const review = new StartReview(movieData, user, channel);


		// Send Embed
		if (!await review.sendActiveEmbed()) {
			await interaction.editReply({ content: 'Failed to send embed' });
			return;
		}

		// Add Emotes
		if (!await review.addReactions()) {
			await interaction.editReply({ content: 'Failed to add reactions to message!' });
			return;
		}

		// Add Review to Database
		await ActiveReviews.create({
			messageId: review.message.id,
			channelId: review.channel.id,
			guildId: interaction.guildId,
			movieId: movieId,
		});

		const results = await review.startReactionCollector(interaction.client, time);

		if (results.success == false) { return; }

		await CompletedMovies.update({
			rating: results.fiveStarTotal,
			responseTotal: results.responseTotal,
		}, { where: {
			movieId: movieId,
			guildId: interaction.guildId,
		} });

		if (!review.removeReactions()) {
			await interaction.editReply({ content: 'Failed to remove reactions from embed' });
			return;
		}
		if (!review.sendFinishEmbed(results.fiveStarTotal, results.responseTotal)) {
			await interaction.editReply({ content: 'Failed to send embed!' });
			return;
		}

		await ActiveReviews.destroy({
			where: {
				messageId: review.message.id,
				guildId: interaction.guildId,
			},
		});
	}
}