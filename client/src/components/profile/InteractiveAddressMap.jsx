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

  const sendRemoteLog = (event, message, data = null) => {
    fetch('/api/debug/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, message, data })
    }).catch(() => {});
  };

  const handleGeolocate = async () => {
    setIsLocating(true);
    sendRemoteLog('LOCATION_REQUESTED', `User clicked "Use My Current Location" from protocol: ${window.location.protocol}`);

    // Try HTML5 Hardware GPS first
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newCoords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          };
          sendRemoteLog('GPS_SUCCESS', `Hardware GPS Acquired accurately (Accuracy: ~${Math.round(pos.coords.accuracy)}m)`, newCoords);
          setCoords(newCoords);
          onLocationChange?.(newCoords);
          setIsLocating(false);
        },
        async (err) => {
          sendRemoteLog('GPS_ERROR', `GPS failed (Code ${err.code}): ${err.message}. Falling back to IP Geolocation...`);
          await fallbackIpLocation();
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      sendRemoteLog('GPS_NOT_SUPPORTED', 'navigator.geolocation is not supported on this device/browser');
      await fallbackIpLocation();
    }
  };

  const fallbackIpLocation = async () => {
    try {
      sendRemoteLog('IP_LOCATION_START', 'Attempting IP Geolocation lookup...');
      
      let coordsFound = null;

      // Provider 1: ipwho.is (Free, HTTPS, open CORS)
      if (!coordsFound) {
        try {
          const res = await fetch('https://ipwho.is/');
          if (res.ok) {
            const data = await res.json();
            if (data && data.success !== false && data.latitude && data.longitude) {
              coordsFound = {
                lat: Number(data.latitude),
                lng: Number(data.longitude),
                city: data.city || data.region || 'Metro Manila',
                region: data.country || 'PH'
              };
              sendRemoteLog('PROVIDER_SUCCESS', 'ipwho.is returned coordinates', coordsFound);
            }
          }
        } catch (e) {
          sendRemoteLog('PROVIDER_FAIL', `ipwho.is failed: ${e.message}`);
        }
      }

      // Provider 2: get.geojs.io (Free, HTTPS, open CORS)
      if (!coordsFound) {
        try {
          const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
          if (res.ok) {
            const data = await res.json();
            if (data && data.latitude && data.longitude) {
              coordsFound = {
                lat: Number(data.latitude),
                lng: Number(data.longitude),
                city: data.city || 'Metro Manila',
                region: data.country || 'PH'
              };
              sendRemoteLog('PROVIDER_SUCCESS', 'geojs.io returned coordinates', coordsFound);
            }
          }
        } catch (e) {
          sendRemoteLog('PROVIDER_FAIL', `geojs.io failed: ${e.message}`);
        }
      }

      // Provider 3: Backend proxy
      if (!coordsFound) {
        try {
          const res = await fetch('/api/location/lookup');
          if (res.ok) {
            const json = await res.json();
            const data = json && json.data;
            if (data && (data.latitude || data.lat)) {
              coordsFound = {
                lat: Number(data.latitude || data.lat),
                lng: Number(data.longitude || data.lon),
                city: data.city || 'Metro Manila',
                region: data.region || 'PH'
              };
            }
          }
        } catch (e) {
          sendRemoteLog('PROVIDER_FAIL', `backend proxy failed: ${e.message}`);
        }
      }

      if (coordsFound) {
        const newCoords = { lat: coordsFound.lat, lng: coordsFound.lng };
        sendRemoteLog('IP_LOCATION_SUCCESS', `IP Geolocation Acquired (${coordsFound.city}, ${coordsFound.region})`, newCoords);
        setCoords(newCoords);
        onLocationChange?.(newCoords);
      } else {
        const defaultPH = { lat: 14.5995, lng: 120.9842 };
        sendRemoteLog('IP_LOCATION_DEFAULT', 'Using default Metro Manila coordinates', defaultPH);
        setCoords(defaultPH);
        onLocationChange?.(defaultPH);
      }
    } catch (err) {
      sendRemoteLog('IP_LOCATION_FAILED', `IP location error: ${err.message || String(err)}`);
      const defaultPH = { lat: 14.5995, lng: 120.9842 };
      setCoords(defaultPH);
      onLocationChange?.(defaultPH);
    } finally {
      setIsLocating(false);
    }
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
          scrollWheelZoom={true}
          touchZoom={true}
          doubleClickZoom={true}
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
