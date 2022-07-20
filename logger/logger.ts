import chalk, { Chalk } from 'chalk';
import { debug_logging, verbose_logging } from '../config.json';

export enum LoggingCateogries {
	LOGIN,
	DATABASE,
    EVENT_HANDLER,
    COMMAND_HANDLER,
	CONFIG,
	GUILD
}
// Verbose Black
// Debug Blue
// Info Green
// Warning Orange
// Error Red
const LogColors: Record<string, Chalk> = {
	verbose: chalk.bold.black,
	debug: chalk.bold.blue,
	info: chalk.bold.green,
	warning: chalk.hex('#FFA500'), // Orange Color
	error: chalk.bold.red,
};
export enum LoggingTypes {
    VERBOSE,
    DEBUG,
    INFO,
    WARNING,
    ERROR,
}

interface LogOptions {
    message: string,
    category?: LoggingCateogries,
    type?: LoggingTypes,
}

// Main function
export const logger = (options: LogOptions): void => {
	const message = options.message;
	const category = options.category;

	switch (options.type) {
	    case LoggingTypes.VERBOSE:
		    if (!verbose_logging) { return; }
		    return (console.log(`${LogColors.verbose('VERBOSE')} ${message} (${LoggingCateogries[category] ? LoggingCateogries[category] : ''})`));
	    case LoggingTypes.DEBUG:
		    if (!debug_logging) { return; }
		    return (console.log(`${LogColors.debug('DEBUG')} ${message}`));
	    case LoggingTypes.INFO:
		    console.log(`${LogColors.info('INFO')} ${message}`);
		    break;
	    case LoggingTypes.WARNING:
		    console.log(`${LogColors.warning('WARNING')} ${message}`);
		    break;
	    case LoggingTypes.ERROR:
		    console.log(`${LogColors.error('ERROR')} (${LoggingCateogries[category]}) ${message}`);
		    break;
	    default:
		    console.log(message);
		break;
	}
};
