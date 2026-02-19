'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

export default function BookPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tripType, setTripType] = useState<'one-way' | 'two-way' | 'mid-way'>('one-way');
  const [formData, setFormData] = useState({
    origin: { address: '', lat: 0, lng: 0 },
    destination: { address: '', lat: 0, lng: 0 },
    returnOrigin: { address: '', lat: 0, lng: 0 },
    returnDestination: { address: '', lat: 0, lng: 0 },
    midWayPickup: { address: '', lat: 0, lng: 0 },
    scheduledDate: '',
    scheduledTime: '',
    returnDate: '',
    returnTime: '',
    parentTripId: '',
  });
  const [midWayOpportunities, setMidWayOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [route, setRoute] = useState<Array<{ lat: number; lng: number }>>([]);
  const [optimizedDistance, setOptimizedDistance] = useState<number | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (tripType === 'mid-way') {
      fetchMidWayOpportunities();
    }
  }, [tripType]);

  const fetchMidWayOpportunities = async () => {
    try {
      const response = await fetch('/api/trips?type=mid-way-opportunities');
      const data = await response.json();
      if (response.ok) {
        setMidWayOpportunities(data.opportunities || []);
      }
    } catch (err) {
      console.error('Error fetching mid-way opportunities:', err);
    }
  };

  const handleGeocode = async (address: string, type: string) => {
    // In a real app, you'd use a geocoding service like Google Maps API
    // For now, we'll use a simple mock
    const mockCoords = {
      lat: 28.6139 + Math.random() * 0.1,
      lng: 77.2090 + Math.random() * 0.1,
    };
    return mockCoords;
  };

  const handleAddressChange = async (address: string, field: string) => {
    const coords = await handleGeocode(address, field);
    setFormData((prev) => ({
      ...prev,
      [field]: { address, ...coords },
    }));

    // Optimize route when both origin and destination are set
    if (field === 'destination' && formData.origin.lat && formData.origin.lng) {
      optimizeRoute(formData.origin, coords);
    } else if (field === 'origin' && formData.destination.lat && formData.destination.lng) {
      optimizeRoute(coords, formData.destination);
    }
  };

  const optimizeRoute = async (origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) => {
    try {
      const response = await fetch('/api/routes/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin, destination }),
      });

      const data = await response.json();
      if (response.ok) {
        setRoute(data.route || []);
        setOptimizedDistance(data.distance);
      }
    } catch (err) {
      console.error('Error optimizing route:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload: any = {
        tripType,
        origin: formData.origin,
        destination: formData.destination,
        scheduledDate: formData.scheduledDate,
        scheduledTime: formData.scheduledTime,
      };

      if (tripType === 'two-way') {
        payload.returnOrigin = formData.returnOrigin;
        payload.returnDestination = formData.returnDestination;
        payload.returnDate = formData.returnDate;
        payload.returnTime = formData.returnTime;
      }

      if (tripType === 'mid-way') {
        payload.midWayPickup = formData.midWayPickup;
        payload.parentTripId = formData.parentTripId;
      }

      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create trip');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Book a Trip</h1>

        <div className="mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setTripType('one-way')}
              className={`px-6 py-3 rounded-lg font-semibold ${
                tripType === 'one-way'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              One-Way
            </button>
            <button
              onClick={() => setTripType('two-way')}
              className={`px-6 py-3 rounded-lg font-semibold ${
                tripType === 'two-way'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Two-Way
            </button>
            <button
              onClick={() => setTripType('mid-way')}
              className={`px-6 py-3 rounded-lg font-semibold ${
                tripType === 'mid-way'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Mid-Way Booking
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {tripType === 'mid-way' && midWayOpportunities.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-3">Available Mid-Way Opportunities</h3>
            <div className="space-y-2">
              {midWayOpportunities.map((opp, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-white rounded border cursor-pointer hover:border-primary-500"
                  onClick={() => {
                    setFormData((prev) => ({
                      ...prev,
                      parentTripId: opp.tripId,
                      origin: opp.currentLocation || { address: '', lat: 0, lng: 0 },
                      destination: opp.destination,
                    }));
                  }}
                >
                  <p className="font-medium">From: {opp.origin.address}</p>
                  <p className="text-sm text-gray-600">
                    To: {opp.destination.address}
                  </p>
                  <p className="text-sm text-primary-600 font-semibold">
                    Discounted Fare: ₹{opp.estimatedFare}
                  </p>
                </div>
              ))}
            </div>
          </div>
          )}

        {formData.origin.lat && formData.destination.lat && (
          <div className="mb-6">
            <MapView
              origin={formData.origin}
              destination={formData.destination}
              route={route}
              height="300px"
            />
            {optimizedDistance && (
              <p className="mt-2 text-sm text-gray-600">
                Optimized Distance: {optimizedDistance.toFixed(2)} km
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pickup Location
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter pickup address"
              value={formData.origin.address}
              onChange={(e) => handleAddressChange(e.target.value, 'origin')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter destination address"
              value={formData.destination.address}
              onChange={(e) => handleAddressChange(e.target.value, 'destination')}
            />
          </div>

          {tripType === 'two-way' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Return Pickup Location
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter return pickup address"
                  value={formData.returnOrigin.address}
                  onChange={(e) => handleAddressChange(e.target.value, 'returnOrigin')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Return Destination
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter return destination address"
                  value={formData.returnDestination.address}
                  onChange={(e) => handleAddressChange(e.target.value, 'returnDestination')}
                />
              </div>
            </>
          )}

          {tripType === 'mid-way' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mid-Way Pickup Point
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter mid-way pickup address"
                value={formData.midWayPickup.address}
                onChange={(e) => handleAddressChange(e.target.value, 'midWayPickup')}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                value={formData.scheduledDate}
                onChange={(e) =>
                  setFormData({ ...formData, scheduledDate: e.target.value })
                }
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time
              </label>
              <input
                type="time"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                value={formData.scheduledTime}
                onChange={(e) =>
                  setFormData({ ...formData, scheduledTime: e.target.value })
                }
              />
            </div>
          </div>

          {tripType === 'two-way' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Return Date
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  value={formData.returnDate}
                  onChange={(e) =>
                    setFormData({ ...formData, returnDate: e.target.value })
                  }
                  min={formData.scheduledDate}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Return Time
                </label>
                <input
                  type="time"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  value={formData.returnTime}
                  onChange={(e) =>
                    setFormData({ ...formData, returnTime: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? 'Booking...' : 'Book Trip'}
          </button>
        </form>
      </div>
    </div>
  );
}

