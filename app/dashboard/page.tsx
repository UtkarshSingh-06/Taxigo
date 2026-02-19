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
  const [filter, setFilter] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    totalSpent: 0,
  });

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
        const tripsData = data.trips || [];
        setTrips(tripsData);
        
        // Calculate stats
        const statsData = {
          total: tripsData.length,
          pending: tripsData.filter((t: Trip) => t.status === 'pending').length,
          inProgress: tripsData.filter((t: Trip) => t.status === 'in-progress').length,
          completed: tripsData.filter((t: Trip) => t.status === 'completed').length,
          totalSpent: tripsData
            .filter((t: Trip) => t.status === 'completed')
            .reduce((sum: number, t: Trip) => sum + (t.estimatedFare || 0), 0),
        };
        setStats(statsData);
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

  const filteredTrips = trips.filter((trip) => {
    if (filter === 'all') return true;
    return trip.status === filter;
  });

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <p className="text-white text-lg">Loading your trips...</p>
        </div>
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; icon: string; bg: string }> = {
      pending: {
        color: 'text-yellow-600',
        icon: '⏳',
        bg: 'bg-gradient-to-r from-yellow-400/20 to-orange-400/20 border-yellow-500/50',
      },
      confirmed: {
        color: 'text-blue-600',
        icon: '✅',
        bg: 'bg-gradient-to-r from-blue-400/20 to-cyan-400/20 border-blue-500/50',
      },
      'in-progress': {
        color: 'text-green-600',
        icon: '🚗',
        bg: 'bg-gradient-to-r from-green-400/20 to-emerald-400/20 border-green-500/50',
      },
      completed: {
        color: 'text-gray-600',
        icon: '✓',
        bg: 'bg-gradient-to-r from-gray-400/20 to-slate-400/20 border-gray-500/50',
      },
      cancelled: {
        color: 'text-red-600',
        icon: '✕',
        bg: 'bg-gradient-to-r from-red-400/20 to-rose-400/20 border-red-500/50',
      },
    };
    return configs[status] || configs.completed;
  };

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
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Welcome back, <span className="gradient-text">{session?.user.name}</span>
              </h1>
              <p className="text-gray-300">Manage your trips and track your journey</p>
            </div>
            <Link
              href="/book"
              className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/50"
            >
              <span className="relative z-10 flex items-center gap-2">
                <span>+</span> Book New Trip
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Trips" value={stats.total} icon="📊" color="text-purple-400" delay={0} />
          <StatCard title="Pending" value={stats.pending} icon="⏳" color="text-yellow-400" delay={100} />
          <StatCard title="In Progress" value={stats.inProgress} icon="🚗" color="text-green-400" delay={200} />
          <StatCard title="Completed" value={stats.completed} icon="✓" color="text-blue-400" delay={300} />
        </div>

        {/* Total Spent Card */}
        {stats.totalSpent > 0 && (
          <div className="glass rounded-2xl p-6 mb-8 card-hover animate-slide-in-up" style={{ animationDelay: '400ms' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm font-medium mb-1">Total Spent</p>
                <p className="text-3xl font-bold text-green-400">₹{stats.totalSpent}</p>
              </div>
              <div className="text-4xl opacity-80">💰</div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'pending', 'confirmed', 'in-progress', 'completed'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 whitespace-nowrap ${
                filter === filterOption
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50'
                  : 'glass text-gray-300 hover:bg-white/10'
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1).replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Trips List */}
        {filteredTrips.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center animate-fade-in">
            <div className="text-6xl mb-4">🚕</div>
            <p className="text-gray-300 text-lg mb-4">
              {filter === 'all'
                ? "You haven't booked any trips yet."
                : `No ${filter} trips found.`}
            </p>
            {filter === 'all' && (
              <Link
                href="/book"
                className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-semibold text-white hover:scale-105 transition-transform"
              >
                Book your first trip →
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredTrips.map((trip, index) => {
              const statusConfig = getStatusConfig(trip.status);
              return (
                <div
                  key={trip._id}
                  className={`glass rounded-2xl p-6 card-hover border-2 ${statusConfig.bg} animate-slide-in-up`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Left Section */}
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span
                          className={`px-4 py-2 rounded-full text-sm font-semibold ${statusConfig.color} bg-white/20 backdrop-blur-sm flex items-center gap-2`}
                        >
                          <span>{statusConfig.icon}</span>
                          <span className="capitalize">{trip.status.replace('-', ' ')}</span>
                        </span>
                        <span className="px-4 py-2 rounded-full text-sm font-medium text-gray-300 bg-white/10 backdrop-blur-sm capitalize">
                          {trip.tripType}
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-3 h-3 rounded-full bg-green-400 mt-2 animate-pulse"></div>
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">From</p>
                            <p className="text-white font-medium">{trip.origin.address}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-3 h-3 rounded-full bg-red-400 mt-2"></div>
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">To</p>
                            <p className="text-white font-medium">{trip.destination.address}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-300">
                        <div className="flex items-center gap-2">
                          <span>📅</span>
                          <span>{new Date(trip.scheduledDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>🕐</span>
                          <span>{trip.scheduledTime}</span>
                        </div>
                      </div>

                      {trip.driverId && (
                        <div className="glass rounded-xl p-4 border border-white/10">
                          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Driver</p>
                          <p className="text-white font-medium">
                            {trip.driverId.vehicleType} - {trip.driverId.vehicleNumber}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Right Section */}
                    <div className="flex flex-col items-end justify-between gap-4">
                      <div className="text-right">
                        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Fare</p>
                        <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                          ₹{trip.estimatedFare}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 w-full md:w-auto">
                        <Link
                          href={`/trip/${trip._id}`}
                          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-semibold text-white text-center hover:scale-105 transition-transform shadow-lg shadow-purple-500/50"
                        >
                          View Details
                        </Link>
                        {trip.status === 'pending' && (
                          <button
                            onClick={() => cancelTrip(trip._id)}
                            className="px-6 py-3 bg-red-600/80 hover:bg-red-600 rounded-lg font-semibold text-white transition-all hover:scale-105"
                          >
                            Cancel Trip
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
