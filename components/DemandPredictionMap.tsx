'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('./MapView'), { ssr: false });

interface DemandPrediction {
  _id: string;
  location: { lat: number; lng: number; address: string };
  predictedDemand: number;
  confidence: number;
  recommendedDrivers: number;
  factors: {
    historicalData: number;
    weather: number;
    events: number;
    timeOfDay: number;
    dayOfWeek: number;
  };
}

export default function DemandPredictionMap() {
  const [predictions, setPredictions] = useState<DemandPrediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      const response = await fetch('/api/ai/demand-prediction');
      const data = await response.json();
      if (response.ok) {
        setPredictions(data.predictions || []);
      }
    } catch (err) {
      console.error('Error fetching predictions:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDemandColor = (demand: number) => {
    if (demand >= 70) return 'bg-red-500';
    if (demand >= 40) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
        <p className="text-gray-300">Loading demand predictions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">AI Demand Predictions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {predictions.map((prediction) => (
            <div
              key={prediction._id}
              className="glass rounded-xl p-4 border-2 border-white/10 card-hover"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-4 h-4 rounded-full ${getDemandColor(prediction.predictedDemand)}`}></div>
                <span className="text-2xl font-bold text-white">{prediction.predictedDemand}%</span>
              </div>
              <p className="text-sm text-gray-300 mb-2">{prediction.location.address}</p>
              <div className="space-y-1 text-xs text-gray-400">
                <p>Confidence: {Math.round(prediction.confidence * 100)}%</p>
                <p>Recommended Drivers: {prediction.recommendedDrivers}</p>
              </div>
              <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-xs text-gray-400 mb-1">Factors:</p>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-2 py-1 bg-blue-500/20 rounded text-xs text-blue-300">
                    Historical: {Math.round(prediction.factors.historicalData * 100)}%
                  </span>
                  <span className="px-2 py-1 bg-purple-500/20 rounded text-xs text-purple-300">
                    Time: {Math.round(prediction.factors.timeOfDay * 100)}%
                  </span>
                  <span className="px-2 py-1 bg-pink-500/20 rounded text-xs text-pink-300">
                    Day: {Math.round(prediction.factors.dayOfWeek * 100)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

