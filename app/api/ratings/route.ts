import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Rating from '@/models/Rating';
import Trip from '@/models/Trip';
import Driver from '@/models/Driver';

// GET - Get ratings for a driver or trip
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const driverId = searchParams.get('driverId');
    const tripId = searchParams.get('tripId');

    let query: any = {};
    if (driverId) query.driverId = driverId;
    if (tripId) query.tripId = tripId;

    const ratings = await Rating.find(query)
      .populate('userId', 'name')
      .populate('tripId', 'origin destination')
      .sort({ createdAt: -1 });

    // Calculate average rating for driver
    if (driverId) {
      const avgRating = await Rating.aggregate([
        { $match: { driverId: new (await import('mongoose')).Types.ObjectId(driverId) } },
        { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
      ]);

      return NextResponse.json({
        ratings,
        averageRating: avgRating[0]?.avgRating || 0,
        totalRatings: avgRating[0]?.count || 0,
      });
    }

    return NextResponse.json({ ratings }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching ratings:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a rating
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tripId, rating, review } = body;

    if (!tripId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Please provide valid trip ID and rating (1-5)' },
        { status: 400 }
      );
    }

    await connectDB();

    // Verify trip exists and belongs to user
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    if (trip.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (trip.status !== 'completed') {
      return NextResponse.json(
        { error: 'Can only rate completed trips' },
        { status: 400 }
      );
    }

    // Check if rating already exists
    const existingRating = await Rating.findOne({ tripId });
    if (existingRating) {
      return NextResponse.json(
        { error: 'Trip already rated' },
        { status: 400 }
      );
    }

    // Create rating
    const newRating = await Rating.create({
      tripId,
      userId: session.user.id,
      driverId: trip.driverId,
      rating,
      review: review || undefined,
    });

    return NextResponse.json(
      {
        message: 'Rating submitted successfully',
        rating: newRating,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating rating:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

