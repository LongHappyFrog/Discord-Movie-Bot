import { Snowflake } from 'discord.js';
import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../connection';

export class ActiveMovies extends Model {
	declare eventId: Snowflake;
	declare guildId: Snowflake;
	declare movieId: string;
	declare title: string;
}

ActiveMovies.init({
	eventId: {
		type: DataTypes.STRING,
		allowNull: false,
		primaryKey: true,
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
	title: {
		type: DataTypes.STRING,

	},
},
{
	tableName: 'activeMovies',
	sequelize,
},
);