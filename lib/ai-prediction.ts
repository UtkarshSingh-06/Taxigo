/**
 * AI-Based Demand Prediction Algorithm
 * Uses multiple factors to predict ride demand
 */

interface PredictionFactors {
  historicalData: number;
  weather: number;
  events: number;
  timeOfDay: number;
  dayOfWeek: number;
}

export function predictDemand(
  location: { lat: number; lng: number },
  timeWindow: { start: Date; end: Date },
  historicalData?: any[]
): { demand: number; confidence: number; factors: PredictionFactors } {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday

  // Time of day factor (peak hours have higher demand)
  let timeOfDayFactor = 0.3; // Base
  if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
    timeOfDayFactor = 0.9; // Rush hours
  } else if (hour >= 10 && hour <= 16) {
    timeOfDayFactor = 0.6; // Daytime
  } else if (hour >= 20 && hour <= 23) {
    timeOfDayFactor = 0.7; // Evening
  } else {
    timeOfDayFactor = 0.4; // Night/Early morning
  }

  // Day of week factor (weekends and Fridays have higher demand)
  let dayOfWeekFactor = 0.5;
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    dayOfWeekFactor = 0.9; // Weekend
  } else if (dayOfWeek === 5) {
    dayOfWeekFactor = 0.8; // Friday
  } else {
    dayOfWeekFactor = 0.6; // Weekday
  }

  // Historical data factor (if available)
  let historicalFactor = 0.5;
  if (historicalData && historicalData.length > 0) {
    const avgDemand = historicalData.reduce((sum, d) => sum + (d.demand || 0), 0) / historicalData.length;
    historicalFactor = Math.min(avgDemand / 100, 1);
  }

  // Weather factor (simulated - in production, use weather API)
  const weatherFactor = 0.6; // Default moderate weather

  // Events factor (simulated - in production, check event calendars)
  const eventsFactor = 0.5; // Default no major events

  // Calculate weighted demand prediction
  const factors: PredictionFactors = {
    historicalData: historicalFactor,
    weather: weatherFactor,
    events: eventsFactor,
    timeOfDay: timeOfDayFactor,
    dayOfWeek: dayOfWeekFactor,
  };

  // Weighted average
  const demand =
    factors.historicalData * 0.3 +
    factors.weather * 0.1 +
    factors.events * 0.1 +
    factors.timeOfDay * 0.3 +
    factors.dayOfWeek * 0.2;

  // Calculate confidence based on data availability
  let confidence = 0.5;
  if (historicalData && historicalData.length > 10) {
    confidence = 0.9;
  } else if (historicalData && historicalData.length > 5) {
    confidence = 0.7;
  }

  return {
    demand: Math.round(demand * 100),
    confidence,
    factors,
  };
}

/**
 * Calculate recommended number of drivers based on predicted demand
 */
export function calculateRecommendedDrivers(predictedDemand: number, area: number = 10): number {
  // Assume 1 driver can handle ~5-10 rides per hour in a 10km² area
  const driversPerDemandUnit = 0.1;
  const baseDrivers = Math.ceil(predictedDemand * driversPerDemandUnit);
  
  // Add buffer for peak times
  const buffer = Math.ceil(baseDrivers * 0.2);
  
  return Math.max(1, baseDrivers + buffer);
}

/**
 * Predict optimal driver allocation across multiple locations
 */
export function optimizeDriverAllocation(
  predictions: Array<{ location: { lat: number; lng: number }; demand: number }>,
  availableDrivers: number
): Array<{ location: { lat: number; lng: number }; allocatedDrivers: number }> {
  const totalDemand = predictions.reduce((sum, p) => sum + p.demand, 0);
  
  return predictions.map((prediction) => {
    const demandRatio = prediction.demand / totalDemand;
    const allocatedDrivers = Math.max(1, Math.round(availableDrivers * demandRatio));
    return {
      location: prediction.location,
      allocatedDrivers,
    };
  });
}

