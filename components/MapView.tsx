'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface MapViewProps {
  origin?: { lat: number; lng: number; address?: string };
  destination?: { lat: number; lng: number; address?: string };
  currentLocation?: { lat: number; lng: number };
  route?: Array<{ lat: number; lng: number }>;
  height?: string;
  showRoute?: boolean;
}

export default function MapView({
  origin,
  destination,
  currentLocation,
  route,
  height = '400px',
  showRoute = true,
}: MapViewProps) {
  const mapRef = useRef<L.Map>(null);

  useEffect(() => {
    if (mapRef.current && (origin || destination || currentLocation)) {
      const bounds: L.LatLngExpression[] = [];
      
      if (origin) bounds.push([origin.lat, origin.lng]);
      if (destination) bounds.push([destination.lat, destination.lng]);
      if (currentLocation) bounds.push([currentLocation.lat, currentLocation.lng]);

      if (bounds.length > 0) {
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [origin, destination, currentLocation]);

  const center: [number, number] = origin
    ? [origin.lat, origin.lng]
    : currentLocation
    ? [currentLocation.lat, currentLocation.lng]
    : [28.6139, 77.209]; // Default to Delhi

  return (
    <div style={{ height, width: '100%' }} className="rounded-lg overflow-hidden">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {origin && (
          <Marker position={[origin.lat, origin.lng]}>
            <Popup>
              <div>
                <strong>Pickup</strong>
                <br />
                {origin.address || `${origin.lat}, ${origin.lng}`}
              </div>
            </Popup>
          </Marker>
        )}

        {destination && (
          <Marker position={[destination.lat, destination.lng]}>
            <Popup>
              <div>
                <strong>Destination</strong>
                <br />
                {destination.address || `${destination.lat}, ${destination.lng}`}
              </div>
            </Popup>
          </Marker>
        )}

        {currentLocation && (
          <Marker position={[currentLocation.lat, currentLocation.lng]}>
            <Popup>
              <div>
                <strong>Current Location</strong>
                <br />
                {currentLocation.lat}, {currentLocation.lng}
              </div>
            </Popup>
          </Marker>
        )}

        {showRoute && route && route.length > 0 && (
          <Polyline
            positions={route.map((point) => [point.lat, point.lng])}
            color="blue"
            weight={4}
            opacity={0.7}
          />
        )}

        {showRoute && origin && destination && !route && (
          <Polyline
            positions={[
              [origin.lat, origin.lng],
              [destination.lat, destination.lng],
            ]}
            color="blue"
            weight={4}
            opacity={0.7}
            dashArray="10, 10"
          />
        )}
      </MapContainer>
    </div>
  );
}

