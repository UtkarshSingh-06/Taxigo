'use client';

import { useState } from 'react';

interface PaymentFormProps {
  tripId: string;
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PaymentForm({ tripId, amount, onSuccess, onCancel }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'wallet' | 'netbanking'>('card');
  const [paymentGateway, setPaymentGateway] = useState<'stripe' | 'razorpay'>('razorpay');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      // Create payment intent
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId,
          paymentMethod,
          paymentGateway,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment initialization failed');
      }

      // Handle payment based on gateway
      if (paymentGateway === 'razorpay') {
        const options = {
          key: data.paymentIntent.keyId,
          amount: amount * 100, // Convert to paise
          currency: 'INR',
          name: 'Taxigo',
          description: `Payment for Trip ${tripId}`,
          order_id: data.paymentIntent.orderId,
          handler: async (response: any) => {
            // Verify payment
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paymentId: data.payment.id,
                paymentGateway: 'razorpay',
                paymentData: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                },
              }),
            });

            const verifyData = await verifyResponse.json();
            if (verifyResponse.ok) {
              onSuccess();
            } else {
              setError(verifyData.error || 'Payment verification failed');
            }
          },
          prefill: {
            name: 'User',
            email: 'user@example.com',
            contact: '9999999999',
          },
          theme: {
            color: '#0ea5e9',
          },
        };

        const Razorpay = (window as any).Razorpay;
        if (Razorpay) {
          const razorpay = new Razorpay(options);
          razorpay.open();
        } else {
          throw new Error('Razorpay SDK not loaded');
        }
      } else if (paymentGateway === 'stripe') {
        // Stripe integration would go here
        // For now, we'll use a simplified approach
        alert('Stripe integration coming soon. Please use Razorpay for now.');
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4">Complete Payment</h3>
      
      <div className="mb-4">
        <p className="text-2xl font-semibold text-primary-600">₹{amount}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Gateway
          </label>
          <select
            value={paymentGateway}
            onChange={(e) => setPaymentGateway(e.target.value as 'stripe' | 'razorpay')}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="razorpay">Razorpay</option>
            <option value="stripe">Stripe</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Method
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as any)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="card">Card</option>
            <option value="upi">UPI</option>
            <option value="wallet">Wallet</option>
            <option value="netbanking">Net Banking</option>
          </select>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handlePayment}
            disabled={loading}
            className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

