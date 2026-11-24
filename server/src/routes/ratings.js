import { Router } from 'express';
import { z } from 'zod';
import { Rating } from '../models/Rating.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { getOwnProfile } from '../utils/ownProfile.js';

const ratingSchema = z.object({
  profileId: z.string().length(24),
  tmdbId: z.number().int().positive(),
  value: z.enum(['up', 'down']),
});

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  await getOwnProfile(req.user.id, req.query.profileId);
  res.json(await Rating.find({ profileId: req.query.profileId }));
});

router.put('/', validate(ratingSchema), async (req, res) => {
  const { profileId, tmdbId, value } = req.body;
  await getOwnProfile(req.user.id, profileId);
  const doc = await Rating.findOneAndUpdate(
    { profileId, tmdbId },
    { value },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.json(doc);
});

router.delete('/:profileId/:tmdbId', async (req, res) => {
  await getOwnProfile(req.user.id, req.params.profileId);
  await Rating.deleteOne({ profileId: req.params.profileId, tmdbId: Number(req.params.tmdbId) });
  res.status(204).end();
});

export default router;