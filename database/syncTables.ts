import { logger, LoggingTypes, LoggingCateogries } from '../logger/logger';
import { ActiveMovies } from './models/activeMovies';
import { ActiveReviews } from './models/activeReviews';
import { CompletedMovies } from './models/completedMovies';
import { Servers } from './models/guilds';

export function syncTables(force: boolean) {
	try {
		Servers.sync({ force: force });
		ActiveMovies.sync({ force: force });
		CompletedMovies.sync({ force: force });
		ActiveReviews.sync({ force: force });
		logger({
			message: 'SYNCED TABLES',
			category: LoggingCateogries.DATABASE,
			type: LoggingTypes.VERBOSE,
		});
		if (force) {
			logger({
				message: 'Forced is ENABLED!',
				category: LoggingCateogries.DATABASE,
				type: LoggingTypes.INFO,
			});
		}
	}
	catch (err) {
		logger({
			message: 'Syncing Database Failed',
			category: LoggingCateogries.DATABASE,
			type: LoggingTypes.ERROR,
		});
	}
}

