import { Guild, Permissions } from 'discord.js';


export function hasEmbedPermission(guild: Guild) {
	return Boolean(guild.me.permissions.has(Permissions.FLAGS.EMBED_LINKS));
}

export function hasReactionPermission(guild: Guild) {
	return Boolean(guild.me.permissions.has(Permissions.FLAGS.ADD_REACTIONS));
}

export function hasMessagePermission(guild: Guild) {
	return Boolean(guild.me.permissions.has(Permissions.FLAGS.SEND_MESSAGES));
}

export function hasManageEventsPermission(guild: Guild) {
	return Boolean(guild.me.permissions.has(Permissions.FLAGS.MANAGE_EVENTS));
}