import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation, Compass } from 'lucide-react';

// Custom Pin Icon using Leaflet standard DivIcon
const customIcon = L.divIcon({
  className: 'custom-pin-marker',
  html: `
    <div style="
      background-color: #2D3A31;
      width: 32px;
      height: 32px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      border: 2px solid #FFFFFF;
    ">
      <div style="
        width: 10px;
        height: 10px;
        background-color: #8C9A84;
        border-radius: 50%;
      "></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Click listener inside map
function LocationPicker({ position, onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position ? <Marker position={[position.lat, position.lng]} icon={customIcon} /> : null;
}

// Map center updater
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], zoom);
  }, [center.lat, center.lng, zoom, map]);
  return null;
}

export const InteractiveAddressMap = ({ initialLocation, onLocationChange }) => {
  const [coords, setCoords] = useState(
    initialLocation?.lat && initialLocation?.lng
      ? initialLocation
      : { lat: 14.5995, lng: 120.9842 } // Default Metro Manila
  );
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (initialLocation?.lat && initialLocation?.lng) {
      setCoords(initialLocation);
    }
  }, [initialLocation]);

  const handleSelectLocation = (lat, lng) => {
    const newCoords = { lat, lng };
    setCoords(newCoords);
    onLocationChange?.(newCoords);
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newCoords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        setCoords(newCoords);
        onLocationChange?.(newCoords);
        setIsLocating(false);
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-botanical-forest/80 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-botanical-sage" />
          <span>Pinpoint Delivery Location on Map</span>
        </label>
        <button
          type="button"
          onClick={handleGeolocate}
          disabled={isLocating}
          className="text-xs font-semibold text-botanical-terracotta hover:text-botanical-forest transition-colors flex items-center gap-1 bg-botanical-bg py-1 px-3 rounded-full border border-botanical-stone"
        >
          <Navigation className="w-3 h-3" />
          <span>{isLocating ? 'Locating...' : 'Use My Current Location'}</span>
        </button>
      </div>

      <p className="text-[11px] text-botanical-forest/60">
        Click anywhere on the map to place your delivery pin. Our couriers use this exact spot for doorstep dropoff.
      </p>

      {/* Map Container */}
      <div className="relative w-full h-[280px] sm:h-[340px] rounded-3xl overflow-hidden border border-botanical-stone shadow-xs z-0">
        <MapContainer
          center={[coords.lat, coords.lng]}
          zoom={15}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <ChangeView center={coords} zoom={15} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationPicker position={coords} onLocationSelect={handleSelectLocation} />
        </MapContainer>

        {/* GPS Coordinates Badge */}
        <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-botanical-stone shadow-xs text-[10px] font-mono text-botanical-forest flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-botanical-sage" />
          <span>Lat: {coords.lat.toFixed(5)}, Lng: {coords.lng.toFixed(5)}</span>
        </div>
      </div>
    </div>
  );
};
