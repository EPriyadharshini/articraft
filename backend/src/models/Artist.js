import mongoose from 'mongoose';

const artistSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    bio: { type: String, trim: true, maxlength: 2000, default: '' },
    location: { type: String, trim: true, maxlength: 120, default: '' },
    specialization: { type: String, trim: true, maxlength: 120, default: '' },
    socials: {
      instagram: { type: String, trim: true, maxlength: 120 },
      website: { type: String, trim: true, maxlength: 200 },
      facebook: { type: String, trim: true, maxlength: 200 },
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviewCount: { type: Number, min: 0, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Artist', artistSchema);
