import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDemandPrediction extends Document {
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  predictedDemand: number; // 0-100 scale
  confidence: number; // 0-1 scale
  timeWindow: {
    start: Date;
    end: Date;
  };
  factors: {
    historicalData: number;
    weather: number;
    events: number;
    timeOfDay: number;
    dayOfWeek: number;
  };
  recommendedDrivers: number;
  createdAt: Date;
  updatedAt: Date;
}

const DemandPredictionSchema: Schema = new Schema(
  {
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, required: true },
    },
    predictedDemand: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    timeWindow: {
      start: { type: Date, required: true },
      end: { type: Date, required: true },
    },
    factors: {
      historicalData: { type: Number, default: 0 },
      weather: { type: Number, default: 0 },
      events: { type: Number, default: 0 },
      timeOfDay: { type: Number, default: 0 },
      dayOfWeek: { type: Number, default: 0 },
    },
    recommendedDrivers: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for location-based queries
DemandPredictionSchema.index({ 'location.lat': 1, 'location.lng': 1 });
DemandPredictionSchema.index({ timeWindow: 1 });

const DemandPrediction: Model<IDemandPrediction> =
  mongoose.models.DemandPrediction ||
  mongoose.model<IDemandPrediction>('DemandPrediction', DemandPredictionSchema);

export default DemandPrediction;

