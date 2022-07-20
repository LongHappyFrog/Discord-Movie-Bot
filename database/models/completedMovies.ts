import { Snowflake } from 'discord.js';
import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../connection';

export class CompletedMovies extends Model {
	declare id: number;
	declare movieId: string;
	declare guildId: Snowflake;
	declare title: string;
	declare rating: number;
	declare responseTotal: number;
	declare lastDateWatched: Date;
	declare timesWatched: number;
}

CompletedMovies.init({
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	movieId: {
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
	title: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	rating: {
		type: DataTypes.DOUBLE,
		allowNull: true,
	},
	responseTotal: {
		type: DataTypes.INTEGER,
		allowNull: true,

	},
	lastDateWatched: {
		type: DataTypes.DATEONLY,
		allowNull: false,

	},
	timesWatched: {
		type: DataTypes.INTEGER,
		allowNull: false,
		defaultValue: 1,

	},
},
{
	tableName: 'completedMovies',
	sequelize,
},
);