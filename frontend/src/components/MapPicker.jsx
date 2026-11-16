import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Crosshair, MapPin, Search } from 'lucide-react';
import { complaintService } from '../services/complaintService';

// Custom SVG marker pin for clean crisp OpenStreetMap display
const createCustomIcon = () => {
  return L.divIcon({
    className: 'custom-pin-marker',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px;">
        <span style="position: absolute; width: 36px; height: 36px; background-color: rgba(22, 163, 74, 0.25); border-radius: 9999px; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
        <div style="background-color: #16a34a; color: white; width: 30px; height: 30px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); border: 2px solid white;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });
};

export default function MapPicker({
  initialLat = 12.9716,
  initialLon = 77.5946,
  onLocationChange,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [coords, setCoords] = useState({ lat: initialLat, lon: initialLon });
  const [address, setAddress] = useState('');
  const [locating, setLocating] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [coords.lat, coords.lon],
        zoom: 14,
        zoomControl: true,
      });

      // OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Add draggable Marker
      const marker = L.marker([coords.lat, coords.lon], {
        icon: createCustomIcon(),
        draggable: true,
      }).addTo(map);

      marker.on('dragend', async (e) => {
        const { lat, lng } = e.target.getLatLng();
        updateLocation(lat, lng);
      });

      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        updateLocation(lat, lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Initial reverse geocode
      updateLocation(coords.lat, coords.lon);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const updateLocation = async (lat, lon) => {
    const fixedLat = Number(lat.toFixed(6));
    const fixedLon = Number(lon.toFixed(6));
    setCoords({ lat: fixedLat, lon: fixedLon });
    setGeocoding(true);

    try {
      const resolvedAddress = await complaintService.reverseGeocode(fixedLat, fixedLon);
      setAddress(resolvedAddress);
      if (onLocationChange) {
        onLocationChange({
          latitude: fixedLat,
          longitude: fixedLon,
          address: resolvedAddress,
        });
      }
    } catch {
      setAddress(`Lat: ${fixedLat}, Lon: ${fixedLon}`);
      if (onLocationChange) {
        onLocationChange({
          latitude: fixedLat,
          longitude: fixedLon,
          address: `Lat: ${fixedLat}, Lon: ${fixedLon}`,
        });
      }
    } finally {
      setGeocoding(false);
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocating(false);
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 16);
          markerRef.current.setLatLng([latitude, longitude]);
          updateLocation(latitude, longitude);
        }
      },
      (err) => {
        setLocating(false);
        console.warn('Geolocation failed:', err.message);
        alert('Could not detect location. Please click on the map to place the pin.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span>Click map or drag marker to set exact issue location</span>
        </div>
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={locating}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors shadow-sm"
        >
          <Crosshair className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
          <span>{locating ? 'Detecting...' : 'Detect My GPS'}</span>
        </button>
      </div>

      {/* Map Canvas */}
      <div className="relative h-64 sm:h-72 w-full rounded-xl border border-slate-300 overflow-hidden shadow-inner bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* Address & Coordinates Bar */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 truncate">
          <span className="font-semibold text-slate-700 shrink-0">Selected Address:</span>
          <span className="text-slate-600 truncate">
            {geocoding ? 'Looking up street address...' : address || 'Click on map to choose'}
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-500 font-mono text-[11px] shrink-0">
          <span>Lat: {coords.lat.toFixed(5)}</span>
          <span>Lon: {coords.lon.toFixed(5)}</span>
        </div>
      </div>
    </div>
  );
}
