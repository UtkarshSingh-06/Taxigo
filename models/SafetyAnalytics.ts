import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISafetyAnalytics extends Document {
  userId?: mongoose.Types.ObjectId;
  driverId?: mongoose.Types.ObjectId;
  tripId?: mongoose.Types.ObjectId;
  safetyScore: number; // 0-100 scale
  riskFactors: {
    weather: number; // 0-1
    traffic: number; // 0-1
    timeOfDay: number; // 0-1
    routeComplexity: number; // 0-1
    driverHistory?: number; // 0-1
    vehicleCondition?: number; // 0-1
  };
  predictions: {
    accidentProbability: number; // 0-1
    delayProbability: number; // 0-1
    routeSafety: number; // 0-100
  };
  recommendations: Array<{
    type: 'route_change' | 'time_adjustment' | 'driver_change' | 'safety_alert';
    priority: 'low' | 'medium' | 'high';
    message: string;
    action?: string;
  }>;
  alerts: Array<{
    type: 'weather' | 'traffic' | 'route' | 'driver';
    severity: 'info' | 'warning' | 'critical';
    message: string;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const SafetyAnalyticsSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    driverId: {
      type: Schema.Types.ObjectId,
      ref: 'Driver',
    },
    tripId: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
    },
    safetyScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    riskFactors: {
      weather: { type: Number, default: 0, min: 0, max: 1 },
      traffic: { type: Number, default: 0, min: 0, max: 1 },
      timeOfDay: { type: Number, default: 0, min: 0, max: 1 },
      routeComplexity: { type: Number, default: 0, min: 0, max: 1 },
      driverHistory: { type: Number, min: 0, max: 1 },
      vehicleCondition: { type: Number, min: 0, max: 1 },
    },
    predictions: {
      accidentProbability: { type: Number, default: 0, min: 0, max: 1 },
      delayProbability: { type: Number, default: 0, min: 0, max: 1 },
      routeSafety: { type: Number, default: 0, min: 0, max: 100 },
    },
    recommendations: [
      {
        type: {
          type: String,
          enum: ['route_change', 'time_adjustment', 'driver_change', 'safety_alert'],
        },
        priority: {
          type: String,
          enum: ['low', 'medium', 'high'],
        },
        message: String,
        action: String,
      },
    ],
    alerts: [
      {
        type: {
          type: String,
          enum: ['weather', 'traffic', 'route', 'driver'],
        },
        severity: {
          type: String,
          enum: ['info', 'warning', 'critical'],
        },
        message: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

SafetyAnalyticsSchema.index({ userId: 1 });
SafetyAnalyticsSchema.index({ driverId: 1 });
SafetyAnalyticsSchema.index({ tripId: 1 });
SafetyAnalyticsSchema.index({ safetyScore: 1 });

const SafetyAnalytics: Model<ISafetyAnalytics> =
  mongoose.models.SafetyAnalytics ||
  mongoose.model<ISafetyAnalytics>('SafetyAnalytics', SafetyAnalyticsSchema);

export default SafetyAnalytics;

