'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import TripTracking from '@/components/TripTracking';
import PaymentForm from '@/components/PaymentForm';
import RatingForm from '@/components/RatingForm';
import MapView from '@/components/MapView';
import RouteOptimizationView from '@/components/RouteOptimizationView';
import SafetyAnalyticsDashboard from '@/components/SafetyAnalyticsDashboard';

interface Trip {
  _id: string;
  tripType: string;
  status: string;
  origin: { address: string; lat: number; lng: number };
  destination: { address: string; lat: number; lng: number };
  estimatedFare: number;
  actualFare?: number;
  scheduledDate: string;
  scheduledTime: string;
  driverId?: any;
}

export default function TripDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  useEffect(() => {
    fetchTrip();
    checkRating();
  }, []);

  const fetchTrip = async () => {
    try {
      const response = await fetch(`/api/trips/${params.id}`);
      const data = await response.json();
      if (response.ok) {
        setTrip(data.trip);
      }
    } catch (err) {
      console.error('Error fetching trip:', err);
    } finally {
      setLoading(false);
    }
  };

  const checkRating = async () => {
    try {
      const response = await fetch(`/api/ratings?tripId=${params.id}`);
      const data = await response.json();
      if (response.ok && data.ratings && data.ratings.length > 0) {
        setHasRated(true);
      }
    } catch (err) {
      console.error('Error checking rating:', err);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!trip) {
    return <div className="text-center py-12">Trip not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-4 text-primary-600 hover:text-primary-700"
        >
          ← Back
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Trip Details</h1>
              <div className="space-y-3">
                <p>
                  <span className="font-semibold">From:</span> {trip.origin.address}
                </p>
                <p>
                  <span className="font-semibold">To:</span> {trip.destination.address}
                </p>
                <p>
                  <span className="font-semibold">Date:</span>{' '}
                  {new Date(trip.scheduledDate).toLocaleDateString()} at {trip.scheduledTime}
                </p>
                <p>
                  <span className="font-semibold">Status:</span>{' '}
                  <span className="capitalize">{trip.status}</span>
                </p>
                <p className="text-2xl font-semibold text-primary-600">
                  ₹{trip.actualFare || trip.estimatedFare}
                </p>
              </div>
            </div>

            {trip.status === 'confirmed' && !showPayment && (
              <button
                onClick={() => setShowPayment(true)}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700"
              >
                Make Payment
              </button>
            )}

            {showPayment && (
              <PaymentForm
                tripId={trip._id}
                amount={trip.actualFare || trip.estimatedFare}
                onSuccess={() => {
                  setShowPayment(false);
                  fetchTrip();
                }}
                onCancel={() => setShowPayment(false)}
              />
            )}

            {trip.status === 'completed' && !hasRated && !showRating && (
              <button
                onClick={() => setShowRating(true)}
                className="w-full bg-yellow-500 text-white py-3 rounded-lg font-semibold hover:bg-yellow-600"
              >
                Rate Trip
              </button>
            )}

            {showRating && (
              <RatingForm
                tripId={trip._id}
                driverId={trip.driverId?._id || ''}
                onSubmit={() => {
                  setShowRating(false);
                  setHasRated(true);
                }}
              />
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Trip Tracking</h2>
              {trip.status === 'in-progress' || trip.status === 'confirmed' ? (
                <TripTracking
                  tripId={trip._id}
                  origin={trip.origin}
                  destination={trip.destination}
                  driverLocation={trip.driverId?.currentLocation}
                />
              ) : (
                <MapView
                  origin={trip.origin}
                  destination={trip.destination}
                  height="500px"
                />
              )}
            </div>

            {(trip.status === 'confirmed' || trip.status === 'in-progress') && (
              <>
                <RouteOptimizationView tripId={trip._id} />
                <SafetyAnalyticsDashboard tripId={trip._id} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

