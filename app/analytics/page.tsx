'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import DemandPredictionMap from '@/components/DemandPredictionMap';

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [driverAllocation, setDriverAllocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDriverAllocation();
    }
  }, [status]);

  const fetchDriverAllocation = async () => {
    try {
      const response = await fetch('/api/ai/driver-allocation');
      const data = await response.json();
      if (response.ok) {
        setDriverAllocation(data);
      }
    } catch (err) {
      console.error('Error fetching driver allocation:', err);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <p className="text-white text-lg">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            AI Analytics Dashboard
          </h1>
          <p className="text-gray-300">Real-time predictions and optimizations</p>
        </div>

        {/* Demand Predictions */}
        <div className="mb-8">
          <DemandPredictionMap />
        </div>

        {/* Driver Allocation */}
        {driverAllocation && (
          <div className="glass rounded-2xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Driver Allocation</h2>
            <div className="mb-4">
              <p className="text-gray-300">
                Total Available Drivers: <span className="text-white font-bold">{driverAllocation.totalAvailableDrivers}</span>
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {driverAllocation.allocation?.map((alloc: any, index: number) => (
                <div key={index} className="glass rounded-xl p-4 border-2 border-white/10">
                  <p className="text-sm text-gray-400 mb-2">{alloc.location.address}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-white">{alloc.allocatedDrivers}</p>
                      <p className="text-xs text-gray-400">Drivers Allocated</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-purple-400">{alloc.prediction.predictedDemand}%</p>
                      <p className="text-xs text-gray-400">Predicted Demand</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

