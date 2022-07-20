import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, GuildMember } from 'discord.js';
import { hasReviewPermission } from '../permissions/reviewPerms';
import { ReviewSubStart } from '../commands/reviewSub/start';
import { ReviewSubEnd } from './reviewSub/end';

class ReviewCommand {

	public static data = new SlashCommandBuilder()
		.setName('review')
		.setDescription('Review a show')
		.addSubcommand(subcommand =>
			subcommand
				.setName('start')
				.setDescription('Start a review for a completed film')
				.addStringOption(option =>
					option.setName('film')
						.setDescription('Film name')
						.setRequired(true))
				.addStringOption(option =>
					option.setName('time')
						.setDescription('Review length (1d, 5h, 5m)')
						.setRequired(false)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('end')
				.setDescription('End a review')
				.addStringOption(option =>
					option.setName('msgid')
						.setDescription('Message id of the review')
						.setRequired(true)));
		// review end (msgId)
	public static async execute(interaction: CommandInteraction) {
		const guildMember = <GuildMember>interaction.member;
		if (!hasReviewPermission(guildMember)) {
			await interaction.reply({ content: 'You do not have permission to run this command!', ephemeral: true });
			return;
		}
		// review start (movie) (time)
		if (interaction.options.getSubcommand() == 'start') {
			ReviewSubStart.execute(interaction);
		}
		else if (interaction.options.getSubcommand() == 'end') {
			ReviewSubEnd.execute(interaction);
		}
	}
}
module.exports.data = ReviewCommand.data;
module.exports.execute = ReviewCommand.execute;