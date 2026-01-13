'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Trip {
  _id: string;
  tripType: string;
  status: string;
  origin: { address: string };
  destination: { address: string };
  estimatedFare: number;
  scheduledDate: string;
  scheduledTime: string;
  driverId?: any;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user.role === 'driver') {
      router.push('/driver');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchTrips();
    }
  }, [status]);

  const fetchTrips = async () => {
    try {
      const response = await fetch('/api/trips?type=my-trips');
      const data = await response.json();
      if (response.ok) {
        setTrips(data.trips || []);
      }
    } catch (err) {
      console.error('Error fetching trips:', err);
    } finally {
      setLoading(false);
    }
  };

  const cancelTrip = async (tripId: string) => {
    if (!confirm('Are you sure you want to cancel this trip?')) return;

    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchTrips();
      }
    } catch (err) {
      console.error('Error cancelling trip:', err);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Trips</h1>
          <Link
            href="/book"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700"
          >
            Book New Trip
          </Link>
        </div>

        {trips.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow-lg text-center">
            <p className="text-gray-600 mb-4">You haven&apos;t booked any trips yet.</p>
            <Link
              href="/book"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              Book your first trip →
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {trips.map((trip) => (
              <div key={trip._id} className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                          trip.status
                        )}`}
                      >
                        {trip.status}
                      </span>
                      <span className="text-sm text-gray-600 capitalize">
                        {trip.tripType}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-gray-700">
                        <span className="font-semibold">From:</span> {trip.origin.address}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">To:</span> {trip.destination.address}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {new Date(trip.scheduledDate).toLocaleDateString()} at{' '}
                        {trip.scheduledTime}
                      </p>
                      <p className="text-lg font-semibold text-primary-600">
                        ₹{trip.estimatedFare}
                      </p>
                    </div>
                    {trip.driverId && (
                      <div className="mt-4 p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Driver:</span>{' '}
                          {trip.driverId.vehicleType} - {trip.driverId.vehicleNumber}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex flex-col space-y-2">
                    <Link
                      href={`/trip/${trip._id}`}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-sm text-center"
                    >
                      View Details
                    </Link>
                    {trip.status === 'pending' && (
                      <button
                        onClick={() => cancelTrip(trip._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

