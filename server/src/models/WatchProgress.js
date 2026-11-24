import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema(
  {
    profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
    tmdbId: { type: Number, required: true },
    progressPercent: { type: Number, min: 0, max: 100, required: true },
  },
  { timestamps: true }
);

progressSchema.index({ profileId: 1, tmdbId: 1 }, { unique: true });

export const WatchProgress = mongoose.model('WatchProgress', progressSchema);