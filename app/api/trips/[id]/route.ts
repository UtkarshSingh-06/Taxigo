import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Trip from '@/models/Trip';
import Driver from '@/models/Driver';

// GET - Get single trip
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const trip = await Trip.findById(params.id)
      .populate('userId', 'name email phone')
      .populate('driverId', 'vehicleType vehicleNumber licenseNumber');

    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    return NextResponse.json({ trip }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching trip:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Update trip (assign driver, update status, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { driverId, status, actualFare } = body;

    await connectDB();

    const trip = await Trip.findById(params.id);
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Update trip
    if (driverId) {
      trip.driverId = driverId;
      const driver = await Driver.findById(driverId);
      if (driver) {
        driver.isAvailable = false;
        driver.isOnTrip = true;
        driver.currentTripId = trip._id;
        await driver.save();
      }
    }

    if (status) {
      trip.status = status;

      // If trip is completed, free up the driver
      if (status === 'completed') {
        const driver = await Driver.findById(trip.driverId);
        if (driver) {
          driver.isAvailable = true;
          driver.isOnTrip = false;
          driver.currentTripId = undefined;
          await driver.save();
        }
      }
    }

    if (actualFare !== undefined) {
      trip.actualFare = actualFare;
    }

    await trip.save();

    return NextResponse.json(
      {
        message: 'Trip updated successfully',
        trip,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating trip:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Cancel trip
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const trip = await Trip.findById(params.id);
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Check if user owns the trip
    if (trip.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Free up driver if assigned
    if (trip.driverId) {
      const driver = await Driver.findById(trip.driverId);
      if (driver) {
        driver.isAvailable = true;
        driver.isOnTrip = false;
        driver.currentTripId = undefined;
        await driver.save();
      }
    }

    trip.status = 'cancelled';
    await trip.save();

    return NextResponse.json(
      {
        message: 'Trip cancelled successfully',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error cancelling trip:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

