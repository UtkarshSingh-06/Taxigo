import mongoose, { Schema, Document, Model } from 'mongoose';

export type TripType = 'one-way' | 'two-way' | 'mid-way';
export type TripStatus = 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';

export interface ITrip extends Document {
  userId: mongoose.Types.ObjectId;
  driverId?: mongoose.Types.ObjectId;
  tripType: TripType;
  status: TripStatus;
  origin: {
    address: string;
    lat: number;
    lng: number;
  };
  destination: {
    address: string;
    lat: number;
    lng: number;
  };
  returnOrigin?: {
    address: string;
    lat: number;
    lng: number;
  };
  returnDestination?: {
    address: string;
    lat: number;
    lng: number;
  };
  midWayPickup?: {
    address: string;
    lat: number;
    lng: number;
  };
  distance: number; // in km
  estimatedFare: number;
  actualFare?: number;
  scheduledDate: Date;
  scheduledTime: string;
  returnDate?: Date;
  returnTime?: string;
  isReturnTrip: boolean;
  parentTripId?: mongoose.Types.ObjectId; // For mid-way bookings
  createdAt: Date;
  updatedAt: Date;
}

const TripSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    driverId: {
      type: Schema.Types.ObjectId,
      ref: 'Driver',
    },
    tripType: {
      type: String,
      enum: ['one-way', 'two-way', 'mid-way'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    origin: {
      address: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    destination: {
      address: { type: String, required: true },
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    returnOrigin: {
      address: { type: String },
      lat: { type: Number },
      lng: { type: Number },
    },
    returnDestination: {
      address: { type: String },
      lat: { type: Number },
      lng: { type: Number },
    },
    midWayPickup: {
      address: { type: String },
      lat: { type: Number },
      lng: { type: Number },
    },
    distance: {
      type: Number,
      required: true,
    },
    estimatedFare: {
      type: Number,
      required: true,
    },
    actualFare: {
      type: Number,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    scheduledTime: {
      type: String,
      required: true,
    },
    returnDate: {
      type: Date,
    },
    returnTime: {
      type: String,
    },
    isReturnTrip: {
      type: Boolean,
      default: false,
    },
    parentTripId: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
    },
  },
  {
    timestamps: true,
  }
);

const Trip: Model<ITrip> = mongoose.models.Trip || mongoose.model<ITrip>('Trip', TripSchema);

export default Trip;

