const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export interface TMDBSearchResult {
  id: number;
  media_type: "movie" | "tv";
  title?: string; // movies
  name?: string; // tv shows
  release_date?: string; // movies
  first_air_date?: string; // tv shows
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
}

export interface TMDBSearchResponse {
  page: number;
  results: TMDBSearchResult[];
  total_pages: number;
  total_results: number;
}

export interface NormalizedTitle {
  tmdb_id: number;
  type: "movie" | "tv";
  name: string;
  year: number | null;
  poster_url: string | null;
  backdrop_url: string | null;
  overview: string | null;
  vote_average: number | null;
}

function getApiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    throw new Error("TMDB_API_KEY is not configured");
  }
  return key;
}

export function getPosterUrl(
  posterPath: string | null,
  size: "w92" | "w154" | "w185" | "w342" | "w500" | "w780" | "original" = "w342"
): string | null {
  if (!posterPath) return null;
  return `${TMDB_IMAGE_BASE}/${size}${posterPath}`;
}

export function getBackdropUrl(
  backdropPath: string | null,
  size: "w300" | "w780" | "w1280" | "original" = "w780"
): string | null {
  if (!backdropPath) return null;
  return `${TMDB_IMAGE_BASE}/${size}${backdropPath}`;
}

export async function searchMulti(query: string): Promise<NormalizedTitle[]> {
  if (!query.trim()) return [];

  const apiKey = getApiKey();
  const url = `${TMDB_BASE_URL}/search/multi?api_key=${apiKey}&query=${encodeURIComponent(
    query
  )}&include_adult=false`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }

  const data: TMDBSearchResponse = await response.json();

  return data.results
    .filter((item) => item.media_type === "movie" || item.media_type === "tv")
    .map((item) => normalizeSearchResult(item));
}

export async function searchMovies(query: string): Promise<NormalizedTitle[]> {
  if (!query.trim()) return [];

  const apiKey = getApiKey();
  const url = `${TMDB_BASE_URL}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(
    query
  )}&include_adult=false`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }

  const data = await response.json();

  return data.results.map((item: TMDBSearchResult) => ({
    ...normalizeSearchResult({ ...item, media_type: "movie" }),
  }));
}

export async function searchTV(query: string): Promise<NormalizedTitle[]> {
  if (!query.trim()) return [];

  const apiKey = getApiKey();
  const url = `${TMDB_BASE_URL}/search/tv?api_key=${apiKey}&query=${encodeURIComponent(
    query
  )}&include_adult=false`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }

  const data = await response.json();

  return data.results.map((item: TMDBSearchResult) => ({
    ...normalizeSearchResult({ ...item, media_type: "tv" }),
  }));
}

export async function getMovieDetails(tmdbId: number): Promise<NormalizedTitle | null> {
  const apiKey = getApiKey();
  const url = `${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${apiKey}`;

  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`TMDB API error: ${response.status}`);
  }

  const data = await response.json();

  return {
    tmdb_id: data.id,
    type: "movie",
    name: data.title,
    year: data.release_date ? parseInt(data.release_date.split("-")[0]) : null,
    poster_url: getPosterUrl(data.poster_path),
    backdrop_url: getBackdropUrl(data.backdrop_path),
    overview: data.overview || null,
    vote_average: data.vote_average ?? null,
  };
}

export async function getTVDetails(tmdbId: number): Promise<NormalizedTitle | null> {
  const apiKey = getApiKey();
  const url = `${TMDB_BASE_URL}/tv/${tmdbId}?api_key=${apiKey}`;

  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`TMDB API error: ${response.status}`);
  }

  const data = await response.json();

  return {
    tmdb_id: data.id,
    type: "tv",
    name: data.name,
    year: data.first_air_date ? parseInt(data.first_air_date.split("-")[0]) : null,
    poster_url: getPosterUrl(data.poster_path),
    backdrop_url: getBackdropUrl(data.backdrop_path),
    overview: data.overview || null,
    vote_average: data.vote_average ?? null,
  };
}

function normalizeSearchResult(item: TMDBSearchResult): NormalizedTitle {
  const isMovie = item.media_type === "movie";
  const dateStr = isMovie ? item.release_date : item.first_air_date;

  return {
    tmdb_id: item.id,
    type: item.media_type,
    name: isMovie ? item.title || "" : item.name || "",
    year: dateStr ? parseInt(dateStr.split("-")[0]) : null,
    poster_url: getPosterUrl(item.poster_path),
    backdrop_url: getBackdropUrl(item.backdrop_path),
    overview: item.overview || null,
    vote_average: item.vote_average ?? null,
  };
}
