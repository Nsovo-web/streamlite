import axios from 'axios';

const tmdb = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  params: { api_key: process.env.TMDB_API_KEY, language: 'en-US' },
  timeout: 8000,
});

const cache = new Map();
const TTL_MS = 10 * 60 * 1000;

export async function tmdbGet(path, params = {}) {
  const key = path + JSON.stringify(params);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.time < TTL_MS) return hit.data;
  const { data } = await tmdb.get(path, { params });
  cache.set(key, { data, time: Date.now() });
  return data;
}