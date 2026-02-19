import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Trip from '@/models/Trip';
import Driver from '@/models/Driver';

// Calculate distance between two points (Haversine formula)
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
  return R * c;
}

// Calculate fare (simple pricing: ₹10 per km)
function calculateFare(distance: number): number {
  return Math.round(distance * 10);
}

// GET - Fetch trips
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'my-trips', 'available', 'mid-way-opportunities'

    if (type === 'my-trips') {
      const trips = await Trip.find({ userId: session.user.id })
        .populate('driverId', 'vehicleType vehicleNumber')
        .sort({ createdAt: -1 });
      return NextResponse.json({ trips }, { status: 200 });
    }

    if (type === 'available') {
      // Get available drivers
      const availableDrivers = await Driver.find({
        isAvailable: true,
        isOnTrip: false,
      });
      return NextResponse.json({ drivers: availableDrivers }, { status: 200 });
    }

    if (type === 'mid-way-opportunities') {
      // Find drivers on two-way trips that are in progress
      // These are opportunities for mid-way booking on return journey
      const twoWayTrips = await Trip.find({
        tripType: 'two-way',
        status: 'in-progress',
        driverId: { $exists: true },
      })
        .populate('driverId')
        .populate('userId', 'name email');

      const opportunities = twoWayTrips
        .filter((trip) => trip.driverId && trip.returnOrigin && trip.returnDestination)
        .map((trip) => {
          // Calculate distance from return origin to return destination for mid-way fare
          const returnDistance = calculateDistance(
            trip.returnOrigin!.lat,
            trip.returnOrigin!.lng,
            trip.returnDestination!.lat,
            trip.returnDestination!.lng
          );
          const midWayFare = Math.round(calculateFare(returnDistance) * 0.7); // 30% discount

          return {
            tripId: trip._id.toString(),
            driverId: (trip.driverId as any)._id.toString(),
            origin: trip.returnOrigin,
            destination: trip.returnDestination,
            currentLocation: (trip.driverId as any).currentLocation || trip.returnOrigin,
            estimatedFare: midWayFare,
            scheduledDate: trip.returnDate || trip.scheduledDate,
            scheduledTime: trip.returnTime || trip.scheduledTime,
          };
        });

      return NextResponse.json({ opportunities }, { status: 200 });
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (error: any) {
    console.error('Error fetching trips:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new trip
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      tripType,
      origin,
      destination,
      returnOrigin,
      returnDestination,
      midWayPickup,
      scheduledDate,
      scheduledTime,
      returnDate,
      returnTime,
      parentTripId,
    } = body;

    if (!tripType || !origin || !destination || !scheduledDate || !scheduledTime) {
      return NextResponse.json(
        { error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    await connectDB();

    // Calculate distance
    const distance = calculateDistance(
      origin.lat,
      origin.lng,
      destination.lat,
      destination.lng
    );

    // Calculate fare
    let estimatedFare = calculateFare(distance);

    // For two-way trips, add return fare
    if (tripType === 'two-way' && returnOrigin && returnDestination) {
      const returnDistance = calculateDistance(
        returnOrigin.lat,
        returnOrigin.lng,
        returnDestination.lat,
        returnDestination.lng
      );
      estimatedFare += calculateFare(returnDistance);
    }

    // For mid-way bookings, apply discount
    if (tripType === 'mid-way') {
      estimatedFare = Math.round(estimatedFare * 0.7);
    }

    // Create trip
    const trip = await Trip.create({
      userId: session.user.id,
      tripType,
      origin,
      destination,
      returnOrigin,
      returnDestination,
      midWayPickup,
      distance,
      estimatedFare,
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      returnDate: returnDate ? new Date(returnDate) : undefined,
      returnTime,
      isReturnTrip: false,
      parentTripId,
      status: 'pending',
    });

    // If mid-way booking, link to parent trip
    if (tripType === 'mid-way' && parentTripId) {
      await Trip.findByIdAndUpdate(parentTripId, {
        $push: { midWayPickup: midWayPickup },
      });
    }

    return NextResponse.json(
      {
        message: 'Trip created successfully',
        trip,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating trip:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

