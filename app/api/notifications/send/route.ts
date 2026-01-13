import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { sendPushNotification } from '@/lib/push-notifications';

// POST - Send push notification
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, title, body: message, data } = body;

    if (!userId || !title || !message) {
      return NextResponse.json(
        { error: 'Please provide userId, title, and message' },
        { status: 400 }
      );
    }

    await connectDB();

    // Get user's push subscription
    const user = await User.findById(userId);
    if (!user || !user.pushSubscription) {
      return NextResponse.json(
        { error: 'User not found or not subscribed to notifications' },
        { status: 404 }
      );
    }

    // Send notification
    const result = await sendPushNotification(user.pushSubscription, {
      title,
      body: message,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      data: data || {},
    });

    if (result.success) {
      return NextResponse.json(
        { message: 'Notification sent successfully' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to send notification' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

