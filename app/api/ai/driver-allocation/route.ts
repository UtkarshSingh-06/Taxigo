import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import DemandPrediction from '@/models/DemandPrediction';
import Driver from '@/models/Driver';
import { optimizeDriverAllocation } from '@/lib/ai-prediction';

// GET - Get optimized driver allocation
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get recent demand predictions
    const predictions = await DemandPrediction.find({
      timeWindow: { $gte: new Date() },
    })
      .sort({ predictedDemand: -1 })
      .limit(10);

    // Get available drivers
    const availableDrivers = await Driver.find({
      isAvailable: true,
      isOnTrip: false,
    });

    if (predictions.length === 0) {
      return NextResponse.json(
        { message: 'No demand predictions available', allocation: [] },
        { status: 200 }
      );
    }

    // Optimize driver allocation
    const allocation = optimizeDriverAllocation(
      predictions.map((p) => ({
        location: p.location,
        demand: p.predictedDemand,
      })),
      availableDrivers.length
    );

    return NextResponse.json(
      {
        totalAvailableDrivers: availableDrivers.length,
        allocation: allocation.map((alloc, index) => ({
          ...alloc,
          prediction: predictions[index],
        })),
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error calculating driver allocation:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

