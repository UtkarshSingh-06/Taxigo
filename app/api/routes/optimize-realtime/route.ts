import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import RouteOptimization from '@/models/RouteOptimization';
import Trip from '@/models/Trip';
import Driver from '@/models/Driver';
import {
  optimizeRoute,
  generateAlternativeRoutes,
  calculateOptimizationScore,
} from '@/lib/route-optimizer';

// POST - Optimize route for a trip
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tripId, driverId } = body;

    if (!tripId) {
      return NextResponse.json({ error: 'Trip ID is required' }, { status: 400 });
    }

    await connectDB();

    const trip = await Trip.findById(tripId).populate('driverId');
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    const origin = trip.origin;
    const destination = trip.destination;

    // Optimize main route
    const optimizedRoute = optimizeRoute(origin, destination);

    // Generate alternative routes
    const alternativeRoutes = generateAlternativeRoutes(origin, destination, 3);

    // Calculate optimization score
    const optimizationScore = calculateOptimizationScore(optimizedRoute);

    // Get or create route optimization record
    let routeOptimization = await RouteOptimization.findOne({
      tripId: trip._id,
      status: 'active',
    });

    if (routeOptimization) {
      // Update existing
      routeOptimization.optimizedRoute = optimizedRoute.route.map((point, index) => ({
        ...point,
        step: index,
      }));
      routeOptimization.distance = optimizedRoute.distance;
      routeOptimization.estimatedTime = optimizedRoute.estimatedTime;
      routeOptimization.trafficFactor = optimizedRoute.trafficFactor;
      routeOptimization.alternativeRoutes = alternativeRoutes.map((alt) => ({
        route: alt.route,
        distance: alt.distance,
        estimatedTime: alt.estimatedTime,
        trafficFactor: alt.trafficFactor,
      }));
      routeOptimization.optimizationScore = optimizationScore;
      await routeOptimization.save();
    } else {
      // Create new
      routeOptimization = await RouteOptimization.create({
        driverId: driverId || trip.driverId,
        tripId: trip._id,
        origin,
        destination,
        optimizedRoute: optimizedRoute.route.map((point, index) => ({
          ...point,
          step: index,
        })),
        distance: optimizedRoute.distance,
        estimatedTime: optimizedRoute.estimatedTime,
        trafficFactor: optimizedRoute.trafficFactor,
        alternativeRoutes: alternativeRoutes.map((alt) => ({
          route: alt.route,
          distance: alt.distance,
          estimatedTime: alt.estimatedTime,
          trafficFactor: alt.trafficFactor,
        })),
        optimizationScore: optimizationScore,
        status: 'active',
      });
    }

    return NextResponse.json(
      {
        message: 'Route optimized successfully',
        routeOptimization,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error optimizing route:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update real-time route data
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { routeOptimizationId, location, trafficCondition, estimatedDelay } = body;

    if (!routeOptimizationId || !location) {
      return NextResponse.json(
        { error: 'Route optimization ID and location are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const routeOptimization = await RouteOptimization.findById(routeOptimizationId);
    if (!routeOptimization) {
      return NextResponse.json({ error: 'Route optimization not found' }, { status: 404 });
    }

    // Add real-time update
    routeOptimization.realTimeUpdates.push({
      timestamp: new Date(),
      location,
      trafficCondition: trafficCondition || 'normal',
      estimatedDelay: estimatedDelay || 0,
    });

    await routeOptimization.save();

    return NextResponse.json(
      {
        message: 'Real-time update added successfully',
        routeOptimization,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating route:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get route optimization for a trip
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tripId = searchParams.get('tripId');

    if (!tripId) {
      return NextResponse.json({ error: 'Trip ID is required' }, { status: 400 });
    }

    await connectDB();

    const routeOptimization = await RouteOptimization.findOne({
      tripId,
      status: 'active',
    })
      .populate('driverId', 'vehicleType vehicleNumber')
      .populate('tripId', 'origin destination');

    if (!routeOptimization) {
      return NextResponse.json({ error: 'Route optimization not found' }, { status: 404 });
    }

    return NextResponse.json({ routeOptimization }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching route optimization:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

