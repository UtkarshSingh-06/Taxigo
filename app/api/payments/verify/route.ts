import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Payment from '@/models/Payment';
import Trip from '@/models/Trip';
import Stripe from 'stripe';
import Razorpay from 'razorpay';
import crypto from 'crypto';

// POST - Verify payment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { paymentId, paymentGateway, paymentData } = body;

    if (!paymentId || !paymentGateway) {
      return NextResponse.json(
        { error: 'Please provide payment ID and gateway' },
        { status: 400 }
      );
    }

    await connectDB();

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (payment.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    let verified = false;

    if (paymentGateway === 'stripe' && process.env.STRIPE_SECRET_KEY) {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2023-10-16',
      });

      const intent = await stripe.paymentIntents.retrieve(paymentData.paymentIntentId);
      verified = intent.status === 'succeeded';
    } else if (paymentGateway === 'razorpay' && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = paymentData;

      const text = `${razorpay_order_id}|${razorpay_payment_id}`;
      const generated_signature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(text)
        .digest('hex');

      verified = generated_signature === razorpay_signature;

      if (verified) {
        // Verify with Razorpay API
        try {
          await razorpay.payments.fetch(razorpay_payment_id);
        } catch (err) {
          verified = false;
        }
      }
    }

    if (verified) {
      payment.status = 'completed';
      await payment.save();

      // Update trip status
      await Trip.findByIdAndUpdate(payment.tripId, {
        status: 'confirmed',
      });

      return NextResponse.json(
        {
          message: 'Payment verified successfully',
          payment,
        },
        { status: 200 }
      );
    } else {
      payment.status = 'failed';
      await payment.save();

      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

