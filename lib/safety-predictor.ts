/**
 * Predictive Analytics for Rider and Driver Safety
 * Analyzes multiple risk factors to predict safety scores
 */

interface RiskFactors {
  weather: number;
  traffic: number;
  timeOfDay: number;
  routeComplexity: number;
  driverHistory?: number;
  vehicleCondition?: number;
}

interface SafetyPrediction {
  safetyScore: number;
  accidentProbability: number;
  delayProbability: number;
  routeSafety: number;
  recommendations: Array<{
    type: string;
    priority: 'low' | 'medium' | 'high';
    message: string;
    action?: string;
  }>;
  alerts: Array<{
    type: string;
    severity: 'info' | 'warning' | 'critical';
    message: string;
  }>;
}

/**
 * Predict safety score based on risk factors
 */
export function predictSafety(riskFactors: RiskFactors): SafetyPrediction {
  // Calculate base safety score (0-100)
  let safetyScore = 100;
  
  // Weather impact (0 = perfect, 1 = severe)
  safetyScore -= riskFactors.weather * 20;
  
  // Traffic impact
  safetyScore -= riskFactors.traffic * 15;
  
  // Time of day impact (night driving is riskier)
  const hour = new Date().getHours();
  if (hour >= 22 || hour <= 5) {
    safetyScore -= riskFactors.timeOfDay * 25;
  } else {
    safetyScore -= riskFactors.timeOfDay * 10;
  }
  
  // Route complexity impact
  safetyScore -= riskFactors.routeComplexity * 15;
  
  // Driver history impact (if available)
  if (riskFactors.driverHistory !== undefined) {
    safetyScore -= riskFactors.driverHistory * 20;
  }
  
  // Vehicle condition impact (if available)
  if (riskFactors.vehicleCondition !== undefined) {
    safetyScore -= riskFactors.vehicleCondition * 15;
  }
  
  safetyScore = Math.max(0, Math.min(100, safetyScore));
  
  // Calculate accident probability (inverse of safety score)
  const accidentProbability = (100 - safetyScore) / 100;
  
  // Calculate delay probability based on traffic and weather
  const delayProbability = Math.min(1, (riskFactors.traffic * 0.6 + riskFactors.weather * 0.4));
  
  // Route safety score (similar to safety score but route-specific)
  const routeSafety = Math.max(0, 100 - riskFactors.routeComplexity * 30 - riskFactors.traffic * 20);
  
  // Generate recommendations
  const recommendations: SafetyPrediction['recommendations'] = [];
  const alerts: SafetyPrediction['alerts'] = [];
  
  // Weather recommendations
  if (riskFactors.weather > 0.7) {
    recommendations.push({
      type: 'route_change',
      priority: 'high',
      message: 'Severe weather conditions detected. Consider delaying trip or taking safer route.',
      action: 'delay_trip',
    });
    alerts.push({
      type: 'weather',
      severity: 'critical',
      message: 'Severe weather warning',
    });
  } else if (riskFactors.weather > 0.4) {
    recommendations.push({
      type: 'route_change',
      priority: 'medium',
      message: 'Moderate weather conditions. Drive carefully.',
    });
    alerts.push({
      type: 'weather',
      severity: 'warning',
      message: 'Weather advisory',
    });
  }
  
  // Traffic recommendations
  if (riskFactors.traffic > 0.8) {
    recommendations.push({
      type: 'route_change',
      priority: 'high',
      message: 'Heavy traffic detected. Alternative route recommended.',
      action: 'change_route',
    });
    alerts.push({
      type: 'traffic',
      severity: 'warning',
      message: 'Heavy traffic ahead',
    });
  }
  
  // Time-based recommendations
  if (hour >= 22 || hour <= 5) {
    recommendations.push({
      type: 'safety_alert',
      priority: 'medium',
      message: 'Night driving detected. Extra caution recommended.',
    });
  }
  
  // Driver history recommendations
  if (riskFactors.driverHistory !== undefined && riskFactors.driverHistory > 0.5) {
    recommendations.push({
      type: 'driver_change',
      priority: 'high',
      message: 'Driver history indicates higher risk. Consider alternative driver.',
      action: 'change_driver',
    });
    alerts.push({
      type: 'driver',
      severity: 'warning',
      message: 'Driver risk assessment',
    });
  }
  
  // Route complexity recommendations
  if (riskFactors.routeComplexity > 0.7) {
    recommendations.push({
      type: 'route_change',
      priority: 'medium',
      message: 'Complex route detected. Simpler alternative available.',
      action: 'change_route',
    });
  }
  
  // Low safety score alert
  if (safetyScore < 50) {
    alerts.push({
      type: 'route',
      severity: 'critical',
      message: 'Low safety score. Trip not recommended.',
    });
  }
  
  return {
    safetyScore: Math.round(safetyScore),
    accidentProbability: Math.round(accidentProbability * 100) / 100,
    delayProbability: Math.round(delayProbability * 100) / 100,
    routeSafety: Math.round(routeSafety),
    recommendations,
    alerts,
  };
}

/**
 * Analyze risk factors from trip data
 */
export function analyzeRiskFactors(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  scheduledTime: Date,
  driverHistory?: { accidents: number; violations: number; rating: number },
  vehicleCondition?: { age: number; maintenance: number }
): RiskFactors {
  const hour = scheduledTime.getHours();
  const dayOfWeek = scheduledTime.getDay();
  
  // Weather factor (simulated - in production, use weather API)
  const weatherFactor = 0.3; // Default moderate weather
  
  // Traffic factor (simulated - in production, use traffic API)
  let trafficFactor = 0.3;
  if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
    trafficFactor = 0.8; // Rush hour
  }
  
  // Time of day factor
  let timeOfDayFactor = 0.2;
  if (hour >= 22 || hour <= 5) {
    timeOfDayFactor = 0.8; // Night
  } else if (hour >= 6 && hour <= 8) {
    timeOfDayFactor = 0.6; // Early morning
  }
  
  // Route complexity (simplified - in production, analyze route)
  const distance = Math.sqrt(
    Math.pow(destination.lat - origin.lat, 2) + Math.pow(destination.lng - origin.lng, 2)
  );
  const routeComplexity = Math.min(1, distance * 10); // Normalize
  
  // Driver history factor
  let driverHistoryFactor = 0;
  if (driverHistory) {
    const accidentFactor = Math.min(1, driverHistory.accidents / 5);
    const violationFactor = Math.min(1, driverHistory.violations / 10);
    const ratingFactor = (5 - driverHistory.rating) / 5;
    driverHistoryFactor = (accidentFactor * 0.5 + violationFactor * 0.3 + ratingFactor * 0.2);
  }
  
  // Vehicle condition factor
  let vehicleConditionFactor = 0;
  if (vehicleCondition) {
    const ageFactor = Math.min(1, vehicleCondition.age / 15); // 15 years = max
    const maintenanceFactor = 1 - vehicleCondition.maintenance; // 1 = perfect maintenance
    vehicleConditionFactor = (ageFactor * 0.6 + maintenanceFactor * 0.4);
  }
  
  return {
    weather: weatherFactor,
    traffic: trafficFactor,
    timeOfDay: timeOfDayFactor,
    routeComplexity,
    driverHistory: driverHistoryFactor,
    vehicleCondition: vehicleConditionFactor,
  };
}

