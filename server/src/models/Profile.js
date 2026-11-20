import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 20 },
    avatar: { type: String, default: 'avatar1' },
    isKids: { type: Boolean, default: false },
    myList: [{ type: Number }], // TMDB ids
  },
  { timestamps: true }
);

export const Profile = mongoose.model('Profile', profileSchema);