import { ReactionCollector, Message, MessageEmbed, MessageReaction, User, GuildTextBasedChannel, Client, TextChannel } from 'discord.js';
import { MovieObject } from './imdb';

declare module 'discord.js' {
    export interface Client {
        collectors: [ [ ReactionCollector | null, string | null ] ];
    }
}

export class StartReview {

	public collector: ReactionCollector;
	public user: User;
	public movieData: MovieObject;
	public message: Message;
	public channel: GuildTextBasedChannel;
	public title: string;
	public poster: string;


	constructor(movieData: MovieObject, user: User, channel: GuildTextBasedChannel) {
		this.movieData = movieData;
		this.user = user;
		this.channel = channel;
		this.title = (movieData['Title'] != 'N/A') ? movieData['Title'] : 'No Title';
		this.poster = (movieData['Poster'] != 'N/A') ? movieData['Poster'] : '';
	}

	public async sendActiveEmbed(): Promise<boolean> {
		try {
			this.message = await this.channel.send({ embeds: [this.activeEmbed()] });
			return true;
		}
		catch (err) {
			return false;
		}
	}

	public async sendFinishEmbed(fiveStarTotal: number, responseTotal: number): Promise<boolean> {
		try {
			this.message = await this.message.edit({ embeds: [await this.finishEmbed(fiveStarTotal, responseTotal)] });
			return true;
		}
		catch (err) {
			return false;
		}
	}

	public activeEmbed(): MessageEmbed {
		const embed = new MessageEmbed();
		embed.setColor('GOLD');
		embed.setAuthor({ name: this.user.username, iconURL: this.user.avatarURL() });
		embed.setTitle(this.title);
		embed.setDescription('Rate the Movie');
		if (this.poster != '') { embed.setImage(this.poster); }
		embed.setFooter({ text: 'Leave a review on how much you enjoyed the movie !' });
		return embed;
	}

	public finishEmbed(fiveStarTotal: number, responseTotal: number): MessageEmbed {
		const embed = new MessageEmbed();
		embed.setColor('GOLD');
		embed.setAuthor({ name: this.user.username, iconURL: this.user.avatarURL() });
		embed.setTitle(this.title);
		embed.setDescription('Reviews for this movie have concluded!');
		if (this.poster != '') { embed.setImage(this.poster); }
		embed.addFields(
			{ name: 'Score', value: `${fiveStarTotal.toString()}/5`, inline: true },
			{ name: 'Reviewers', value: responseTotal.toString(), inline: true },
		);
		embed.setFooter({ text: 'Reviews for this movie have concluded!' });
		return embed;
	}

	public errorEmbed(): MessageEmbed {
		const embed = new MessageEmbed();
		embed.setColor('RED');
		embed.setTitle('Error has occurred');
		embed.setDescription('Restart the review');
		return embed;
	}

	public async addReactions(): Promise<boolean> {
		try {
			await this.message.react('1️⃣');
			await this.message.react('2️⃣');
			await this.message.react('3️⃣');
			await this.message.react('4️⃣');
			await this.message.react('5️⃣');
			return true;
		}
		catch (err) {
			return false;
		}
	}

	public async removeReactions(): Promise<boolean> {
		try {
			await this.message.reactions.removeAll();
			return true;
		}
		catch (err) {
			return false;
		}
	}

	public async startReactionCollector(client: Client, seconds: number | boolean): Promise<ReviewData> {
		const userVotes = new Map();
		const filter = (reaction: MessageReaction, user: User): boolean => {
			if (['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣'].includes(reaction.emoji.name) && !user.bot) {
				const hasEmoji = userVotes.get(user.id);
				if (hasEmoji) {
					reaction.message.reactions.resolve(hasEmoji.name).users.remove(user);
					userVotes.set(user.id, reaction.emoji);
				}
				else {
					userVotes.set(user.id, reaction.emoji);
				}
				return true;
			}
			return false;
		};

		const rating = new Promise<ReviewData>(async resolve => {
			this.collector = this.message.createReactionCollector({
				filter,
				[seconds ? 'time' : '']: seconds ? <number>seconds * 1000 : '',
				dispose: true,
			});
			this.collector.on('dispose', (reaction, user) => {
				userVotes.delete(user.id);
			});
			this.collector.on('end', async () => {
				// If message is deleted reject
				try {
					await this.channel.messages.fetch(this.message.id);
				}
				catch (err) {
					resolve({ success: false });
					return;
				}

				const oneCount = this.message.reactions.cache.get('1️⃣').count - 1;
				const twoCount = this.message.reactions.cache.get('2️⃣').count - 1;
				const threeCount = this.message.reactions.cache.get('3️⃣').count - 1;
				const fourCount = this.message.reactions.cache.get('4️⃣').count - 1;
				const fiveCount = this.message.reactions.cache.get('5️⃣').count - 1;

				const scoreTotal = (oneCount * 1) + (twoCount * 2) + (threeCount * 3) + (fourCount * 4) + (fiveCount * 5);
				const responseTotal = oneCount + twoCount + threeCount + fourCount + fiveCount;
				const fiveStarTotal = (scoreTotal != 0) ? scoreTotal / responseTotal : 0;

				resolve({ scoreTotal: scoreTotal, responseTotal: responseTotal, fiveStarTotal: fiveStarTotal, success: true });
			});
			if (client.collectors == undefined) {
				client.collectors = [ [this.collector, this.message.id ]];
			}
			else {
				client.collectors.push([ this.collector, this.message.id ]);
			}
		});
		return rating;
	}
}

interface ReviewData {
	scoreTotal?: number,
	responseTotal?: number,
	fiveStarTotal?: number,
	success: boolean,
}