import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function HotspotMap({ hotspots = [], height = '500px' }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [12.9716, 77.5946],
        zoom: 12,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      const lg = L.layerGroup().addTo(map);
      layerGroupRef.current = lg;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !layerGroupRef.current) return;

    layerGroupRef.current.clearLayers();

    if (hotspots.length === 0) return;

    const bounds = L.latLngBounds();

    hotspots.forEach((hs) => {
      bounds.extend([hs.latitude, hs.longitude]);

      const circleColor = hs.priority_level === 'Critical' 
        ? '#dc2626' 
        : hs.priority_level === 'High' 
        ? '#ea580c' 
        : '#eab308';

      // 1. Heat/Proximity circle
      const circle = L.circle([hs.latitude, hs.longitude], {
        color: circleColor,
        fillColor: circleColor,
        fillOpacity: 0.22,
        radius: hs.radius_meters || 350,
        weight: 2,
      });

      // 2. Centroid pulsing marker
      const centerMarker = L.circleMarker([hs.latitude, hs.longitude], {
        radius: 8,
        color: '#ffffff',
        fillColor: circleColor,
        fillOpacity: 1,
        weight: 2,
      });

      const popupHtml = `
        <div style="font-family: sans-serif; font-size: 12px; color: #1e293b; max-width: 280px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-weight: 700; color: ${circleColor}; font-size: 13px;">🔥 ${hs.name}</span>
            <span style="background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700;">
              ${hs.priority_level}
            </span>
          </div>
          <div style="color: #475569; font-size: 11px; margin-bottom: 6px;">
            <b>${hs.total_complaints}</b> complaints (${hs.unresolved_complaints} unresolved)
          </div>
          <div style="background: #f8fafc; border-left: 3px solid ${circleColor}; padding: 6px; border-radius: 4px; font-size: 11px; margin-bottom: 6px;">
            <b>Recommendation:</b> ${hs.recommendation}
          </div>
          <div style="font-size: 10px; color: #64748b;">
            <b>Budget Scope:</b> ${hs.estimated_budget_impact}
          </div>
        </div>
      `;

      circle.bindPopup(popupHtml);
      centerMarker.bindPopup(popupHtml);

      layerGroupRef.current.addLayer(circle);
      layerGroupRef.current.addLayer(centerMarker);
    });

    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
  }, [hotspots]);

  return (
    <div className="relative w-full rounded-2xl border border-slate-200 overflow-hidden shadow-sm bg-slate-100" style={{ height }}>
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
