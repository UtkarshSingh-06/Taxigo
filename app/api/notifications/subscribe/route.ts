import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

// POST - Subscribe to push notifications
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { subscription } = body;

    if (!subscription) {
      return NextResponse.json(
        { error: 'Please provide subscription object' },
        { status: 400 }
      );
    }

    await connectDB();

    // Store subscription in user document
    await User.findByIdAndUpdate(session.user.id, {
      $set: {
        pushSubscription: subscription,
      },
    });

    return NextResponse.json(
      { message: 'Subscribed to push notifications successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error subscribing to notifications:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

