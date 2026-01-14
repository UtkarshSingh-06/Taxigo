'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('./MapView'), { ssr: false });

interface RouteOptimization {
  _id: string;
  optimizedRoute: Array<{ lat: number; lng: number; step: number }>;
  distance: number;
  estimatedTime: number;
  trafficFactor: number;
  optimizationScore: number;
  alternativeRoutes?: Array<{
    route: Array<{ lat: number; lng: number }>;
    distance: number;
    estimatedTime: number;
    trafficFactor: number;
  }>;
  realTimeUpdates?: Array<{
    timestamp: Date;
    location: { lat: number; lng: number };
    trafficCondition: string;
    estimatedDelay: number;
  }>;
}

interface RouteOptimizationViewProps {
  tripId: string;
}

export default function RouteOptimizationView({ tripId }: RouteOptimizationViewProps) {
  const [routeOptimization, setRouteOptimization] = useState<RouteOptimization | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState(0);

  useEffect(() => {
    fetchRouteOptimization();
    // Poll for real-time updates
    const interval = setInterval(fetchRouteOptimization, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [tripId]);

  const fetchRouteOptimization = async () => {
    try {
      const response = await fetch(`/api/routes/optimize-realtime?tripId=${tripId}`);
      const data = await response.json();
      if (response.ok && data.routeOptimization) {
        setRouteOptimization(data.routeOptimization);
      }
    } catch (err) {
      console.error('Error fetching route optimization:', err);
    } finally {
      setLoading(false);
    }
  };

  const optimizeRoute = async () => {
    try {
      const response = await fetch('/api/routes/optimize-realtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId }),
      });
      const data = await response.json();
      if (response.ok) {
        setRouteOptimization(data.routeOptimization);
      }
    } catch (err) {
      console.error('Error optimizing route:', err);
    }
  };

  if (loading) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
        <p className="text-gray-300">Loading route optimization...</p>
      </div>
    );
  }

  if (!routeOptimization) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <p className="text-gray-300 mb-4">No optimized route available</p>
        <button
          onClick={optimizeRoute}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-semibold text-white hover:scale-105 transition-transform"
        >
          Optimize Route
        </button>
      </div>
    );
  }

  const routes = [
    { route: routeOptimization.optimizedRoute, ...routeOptimization },
    ...(routeOptimization.alternativeRoutes || []),
  ];

  const currentRoute = routes[selectedRoute];

  const getTrafficColor = (factor: number) => {
    if (factor > 0.7) return 'text-red-400';
    if (factor > 0.4) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Route Optimization</h2>
          <button
            onClick={optimizeRoute}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-sm font-semibold text-white hover:scale-105 transition-transform"
          >
            Re-optimize
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="glass rounded-xl p-4 border-2 border-blue-500/30">
            <p className="text-sm text-gray-400 mb-1">Distance</p>
            <p className="text-2xl font-bold text-white">{currentRoute.distance} km</p>
          </div>
          <div className="glass rounded-xl p-4 border-2 border-green-500/30">
            <p className="text-sm text-gray-400 mb-1">Estimated Time</p>
            <p className="text-2xl font-bold text-white">{currentRoute.estimatedTime} min</p>
          </div>
          <div className="glass rounded-xl p-4 border-2 border-purple-500/30">
            <p className="text-sm text-gray-400 mb-1">Optimization Score</p>
            <p className="text-2xl font-bold text-white">{routeOptimization.optimizationScore}/100</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">Traffic Condition</p>
          <div className="flex items-center gap-2">
            <div className={`flex-1 h-2 bg-gray-700 rounded-full overflow-hidden`}>
              <div
                className={`h-full ${getTrafficColor(currentRoute.trafficFactor).replace('text-', 'bg-')}`}
                style={{ width: `${currentRoute.trafficFactor * 100}%` }}
              ></div>
            </div>
            <span className={`text-sm font-semibold ${getTrafficColor(currentRoute.trafficFactor)}`}>
              {currentRoute.trafficFactor < 0.4 ? 'Light' : currentRoute.trafficFactor < 0.7 ? 'Moderate' : 'Heavy'}
            </span>
          </div>
        </div>

        {routes.length > 1 && (
          <div className="mb-4">
            <p className="text-sm text-gray-400 mb-2">Alternative Routes</p>
            <div className="flex gap-2 flex-wrap">
              {routes.map((route, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedRoute(index)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedRoute === index
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      : 'glass text-gray-300 hover:bg-white/10'
                  }`}
                >
                  Route {index + 1} ({route.estimatedTime} min)
                </button>
              ))}
            </div>
          </div>
        )}

        {routeOptimization.realTimeUpdates && routeOptimization.realTimeUpdates.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-400 mb-2">Real-Time Updates</p>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {routeOptimization.realTimeUpdates.slice(-5).map((update, index) => (
                <div key={index} className="glass rounded-lg p-3 text-sm">
                  <p className="text-gray-300">
                    {new Date(update.timestamp).toLocaleTimeString()} - {update.trafficCondition}
                  </p>
                  {update.estimatedDelay > 0 && (
                    <p className="text-yellow-400">Estimated delay: {update.estimatedDelay} min</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {currentRoute.route && currentRoute.route.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <MapView
            origin={currentRoute.route[0]}
            destination={currentRoute.route[currentRoute.route.length - 1]}
            route={currentRoute.route}
            height="400px"
          />
        </div>
      )}
    </div>
  );
}

