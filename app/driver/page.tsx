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
  const [stats, setStats] = useState({
    totalTrips: 0,
    completedTrips: 0,
    totalEarnings: 0,
    activeTrips: 0,
  });

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
        const tripsData = data.trips || [];
        setTrips(tripsData);
        
        // Calculate stats
        setStats({
          totalTrips: tripsData.length,
          completedTrips: tripsData.filter((t: Trip) => t.status === 'completed').length,
          totalEarnings: tripsData
            .filter((t: Trip) => t.status === 'completed')
            .reduce((sum: number, t: Trip) => sum + (t.estimatedFare || 0), 0),
          activeTrips: tripsData.filter((t: Trip) => t.status === 'in-progress' || t.status === 'confirmed').length,
        });
      }
    } catch (err) {
      console.error('Error fetching trips:', err);
    }
  };

  const fetchAvailableTrips = async () => {
    try {
      const response = await fetch('/api/trips?type=my-trips');
      const data = await response.json();
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <p className="text-white text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon, color, delay }: { title: string; value: number; icon: string; color: string; delay?: number }) => (
    <div
      className="glass rounded-2xl p-6 card-hover animate-slide-in-up"
      style={{ animationDelay: `${delay || 0}ms` }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-300 text-sm font-medium mb-1">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <div className="text-4xl opacity-80">{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Card */}
        <div className="glass rounded-2xl p-6 mb-8 card-hover animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Driver Dashboard
              </h1>
              <p className="text-gray-300">
                {driver?.vehicleType} - <span className="font-semibold">{driver?.vehicleNumber}</span>
              </p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <div className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-2 ${
                driver?.isAvailable
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/50'
                  : 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/50'
              }`}>
                <span className={`w-3 h-3 rounded-full ${driver?.isAvailable ? 'bg-white animate-pulse' : 'bg-white'}`}></span>
                {driver?.isAvailable ? 'Available' : 'On Trip'}
              </div>
              <button
                onClick={() => updateAvailability(!driver?.isAvailable)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 ${
                  driver?.isAvailable
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {driver?.isAvailable ? 'Go Offline' : 'Go Online'}
              </button>
              <Link
                href="/driver/ratings"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-semibold text-white hover:scale-105 transition-transform shadow-lg shadow-purple-500/50"
              >
                ⭐ Ratings
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Trips" value={stats.totalTrips} icon="📊" color="text-purple-400" delay={0} />
          <StatCard title="Completed" value={stats.completedTrips} icon="✓" color="text-green-400" delay={100} />
          <StatCard title="Active" value={stats.activeTrips} icon="🚗" color="text-blue-400" delay={200} />
          <StatCard title="Earnings" value={stats.totalEarnings} icon="💰" color="text-yellow-400" delay={300} />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Available Trips */}
          <div className="animate-slide-in-up" style={{ animationDelay: '400ms' }}>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span>🔔</span> Available Trips
            </h2>
            {availableTrips.length === 0 ? (
              <div className="glass rounded-2xl p-8 text-center">
                <div className="text-5xl mb-4">🚕</div>
                <p className="text-gray-300">No available trips at the moment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {availableTrips.map((trip, index) => (
                  <div
                    key={trip._id}
                    className="glass rounded-2xl p-6 card-hover border-2 border-yellow-500/30 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 animate-slide-in-up"
                    style={{ animationDelay: `${(index + 1) * 100}ms` }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-500/20 text-yellow-300">
                        New Request
                      </span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                        ₹{trip.estimatedFare}
                      </span>
                    </div>
                    <div className="space-y-3 mb-4">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">From</p>
                        <p className="text-white font-medium">{trip.origin.address}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">To</p>
                        <p className="text-white font-medium">{trip.destination.address}</p>
                      </div>
                      <p className="text-sm text-gray-300">
                        📅 {new Date(trip.scheduledDate).toLocaleDateString()} at {trip.scheduledTime}
                      </p>
                    </div>
                    {driver?.isAvailable && (
                      <button
                        onClick={() => acceptTrip(trip._id)}
                        className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl font-semibold text-white hover:scale-105 transition-transform shadow-lg shadow-green-500/50"
                      >
                        ✓ Accept Trip
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* My Trips */}
          <div className="animate-slide-in-up" style={{ animationDelay: '500ms' }}>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span>🚗</span> My Trips
            </h2>
            {trips.length === 0 ? (
              <div className="glass rounded-2xl p-8 text-center">
                <div className="text-5xl mb-4">📋</div>
                <p className="text-gray-300">You haven't accepted any trips yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {trips.map((trip, index) => {
                  const statusColors: Record<string, string> = {
                    confirmed: 'border-blue-500/30 bg-gradient-to-r from-blue-400/10 to-cyan-400/10',
                    'in-progress': 'border-green-500/30 bg-gradient-to-r from-green-400/10 to-emerald-400/10',
                    completed: 'border-gray-500/30 bg-gradient-to-r from-gray-400/10 to-slate-400/10',
                  };
                  const bgClass = statusColors[trip.status] || 'border-gray-500/30 bg-gradient-to-r from-gray-400/10 to-slate-400/10';

                  return (
                    <div
                      key={trip._id}
                      className={`glass rounded-2xl p-6 card-hover border-2 ${bgClass} animate-slide-in-up`}
                      style={{ animationDelay: `${(index + 1) * 100}ms` }}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-white/20 text-white capitalize">
                          {trip.status.replace('-', ' ')}
                        </span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                          ₹{trip.estimatedFare}
                        </span>
                      </div>
                      <div className="space-y-3 mb-4">
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">From</p>
                          <p className="text-white font-medium">{trip.origin.address}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">To</p>
                          <p className="text-white font-medium">{trip.destination.address}</p>
                        </div>
                        {trip.userId && (
                          <div className="glass rounded-xl p-3 border border-white/10">
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Passenger</p>
                            <p className="text-white font-medium">{trip.userId.name}</p>
                            <p className="text-sm text-gray-300">{trip.userId.phone}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {trip.status === 'confirmed' && (
                          <button
                            onClick={() => updateTripStatus(trip._id, 'in-progress')}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl font-semibold text-white hover:scale-105 transition-transform shadow-lg shadow-green-500/50"
                          >
                            🚗 Start Trip
                          </button>
                        )}
                        {trip.status === 'in-progress' && (
                          <button
                            onClick={() => updateTripStatus(trip._id, 'completed')}
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-semibold text-white hover:scale-105 transition-transform shadow-lg shadow-purple-500/50"
                          >
                            ✓ Complete Trip
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
