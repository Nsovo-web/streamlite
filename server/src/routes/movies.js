import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { tmdbGet } from '../services/tmdbService.js';
import { HttpError } from '../middleware/errorHandler.js';

const router = Router();
router.use(requireAuth);

router.get('/trending', async (req, res) => {
  res.json(await tmdbGet('/trending/movie/week'));
});

router.get('/genres', async (req, res) => {
  res.json(await tmdbGet('/genre/movie/list'));
});

router.get('/genre/:genreId', async (req, res) => {
  res.json(
    await tmdbGet('/discover/movie', {
      with_genres: req.params.genreId,
      sort_by: 'popularity.desc',
      include_adult: false,
    })
  );
});

// /api/movies/search?q=&genre=&year=&page=
router.get('/search', async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const { q, genre, year } = req.query;
  if (q) {
    const params = { query: q, page, include_adult: false };
    if (year) params.primary_release_year = year;
    return res.json(await tmdbGet('/search/movie', params));
  }
  const params = { page, sort_by: 'popularity.desc', include_adult: false };
  if (genre) params.with_genres = genre;
  if (year) params.primary_release_year = year;
  res.json(await tmdbGet('/discover/movie', params));
});

// keep this LAST so it does not swallow the routes above
router.get('/:id', async (req, res) => {
  if (!/^\d+$/.test(req.params.id)) throw new HttpError(400, 'Invalid movie id');
  res.json(await tmdbGet(`/movie/${req.params.id}`, { append_to_response: 'videos,credits' }));
});

export default router;