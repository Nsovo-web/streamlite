import { Profile } from '../models/Profile.js';
import { HttpError } from '../middleware/errorHandler.js';

export async function getOwnProfile(userId, profileId) {
  const profile = await Profile.findOne({ _id: profileId, userId });
  if (!profile) throw new HttpError(404, 'Profile not found');
  return profile;
}