import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { omdb_key } from '../config.json';


export class IMDB {

	private static readonly base_url = `http://www.omdbapi.com/?apikey=${omdb_key}`;

	public static async idScrape(title: string): Promise<string> {
		const url = `http://www.imdb.com/find?s=all&q=${encodeURIComponent(title)}`;
		const body = await fetch(url);
		const response = await body.text();
		const $ = await cheerio.load(response);
		const movieLink = $('#main > .article >  .findSection > .findList > tbody').find('td').find('a').attr('href');
		const regex = /\/title\/(t{2}\d+)\/?/;
		const [, movieId] = regex.exec(movieLink);
		return movieId;
	}

	public static async idSearch(id: string): Promise<MovieObject> {
		const url = `${this.base_url}i=${id}`;
		const response = await fetch(url);
		const movieData = await response.json();
		// if (movieData['Response'] == 'False') { throw 'Movie not found'; }
	    return movieData;
	}
}

export interface MovieObject {
    Title: string,
    Year: string,
    Rated: string,
    Released: string,
    Runtime: string,
    Genre: string,
    Director: string,
    Writer: string,
    Actors: string,
    Plot: string,
    Language: string,
    Country: string,
    Awards: string,
    Poster: string,
    Ratings: Array<Ratings>,
    Metascore: string,
    imdbRating: string,
    imdbVotes: string,
    imdbID: string,
    Type: string,
    DVD: string,
    BoxOffice: string,
    Production: string,
    Website: string,
    Response: string,
}

interface Ratings {
    Source: string,
    Value: string
}

