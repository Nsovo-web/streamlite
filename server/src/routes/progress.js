import { Router } from 'express';
import { z } from 'zod';
import { WatchProgress } from '../models/WatchProgress.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { getOwnProfile } from '../utils/ownProfile.js';

const progressSchema = z.object({
  profileId: z.string().length(24),
  tmdbId: z.number().int().positive(),
  progressPercent: z.number().min(0).max(100),
});

const router = Router();
router.use(requireAuth);

// "continue watching": unfinished titles, most recent first
router.get('/', async (req, res) => {
  await getOwnProfile(req.user.id, req.query.profileId);
  res.json(
    await WatchProgress.find({ profileId: req.query.profileId, progressPercent: { $lt: 100 } })
      .sort({ updatedAt: -1 })
      .limit(20)
  );
});

router.put('/', validate(progressSchema), async (req, res) => {
  const { profileId, tmdbId, progressPercent } = req.body;
  await getOwnProfile(req.user.id, profileId);
  const doc = await WatchProgress.findOneAndUpdate(
    { profileId, tmdbId },
    { progressPercent },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.json(doc);
});

export default router;