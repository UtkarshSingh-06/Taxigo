import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Trip from '@/models/Trip';
import Stripe from 'stripe';
import Razorpay from 'razorpay';

// GET - Get payment history
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const payments = await Payment.find({ userId: session.user.id })
      .populate('tripId', 'origin destination tripType')
      .sort({ createdAt: -1 });

    return NextResponse.json({ payments }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create payment intent
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tripId, paymentMethod, paymentGateway } = body;

    if (!tripId || !paymentMethod || !paymentGateway) {
      return NextResponse.json(
        { error: 'Please provide trip ID, payment method, and payment gateway' },
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

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ tripId, status: 'completed' });
    if (existingPayment) {
      return NextResponse.json(
        { error: 'Payment already completed for this trip' },
        { status: 400 }
      );
    }

    const amount = trip.actualFare || trip.estimatedFare;
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

    // Create payment record
    const payment = await Payment.create({
      tripId,
      userId: session.user.id,
      amount,
      paymentMethod,
      paymentGateway,
      status: 'pending',
      transactionId,
    });

    // Initialize payment gateway
    let paymentIntent: any = {};

    if (paymentGateway === 'stripe' && process.env.STRIPE_SECRET_KEY) {
      // Stripe integration
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16',
      });

      const intent = await stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency: 'inr',
        metadata: {
          tripId: tripId.toString(),
          userId: session.user.id,
          paymentId: payment._id.toString(),
        },
      });

      paymentIntent = {
        clientSecret: intent.client_secret,
        paymentIntentId: intent.id,
      };

      await Payment.findByIdAndUpdate(payment._id, {
        gatewayTransactionId: intent.id,
      });
    } else if (paymentGateway === 'razorpay' && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      // Razorpay integration
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const order = await razorpay.orders.create({
        amount: amount * 100, // Convert to paise
        currency: 'INR',
        receipt: transactionId,
        notes: {
          tripId: tripId.toString(),
          userId: session.user.id,
        },
      });

      paymentIntent = {
        orderId: order.id,
        keyId: process.env.RAZORPAY_KEY_ID,
      };

      await Payment.findByIdAndUpdate(payment._id, {
        gatewayTransactionId: order.id,
      });
    }

    return NextResponse.json(
      {
        message: 'Payment intent created',
        payment: {
          id: payment._id,
          transactionId: payment.transactionId,
          amount: payment.amount,
          status: payment.status,
        },
        paymentIntent,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

