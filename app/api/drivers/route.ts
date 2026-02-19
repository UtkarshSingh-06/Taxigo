import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Driver from '@/models/Driver';
import Trip from '@/models/Trip';

// GET - Get driver profile or available drivers
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'my-profile') {
      const driver = await Driver.findOne({ userId: session.user.id })
        .populate('userId', 'name email phone')
        .populate('currentTripId');

      if (!driver) {
        return NextResponse.json({ error: 'Driver profile not found' }, { status: 404 });
      }

      return NextResponse.json({ driver }, { status: 200 });
    }

    if (type === 'my-trips') {
      const driver = await Driver.findOne({ userId: session.user.id });
      if (!driver) {
        return NextResponse.json({ error: 'Driver profile not found' }, { status: 404 });
      }

      const trips = await Trip.find({ driverId: driver._id })
        .populate('userId', 'name email phone')
        .sort({ createdAt: -1 });

      return NextResponse.json({ trips }, { status: 200 });
    }

    // Get available drivers
    const drivers = await Driver.find({ isAvailable: true, isOnTrip: false })
      .populate('userId', 'name email phone');

    return NextResponse.json({ drivers }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching drivers:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update driver status/location
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { isAvailable, currentLocation } = body;

    await connectDB();

    const driver = await Driver.findOne({ userId: session.user.id });
    if (!driver) {
      return NextResponse.json({ error: 'Driver profile not found' }, { status: 404 });
    }

    if (isAvailable !== undefined) {
      driver.isAvailable = isAvailable;
    }

    if (currentLocation) {
      driver.currentLocation = currentLocation;
    }

    await driver.save();

    return NextResponse.json(
      {
        message: 'Driver status updated successfully',
        driver,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating driver:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

