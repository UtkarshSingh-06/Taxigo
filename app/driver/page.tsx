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
  userId?: any;
}

interface Driver {
  _id: string;
  isAvailable: boolean;
  isOnTrip: boolean;
  vehicleType: string;
  vehicleNumber: string;
  currentLocation?: { lat: number; lng: number };
}

export default function DriverPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [availableTrips, setAvailableTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user.role !== 'driver') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDriverData();
      fetchTrips();
      fetchAvailableTrips();
    }
  }, [status]);

  const fetchDriverData = async () => {
    try {
      const response = await fetch('/api/drivers?type=my-profile');
      const data = await response.json();
      if (response.ok) {
        setDriver(data.driver);
      }
    } catch (err) {
      console.error('Error fetching driver data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrips = async () => {
    try {
      const response = await fetch('/api/drivers?type=my-trips');
      const data = await response.json();
      if (response.ok) {
        setTrips(data.trips || []);
      }
    } catch (err) {
      console.error('Error fetching trips:', err);
    }
  };

  const fetchAvailableTrips = async () => {
    try {
      const response = await fetch('/api/trips?type=my-trips');
      const data = await response.json();
      // Filter for pending trips without drivers
      const pending = (data.trips || []).filter(
        (trip: Trip) => trip.status === 'pending' && !trip.driverId
      );
      setAvailableTrips(pending);
    } catch (err) {
      console.error('Error fetching available trips:', err);
    }
  };

  const updateAvailability = async (isAvailable: boolean) => {
    try {
      const response = await fetch('/api/drivers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable }),
      });

      if (response.ok) {
        fetchDriverData();
      }
    } catch (err) {
      console.error('Error updating availability:', err);
    }
  };

  const acceptTrip = async (tripId: string) => {
    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ driverId: driver?._id, status: 'confirmed' }),
      });

      if (response.ok) {
        fetchTrips();
        fetchAvailableTrips();
        updateAvailability(false);
      }
    } catch (err) {
      console.error('Error accepting trip:', err);
    }
  };

  const updateTripStatus = async (tripId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchTrips();
        if (newStatus === 'completed') {
          updateAvailability(true);
        }
      }
    } catch (err) {
      console.error('Error updating trip status:', err);
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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Driver Dashboard</h1>
              <p className="text-gray-600 mt-1">
                {driver?.vehicleType} - {driver?.vehicleNumber}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span
                className={`px-4 py-2 rounded-lg font-semibold ${
                  driver?.isAvailable
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {driver?.isAvailable ? 'Available' : 'On Trip'}
              </span>
              <button
                onClick={() => updateAvailability(!driver?.isAvailable)}
                className={`px-6 py-2 rounded-lg font-semibold ${
                  driver?.isAvailable
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {driver?.isAvailable ? 'Go Offline' : 'Go Online'}
              </button>
              <Link
                href="/driver/ratings"
                className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700"
              >
                View Ratings
              </Link>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Trips</h2>
            {availableTrips.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <p className="text-gray-600">No available trips at the moment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {availableTrips.map((trip) => (
                  <div key={trip._id} className="bg-white p-6 rounded-lg shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                          trip.status
                        )}`}
                      >
                        {trip.status}
                      </span>
                      <span className="text-lg font-semibold text-primary-600">
                        ₹{trip.estimatedFare}
                      </span>
                    </div>
                    <div className="space-y-2 mb-4">
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
                    </div>
                    {driver?.isAvailable && (
                      <button
                        onClick={() => acceptTrip(trip._id)}
                        className="w-full bg-primary-600 text-white py-2 rounded-lg font-semibold hover:bg-primary-700"
                      >
                        Accept Trip
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">My Trips</h2>
            {trips.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <p className="text-gray-600">You haven&apos;t accepted any trips yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {trips.map((trip) => (
                  <div key={trip._id} className="bg-white p-6 rounded-lg shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                          trip.status
                        )}`}
                      >
                        {trip.status}
                      </span>
                      <span className="text-lg font-semibold text-primary-600">
                        ₹{trip.estimatedFare}
                      </span>
                    </div>
                    <div className="space-y-2 mb-4">
                      <p className="text-gray-700">
                        <span className="font-semibold">From:</span> {trip.origin.address}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">To:</span> {trip.destination.address}
                      </p>
                      {trip.userId && (
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Passenger:</span>{' '}
                          {trip.userId.name} ({trip.userId.phone})
                        </p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {trip.status === 'confirmed' && (
                        <button
                          onClick={() => updateTripStatus(trip._id, 'in-progress')}
                          className="flex-1 bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700"
                        >
                          Start Trip
                        </button>
                      )}
                      {trip.status === 'in-progress' && (
                        <button
                          onClick={() => updateTripStatus(trip._id, 'completed')}
                          className="flex-1 bg-primary-600 text-white py-2 rounded-lg font-semibold hover:bg-primary-700"
                        >
                          Complete Trip
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

