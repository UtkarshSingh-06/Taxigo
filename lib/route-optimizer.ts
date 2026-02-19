/**
 * Real-Time Route Optimization Algorithm
 * Optimizes routes based on traffic, distance, and real-time conditions
 */

interface RoutePoint {
  lat: number;
  lng: number;
}

interface RouteOption {
  route: RoutePoint[];
  distance: number;
  estimatedTime: number;
  trafficFactor: number;
  safetyScore: number;
}

/**
 * Calculate distance between two points (Haversine formula)
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Optimize route considering multiple factors
 */
export function optimizeRoute(
  origin: RoutePoint,
  destination: RoutePoint,
  waypoints?: RoutePoint[],
  trafficData?: any
): RouteOption {
  // Calculate base distance
  let totalDistance = calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng);
  
  // If waypoints exist, calculate total distance
  if (waypoints && waypoints.length > 0) {
    totalDistance = calculateDistance(origin.lat, origin.lng, waypoints[0].lat, waypoints[0].lng);
    for (let i = 0; i < waypoints.length - 1; i++) {
      totalDistance += calculateDistance(
        waypoints[i].lat,
        waypoints[i].lng,
        waypoints[i + 1].lat,
        waypoints[i + 1].lng
      );
    }
    totalDistance += calculateDistance(
      waypoints[waypoints.length - 1].lat,
      waypoints[waypoints.length - 1].lng,
      destination.lat,
      destination.lng
    );
  }

  // Estimate traffic factor (0 = no traffic, 1 = heavy traffic)
  const trafficFactor = trafficData?.factor || 0.3; // Default moderate traffic
  
  // Calculate estimated time (assuming average speed of 40 km/h, adjusted for traffic)
  const baseSpeed = 40; // km/h
  const adjustedSpeed = baseSpeed * (1 - trafficFactor * 0.5);
  const estimatedTime = (totalDistance / adjustedSpeed) * 60; // Convert to minutes

  // Generate route points (simplified - in production, use Google Maps Directions API)
  const route: RoutePoint[] = [origin];
  if (waypoints) {
    route.push(...waypoints);
  }
  route.push(destination);

  // Calculate safety score based on route complexity
  const routeComplexity = waypoints ? waypoints.length * 0.1 : 0.1;
  const safetyScore = Math.max(0, 100 - routeComplexity * 50 - trafficFactor * 30);

  return {
    route,
    distance: Math.round(totalDistance * 100) / 100,
    estimatedTime: Math.round(estimatedTime),
    trafficFactor,
    safetyScore: Math.round(safetyScore),
  };
}

/**
 * Generate alternative routes
 */
export function generateAlternativeRoutes(
  origin: RoutePoint,
  destination: RoutePoint,
  count: number = 3
): RouteOption[] {
  const routes: RouteOption[] = [];
  
  // Direct route
  routes.push(optimizeRoute(origin, destination));
  
  // Generate alternative routes with slight variations
  for (let i = 1; i < count; i++) {
    // Create waypoint slightly offset
    const midLat = (origin.lat + destination.lat) / 2 + (Math.random() - 0.5) * 0.01;
    const midLng = (origin.lng + destination.lng) / 2 + (Math.random() - 0.5) * 0.01;
    
    const waypoint: RoutePoint = { lat: midLat, lng: midLng };
    routes.push(optimizeRoute(origin, destination, [waypoint]));
  }
  
  // Sort by estimated time
  return routes.sort((a, b) => a.estimatedTime - b.estimatedTime);
}

/**
 * Calculate optimization score (0-100)
 */
export function calculateOptimizationScore(route: RouteOption): number {
  // Factors: distance (40%), time (40%), safety (20%)
  const maxDistance = 100; // Assume max distance for normalization
  const maxTime = 120; // Assume max time in minutes
  
  const distanceScore = Math.max(0, 100 - (route.distance / maxDistance) * 100);
  const timeScore = Math.max(0, 100 - (route.estimatedTime / maxTime) * 100);
  const safetyScore = route.safetyScore;
  
  return Math.round(
    distanceScore * 0.4 + timeScore * 0.4 + safetyScore * 0.2
  );
}

