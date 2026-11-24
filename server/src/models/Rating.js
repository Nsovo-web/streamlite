import mongoose from 'mongoose';

const ratingSchema = new mongoose.Schema(
  {
    profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
    tmdbId: { type: Number, required: true },
    value: { type: String, enum: ['up', 'down'], required: true },
  },
  { timestamps: true }
);

// one rating per profile per title
ratingSchema.index({ profileId: 1, tmdbId: 1 }, { unique: true });

export const Rating = mongoose.model('Rating', ratingSchema);