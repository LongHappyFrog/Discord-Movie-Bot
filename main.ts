import { discord_token } from './config.json';
import { Bot } from './bot';
import { LoadEvents } from './handlers/eventHandler';
import { LoadCommands } from './handlers/commandHandler';
import { checkConfig } from './utils/validateConfig';
import { syncTables } from './database/syncTables';

declare module 'discord.js' {
    export interface Client {
        collectors: [ [ ReactionCollector, string ] ];
    }
}

checkConfig();
syncTables(false);
const bot = new Bot();
const loadCommands = new LoadCommands();
const commandCollection = loadCommands.commands;

new LoadEvents(bot.client, commandCollection);

bot.login(discord_token);