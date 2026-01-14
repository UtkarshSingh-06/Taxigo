import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import SafetyAnalytics from '@/models/SafetyAnalytics';
import Trip from '@/models/Trip';
import Driver from '@/models/Driver';
import Rating from '@/models/Rating';
import { predictSafety, analyzeRiskFactors } from '@/lib/safety-predictor';

// POST - Analyze safety for a trip
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tripId } = body;

    if (!tripId) {
      return NextResponse.json({ error: 'Trip ID is required' }, { status: 400 });
    }

    await connectDB();

    const trip = await Trip.findById(tripId).populate('driverId').populate('userId');
    if (!trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Get driver history if available
    let driverHistory;
    if (trip.driverId) {
      const driverRatings = await Rating.find({ driverId: trip.driverId._id });
      const avgRating = driverRatings.length > 0
        ? driverRatings.reduce((sum, r) => sum + r.rating, 0) / driverRatings.length
        : 5;

      driverHistory = {
        accidents: 0, // In production, get from driver records
        violations: 0, // In production, get from driver records
        rating: avgRating,
      };
    }

    // Analyze risk factors
    const riskFactors = analyzeRiskFactors(
      trip.origin,
      trip.destination,
      trip.scheduledDate,
      driverHistory
    );

    // Predict safety
    const safetyPrediction = predictSafety(riskFactors);

    // Save or update safety analytics
    let safetyAnalytics = await SafetyAnalytics.findOne({ tripId: trip._id });

    if (safetyAnalytics) {
      safetyAnalytics.safetyScore = safetyPrediction.safetyScore;
      safetyAnalytics.riskFactors = riskFactors;
      safetyAnalytics.predictions = safetyPrediction;
      safetyAnalytics.recommendations = safetyPrediction.recommendations;
      safetyAnalytics.alerts = safetyPrediction.alerts.map((alert) => ({
        ...alert,
        timestamp: new Date(),
      }));
      await safetyAnalytics.save();
    } else {
      safetyAnalytics = await SafetyAnalytics.create({
        userId: trip.userId?._id,
        driverId: trip.driverId?._id,
        tripId: trip._id,
        safetyScore: safetyPrediction.safetyScore,
        riskFactors,
        predictions: safetyPrediction,
        recommendations: safetyPrediction.recommendations,
        alerts: safetyPrediction.alerts.map((alert) => ({
          ...alert,
          timestamp: new Date(),
        })),
      });
    }

    return NextResponse.json(
      {
        message: 'Safety analysis completed',
        safetyAnalytics,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error analyzing safety:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get safety analytics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tripId = searchParams.get('tripId');
    const userId = searchParams.get('userId');
    const driverId = searchParams.get('driverId');

    await connectDB();

    let query: any = {};
    if (tripId) query.tripId = tripId;
    if (userId) query.userId = userId;
    if (driverId) query.driverId = driverId;

    const safetyAnalytics = await SafetyAnalytics.find(query)
      .populate('tripId', 'origin destination scheduledDate')
      .populate('driverId', 'vehicleType vehicleNumber')
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json({ safetyAnalytics }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching safety analytics:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

