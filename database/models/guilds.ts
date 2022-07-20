import { Snowflake } from 'discord.js';
import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../connection';

export class Servers extends Model {
	declare id: Snowflake;
}

Servers.init({
	id: {
		type: DataTypes.STRING,
		primaryKey: true,
	},
},
{
	tableName: 'guilds',
	sequelize,
},
);