import { Router } from 'express';
import { z } from 'zod';
import { Profile } from '../models/Profile.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { HttpError } from '../middleware/errorHandler.js';
import { getOwnProfile } from '../utils/ownProfile.js';

const MAX_PROFILES = 5;

const createSchema = z.object({
  name: z.string().trim().min(1).max(20),
  isKids: z.boolean().optional(),
  avatar: z.string().optional(),
});
const listSchema = z.object({ tmdbId: z.number().int().positive() });

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  res.json(await Profile.find({ userId: req.user.id }).sort('createdAt'));
});

router.post('/', validate(createSchema), async (req, res) => {
  const count = await Profile.countDocuments({ userId: req.user.id });
  if (count >= MAX_PROFILES) throw new HttpError(400, `Maximum of ${MAX_PROFILES} profiles`);
  const profile = await Profile.create({ ...req.body, userId: req.user.id });
  res.status(201).json(profile);
});

router.delete('/:id', async (req, res) => {
  const profile = await getOwnProfile(req.user.id, req.params.id);
  await profile.deleteOne();
  res.status(204).end();
});

router.get('/:id/list', async (req, res) => {
  const profile = await getOwnProfile(req.user.id, req.params.id);
  res.json(profile.myList);
});

router.post('/:id/list', validate(listSchema), async (req, res) => {
  await getOwnProfile(req.user.id, req.params.id);
  const updated = await Profile.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { myList: req.body.tmdbId } }, // no duplicates
    { new: true }
  );
  res.json(updated.myList);
});

router.delete('/:id/list/:tmdbId', async (req, res) => {
  await getOwnProfile(req.user.id, req.params.id);
  const updated = await Profile.findByIdAndUpdate(
    req.params.id,
    { $pull: { myList: Number(req.params.tmdbId) } },
    { new: true }
  );
  res.json(updated.myList);
});

export default router;