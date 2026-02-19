'use client';

import { useState, useEffect } from 'react';

interface SafetyAnalytics {
  _id: string;
  safetyScore: number;
  riskFactors: {
    weather: number;
    traffic: number;
    timeOfDay: number;
    routeComplexity: number;
    driverHistory?: number;
    vehicleCondition?: number;
  };
  predictions: {
    accidentProbability: number;
    delayProbability: number;
    routeSafety: number;
  };
  recommendations: Array<{
    type: string;
    priority: 'low' | 'medium' | 'high';
    message: string;
    action?: string;
  }>;
  alerts: Array<{
    type: string;
    severity: 'info' | 'warning' | 'critical';
    message: string;
    timestamp: Date;
  }>;
}

interface SafetyAnalyticsDashboardProps {
  tripId: string;
}

export default function SafetyAnalyticsDashboard({ tripId }: SafetyAnalyticsDashboardProps) {
  const [safetyAnalytics, setSafetyAnalytics] = useState<SafetyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSafetyAnalytics();
  }, [tripId]);

  const fetchSafetyAnalytics = async () => {
    try {
      const response = await fetch(`/api/ai/safety-analytics?tripId=${tripId}`);
      const data = await response.json();
      if (response.ok && data.safetyAnalytics && data.safetyAnalytics.length > 0) {
        setSafetyAnalytics(data.safetyAnalytics[0]);
      }
    } catch (err) {
      console.error('Error fetching safety analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const analyzeSafety = async () => {
    try {
      const response = await fetch('/api/ai/safety-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tripId }),
      });
      const data = await response.json();
      if (response.ok) {
        setSafetyAnalytics(data.safetyAnalytics);
      }
    } catch (err) {
      console.error('Error analyzing safety:', err);
    }
  };

  if (loading) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
        <p className="text-gray-300">Loading safety analytics...</p>
      </div>
    );
  }

  if (!safetyAnalytics) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <p className="text-gray-300 mb-4">No safety analysis available</p>
        <button
          onClick={analyzeSafety}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg font-semibold text-white hover:scale-105 transition-transform"
        >
          Analyze Safety
        </button>
      </div>
    );
  }

  const getSafetyColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getSafetyBg = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 border-green-500/50';
    if (score >= 60) return 'bg-yellow-500/20 border-yellow-500/50';
    if (score >= 40) return 'bg-orange-500/20 border-orange-500/50';
    return 'bg-red-500/20 border-red-500/50';
  };

  return (
    <div className="space-y-6">
      {/* Safety Score Card */}
      <div className={`glass rounded-2xl p-6 border-2 ${getSafetyBg(safetyAnalytics.safetyScore)}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Safety Analytics</h2>
          <button
            onClick={analyzeSafety}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-sm font-semibold text-white hover:scale-105 transition-transform"
          >
            Re-analyze
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="inline-block relative">
            <div className="text-6xl font-bold mb-2">
              <span className={getSafetyColor(safetyAnalytics.safetyScore)}>
                {safetyAnalytics.safetyScore}
              </span>
              <span className="text-3xl text-gray-400">/100</span>
            </div>
            <div className="text-gray-300">Overall Safety Score</div>
          </div>
        </div>

        {/* Predictions */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="glass rounded-xl p-4">
            <p className="text-sm text-gray-400 mb-1">Accident Probability</p>
            <p className="text-2xl font-bold text-red-400">
              {Math.round(safetyAnalytics.predictions.accidentProbability * 100)}%
            </p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-sm text-gray-400 mb-1">Delay Probability</p>
            <p className="text-2xl font-bold text-yellow-400">
              {Math.round(safetyAnalytics.predictions.delayProbability * 100)}%
            </p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-sm text-gray-400 mb-1">Route Safety</p>
            <p className="text-2xl font-bold text-green-400">
              {safetyAnalytics.predictions.routeSafety}/100
            </p>
          </div>
        </div>

        {/* Risk Factors */}
        <div className="mb-6">
          <p className="text-sm text-gray-400 mb-3">Risk Factors</p>
          <div className="space-y-2">
            {Object.entries(safetyAnalytics.riskFactors).map(([factor, value]) => (
              <div key={factor} className="glass rounded-lg p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-300 capitalize">{factor.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="text-sm font-semibold text-white">{Math.round(value * 100)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-500 to-yellow-500"
                    style={{ width: `${value * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        {safetyAnalytics.recommendations.length > 0 && (
          <div className="mb-6">
            <p className="text-sm text-gray-400 mb-3">Recommendations</p>
            <div className="space-y-2">
              {safetyAnalytics.recommendations.map((rec, index) => (
                <div
                  key={index}
                  className={`glass rounded-lg p-4 border-l-4 ${
                    rec.priority === 'high'
                      ? 'border-red-500'
                      : rec.priority === 'medium'
                      ? 'border-yellow-500'
                      : 'border-blue-500'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-white font-medium mb-1">{rec.message}</p>
                      <span className={`text-xs px-2 py-1 rounded ${
                        rec.priority === 'high'
                          ? 'bg-red-500/20 text-red-300'
                          : rec.priority === 'medium'
                          ? 'bg-yellow-500/20 text-yellow-300'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {rec.priority.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alerts */}
        {safetyAnalytics.alerts.length > 0 && (
          <div>
            <p className="text-sm text-gray-400 mb-3">Safety Alerts</p>
            <div className="space-y-2">
              {safetyAnalytics.alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`glass rounded-lg p-3 border-l-4 ${
                    alert.severity === 'critical'
                      ? 'border-red-500 bg-red-500/10'
                      : alert.severity === 'warning'
                      ? 'border-yellow-500 bg-yellow-500/10'
                      : 'border-blue-500 bg-blue-500/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`text-lg ${
                      alert.severity === 'critical' ? 'text-red-400' : alert.severity === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                    }`}>
                      {alert.severity === 'critical' ? '🚨' : alert.severity === 'warning' ? '⚠️' : 'ℹ️'}
                    </span>
                    <div>
                      <p className="text-white font-medium">{alert.message}</p>
                      <p className="text-xs text-gray-400 capitalize">{alert.type}</p>
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

