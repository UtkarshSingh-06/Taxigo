'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import MapView from './MapView';

interface TripTrackingProps {
  tripId: string;
  origin: { lat: number; lng: number; address?: string };
  destination: { lat: number; lng: number; address?: string };
  driverLocation?: { lat: number; lng: number };
}

export default function TripTracking({
  tripId,
  origin,
  destination,
  driverLocation: initialDriverLocation,
}: TripTrackingProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [driverLocation, setDriverLocation] = useState(initialDriverLocation);
  const [route, setRoute] = useState<Array<{ lat: number; lng: number }>>([]);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to tracking server');
      newSocket.emit('join-trip', tripId);
    });

    newSocket.on('driver-location-update', (data: { lat: number; lng: number }) => {
      setDriverLocation(data);
    });

    newSocket.on('route-update', (data: Array<{ lat: number; lng: number }>) => {
      setRoute(data);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [tripId]);

  return (
    <div className="w-full">
      <MapView
        origin={origin}
        destination={destination}
        currentLocation={driverLocation}
        route={route}
        height="500px"
        showRoute={true}
      />
      {driverLocation && (
        <div className="mt-4 p-4 bg-white rounded-lg shadow">
          <p className="text-sm text-gray-600">
            <strong>Driver Location:</strong> {driverLocation.lat.toFixed(6)},{' '}
            {driverLocation.lng.toFixed(6)}
          </p>
        </div>
      )}
    </div>
  );
}

