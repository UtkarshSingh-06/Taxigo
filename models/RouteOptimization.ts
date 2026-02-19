import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRouteOptimization extends Document {
  driverId: mongoose.Types.ObjectId;
  tripId: mongoose.Types.ObjectId;
  origin: {
    lat: number;
    lng: number;
    address: string;
  };
  destination: {
    lat: number;
    lng: number;
    address: string;
  };
  optimizedRoute: Array<{
    lat: number;
    lng: number;
    step: number;
    instruction?: string;
  }>;
  distance: number; // in km
  estimatedTime: number; // in minutes
  trafficFactor: number; // 0-1 scale
  alternativeRoutes?: Array<{
    route: Array<{ lat: number; lng: number }>;
    distance: number;
    estimatedTime: number;
    trafficFactor: number;
  }>;
  optimizationScore: number; // 0-100
  realTimeUpdates: Array<{
    timestamp: Date;
    location: { lat: number; lng: number };
    trafficCondition: string;
    estimatedDelay: number; // in minutes
  }>;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const RouteOptimizationSchema: Schema = new Schema(
  {
    driverId: {
      type: Schema.Types.ObjectId,
      ref: 'Driver',
      required: true,
    },
    tripId: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
    origin: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, required: true },
    },
    destination: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, required: true },
    },
    optimizedRoute: [
      {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
        step: { type: Number, required: true },
        instruction: { type: String },
      },
    ],
    distance: {
      type: Number,
      required: true,
    },
    estimatedTime: {
      type: Number,
      required: true,
    },
    trafficFactor: {
      type: Number,
      default: 0.5,
      min: 0,
      max: 1,
    },
    alternativeRoutes: [
      {
        route: [
          {
            lat: Number,
            lng: Number,
          },
        ],
        distance: Number,
        estimatedTime: Number,
        trafficFactor: Number,
      },
    ],
    optimizationScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    realTimeUpdates: [
      {
        timestamp: { type: Date, default: Date.now },
        location: {
          lat: Number,
          lng: Number,
        },
        trafficCondition: String,
        estimatedDelay: Number,
      },
    ],
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

RouteOptimizationSchema.index({ driverId: 1, status: 1 });
RouteOptimizationSchema.index({ tripId: 1 });

const RouteOptimization: Model<IRouteOptimization> =
  mongoose.models.RouteOptimization ||
  mongoose.model<IRouteOptimization>('RouteOptimization', RouteOptimizationSchema);

export default RouteOptimization;

