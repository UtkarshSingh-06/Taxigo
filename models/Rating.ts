import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRating extends Document {
  tripId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  driverId: mongoose.Types.ObjectId;
  rating: number; // 1-5
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RatingSchema: Schema = new Schema(
  {
    tripId: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    driverId: {
      type: Schema.Types.ObjectId,
      ref: 'Driver',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one rating per trip
RatingSchema.index({ tripId: 1 }, { unique: true });

const Rating: Model<IRating> = mongoose.models.Rating || mongoose.model<IRating>('Rating', RatingSchema);

export default Rating;

