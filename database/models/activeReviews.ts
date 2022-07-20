import { Snowflake } from 'discord.js';
import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../connection';

export class ActiveReviews extends Model {
	declare messageId: Snowflake;
	declare channelId: Snowflake;
	declare guildId: Snowflake;
	declare movieId: string;
}

ActiveReviews.init({
	messageId: {
		type: DataTypes.STRING,
		primaryKey: true,
	},
	channelId: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	guildId: {
		type: DataTypes.STRING,
		allowNull: false,
		references: {
			model:'guilds',
			key: 'id',
		},
	},
	movieId: {
		type: DataTypes.STRING,
		allowNull: true,
	},
},
{
	tableName: 'activeReviews',
	sequelize,
},
);