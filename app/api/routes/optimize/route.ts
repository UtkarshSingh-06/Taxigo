import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST - Optimize route using Google Maps Directions API
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { origin, destination, waypoints } = body;

    if (!origin || !destination) {
      return NextResponse.json(
        { error: 'Please provide origin and destination' },
        { status: 400 }
      );
    }

    // Use Google Maps Directions API if available
    if (process.env.GOOGLE_MAPS_API_KEY) {
      const originStr = `${origin.lat},${origin.lng}`;
      const destinationStr = `${destination.lat},${destination.lng}`;
      let waypointsStr = '';

      if (waypoints && waypoints.length > 0) {
        waypointsStr = waypoints
          .map((wp: { lat: number; lng: number }) => `${wp.lat},${wp.lng}`)
          .join('|');
      }

      const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destinationStr}${waypointsStr ? `&waypoints=${waypointsStr}` : ''}&key=${process.env.GOOGLE_MAPS_API_KEY}&optimize=true`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const leg = route.legs[0];

        // Extract route points
        const routePoints = route.overview_polyline.points
          ? decodePolyline(route.overview_polyline.points)
          : [];

        return NextResponse.json({
          distance: leg.distance.value / 1000, // Convert to km
          duration: leg.duration.value / 60, // Convert to minutes
          route: routePoints,
          optimized: true,
          steps: route.legs.map((leg: any) => ({
            distance: leg.distance.text,
            duration: leg.duration.text,
            instructions: leg.steps.map((step: any) => step.html_instructions),
          })),
        });
      }
    }

    // Fallback: Simple distance calculation
    const distance = calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng);
    const estimatedDuration = distance * 2; // Rough estimate: 2 minutes per km

    return NextResponse.json({
      distance,
      duration: estimatedDuration,
      route: [
        { lat: origin.lat, lng: origin.lng },
        { lat: destination.lat, lng: destination.lng },
      ],
      optimized: false,
      message: 'Using fallback route calculation. Add GOOGLE_MAPS_API_KEY for optimized routes.',
    });
  } catch (error: any) {
    console.error('Error optimizing route:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to decode Google Maps polyline
function decodePolyline(encoded: string): Array<{ lat: number; lng: number }> {
  const poly: Array<{ lat: number; lng: number }> = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b: number;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    poly.push({ lat: lat * 1e-5, lng: lng * 1e-5 });
  }

  return poly;
}

// Calculate distance using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
  return Math.round(R * c * 100) / 100;
}

