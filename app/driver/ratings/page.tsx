'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Rating {
  _id: string;
  rating: number;
  review?: string;
  userId: { name: string };
  tripId: { origin: { address: string }; destination: { address: string } };
  createdAt: string;
}

export default function DriverRatingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
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
      fetchRatings();
    }
  }, [status]);

  const fetchRatings = async () => {
    try {
      // Get driver ID
      const driverResponse = await fetch('/api/drivers?type=my-profile');
      const driverData = await driverResponse.json();
      
      if (driverResponse.ok && driverData.driver) {
        const response = await fetch(`/api/ratings?driverId=${driverData.driver._id}`);
        const data = await response.json();
        if (response.ok) {
          setRatings(data.ratings || []);
          setAverageRating(data.averageRating || 0);
          setTotalRatings(data.totalRatings || 0);
        }
      }
    } catch (err) {
      console.error('Error fetching ratings:', err);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.push('/driver')}
          className="mb-4 text-primary-600 hover:text-primary-700"
        >
          ← Back to Dashboard
        </button>

        <div className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Ratings</h1>
          <div className="flex items-center space-x-4">
            <div className="text-4xl font-bold text-primary-600">
              {averageRating.toFixed(1)}
            </div>
            <div>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-2xl ${
                      star <= Math.round(averageRating)
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Based on {totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {ratings.length === 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <p className="text-gray-600">No ratings yet.</p>
            </div>
          ) : (
            ratings.map((rating) => (
              <div key={rating._id} className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{rating.userId.name}</p>
                    <p className="text-sm text-gray-600">
                      {rating.tripId.origin.address} → {rating.tripId.destination.address}
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`${
                          star <= rating.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                {rating.review && (
                  <p className="text-gray-700 mt-2">{rating.review}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(rating.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

