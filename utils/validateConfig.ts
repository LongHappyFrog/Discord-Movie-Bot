import { discord_token, omdb_key } from '../config.json';
import { logger, LoggingCateogries, LoggingTypes } from '../logger/logger';

export function checkConfig() {
	if (!discord_token) {
		logger({
			message: 'No discord token found in the config file!',
			category: LoggingCateogries.CONFIG,
			type: LoggingTypes.ERROR,
		});
		process.exit();
	}

	if (!omdb_key) {
		logger({
			message: 'No omdb token found in the config file!',
			category: LoggingCateogries.CONFIG,
			type: LoggingTypes.ERROR,
		});
		process.exit();
	}
}