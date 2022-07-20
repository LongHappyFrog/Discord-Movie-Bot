import { GuildMember, Permissions } from 'discord.js';

export function hasReviewPermission(member: GuildMember): boolean {
	return Boolean(member.permissions.has(Permissions.FLAGS.MANAGE_EVENTS));

}