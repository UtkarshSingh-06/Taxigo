import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDriver extends Document {
  userId: mongoose.Types.ObjectId;
  vehicleType: string;
  vehicleNumber: string;
  licenseNumber: string;
  isAvailable: boolean;
  currentLocation?: {
    lat: number;
    lng: number;
  };
  isOnTrip: boolean;
  currentTripId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DriverSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    vehicleType: {
      type: String,
      required: true,
    },
    vehicleNumber: {
      type: String,
      required: true,
      unique: true,
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    currentLocation: {
      lat: { type: Number },
      lng: { type: Number },
    },
    isOnTrip: {
      type: Boolean,
      default: false,
    },
    currentTripId: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
    },
  },
  {
    timestamps: true,
  }
);

const Driver: Model<IDriver> = mongoose.models.Driver || mongoose.model<IDriver>('Driver', DriverSchema);

export default Driver;

