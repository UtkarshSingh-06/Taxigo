import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import DemandPrediction from '@/models/DemandPrediction';
import Trip from '@/models/Trip';
import { predictDemand, calculateRecommendedDrivers } from '@/lib/ai-prediction';

// GET - Get demand predictions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const hours = parseInt(searchParams.get('hours') || '1');

    if (lat && lng) {
      // Get prediction for specific location
      const location = { lat: parseFloat(lat), lng: parseFloat(lng) };
      const timeWindow = {
        start: new Date(),
        end: new Date(Date.now() + hours * 60 * 60 * 1000),
      };

      // Get historical data for this location
      const historicalTrips = await Trip.find({
        'origin.lat': { $gte: location.lat - 0.01, $lte: location.lat + 0.01 },
        'origin.lng': { $gte: location.lng - 0.01, $lte: location.lng + 0.01 },
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
      }).limit(100);

      const historicalData = historicalTrips.map((trip) => ({
        demand: 1,
        timestamp: trip.createdAt,
      }));

      const prediction = predictDemand(location, timeWindow, historicalData);
      const recommendedDrivers = calculateRecommendedDrivers(prediction.demand);

      // Save prediction
      const savedPrediction = await DemandPrediction.create({
        location: { ...location, address: 'Predicted Location' },
        predictedDemand: prediction.demand,
        confidence: prediction.confidence,
        timeWindow,
        factors: prediction.factors,
        recommendedDrivers,
      });

      return NextResponse.json({ prediction: savedPrediction }, { status: 200 });
    }

    // Get all recent predictions
    const predictions = await DemandPrediction.find({
      timeWindow: { $gte: new Date() },
    })
      .sort({ predictedDemand: -1 })
      .limit(20);

    return NextResponse.json({ predictions }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching demand predictions:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create demand prediction
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { location, timeWindow } = body;

    if (!location || !location.lat || !location.lng) {
      return NextResponse.json(
        { error: 'Please provide location coordinates' },
        { status: 400 }
      );
    }

    await connectDB();

    const startTime = timeWindow?.start ? new Date(timeWindow.start) : new Date();
    const endTime = timeWindow?.end
      ? new Date(timeWindow.end)
      : new Date(Date.now() + 60 * 60 * 1000); // Default 1 hour

    // Get historical data
    const historicalTrips = await Trip.find({
      'origin.lat': { $gte: location.lat - 0.01, $lte: location.lat + 0.01 },
      'origin.lng': { $gte: location.lng - 0.01, $lte: location.lng + 0.01 },
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    }).limit(100);

    const historicalData = historicalTrips.map((trip) => ({
      demand: 1,
      timestamp: trip.createdAt,
    }));

    const prediction = predictDemand(location, { start: startTime, end: endTime }, historicalData);
    const recommendedDrivers = calculateRecommendedDrivers(prediction.demand);

    const savedPrediction = await DemandPrediction.create({
      location: {
        lat: location.lat,
        lng: location.lng,
        address: location.address || 'Unknown Location',
      },
      predictedDemand: prediction.demand,
      confidence: prediction.confidence,
      timeWindow: { start: startTime, end: endTime },
      factors: prediction.factors,
      recommendedDrivers,
    });

    return NextResponse.json(
      {
        message: 'Demand prediction created successfully',
        prediction: savedPrediction,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating demand prediction:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

