import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';

const getPinColor = (status, priority) => {
  if (status === 'Resolved') return '#16a34a'; // Emerald
  if (priority === 'Critical') return '#dc2626'; // Red
  if (priority === 'High') return '#ea580c'; // Orange
  if (status === 'In Progress') return '#d97706'; // Amber
  if (status === 'Verified') return '#9333ea'; // Purple
  return '#2563eb'; // Blue
};

const createMarkerIcon = (complaint) => {
  const color = getPinColor(complaint.status, complaint.priority);
  return L.divIcon({
    className: 'civic-complaint-pin',
    html: `
      <div style="cursor: pointer; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; position: relative;">
        <div style="background-color: ${color}; color: white; width: 28px; height: 28px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 2px solid #ffffff;">
          <span style="font-size: 11px; font-weight: bold;">!</span>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

export default function ComplaintsMap({
  complaints = [],
  centerLat = 12.9716,
  centerLon = 77.5946,
  zoom = 13,
  height = '480px',
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const navigate = useNavigate();

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLon],
        zoom: zoom,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers when complaints change
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const bounds = L.latLngBounds();
    let hasCoords = false;

    complaints.forEach((comp) => {
      if (!comp.latitude || !comp.longitude) return;

      hasCoords = true;
      bounds.extend([comp.latitude, comp.longitude]);

      const marker = L.marker([comp.latitude, comp.longitude], {
        icon: createMarkerIcon(comp),
      });

      const popupHtml = `
        <div style="min-width: 200px; max-width: 260px; font-family: sans-serif; font-size: 12px; color: #1e293b;">
          ${
            comp.image_url
              ? `<img src="${comp.image_url}" alt="Civic Issue" style="width: 100%; height: 110px; object-fit: cover; border-radius: 6px; margin-bottom: 8px;" onerror="this.style.display='none'" />`
              : ''
          }
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-weight: 700; color: #16a34a;">${comp.tracking_number}</span>
            <span style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600;">${comp.priority}</span>
          </div>
          <div style="font-weight: 600; font-size: 13px; line-height: 1.3; margin-bottom: 4px; color: #0f172a;">${comp.title}</div>
          <div style="color: #64748b; font-size: 11px; margin-bottom: 6px;">📍 ${comp.address || 'Address registered'}</div>
          <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 6px; margin-top: 4px;">
            <span style="font-size: 11px; font-weight: 600; color: #334155;">Status: <b>${comp.status}</b></span>
            <a href="/track/${comp.tracking_number}" style="color: #16a34a; font-weight: 600; text-decoration: none; font-size: 11px;">View &rarr;</a>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      markersLayerRef.current.addLayer(marker);
    });

    if (hasCoords && complaints.length > 1) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    } else if (hasCoords && complaints.length === 1) {
      mapInstanceRef.current.setView([complaints[0].latitude, complaints[0].longitude], 15);
    }
  }, [complaints]);

  return (
    <div className="relative w-full rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-slate-100" style={{ height }}>
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl border border-slate-200 shadow-md z-[400] text-[11px] flex flex-wrap items-center gap-3">
        <span className="font-bold text-slate-700">Map Legend:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
          <span className="text-slate-600">Critical</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
          <span className="text-slate-600">High</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span className="text-slate-600">In Progress</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
          <span className="text-slate-600">Resolved</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          <span className="text-slate-600">Submitted</span>
        </div>
      </div>
    </div>
  );
}
