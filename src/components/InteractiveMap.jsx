import React, { useEffect, useRef } from 'react';
import { MapPin, Navigation } from 'lucide-react';

export default function InteractiveMap({ lat, lng, name, address }) {
  const mapRef = useRef(null);
  const leafletInstance = useRef(null);

  const latitude = lat || 30.1333; // Default Ghadames
  const longitude = lng || 9.5;

  useEffect(() => {
    if (typeof window !== 'undefined' && window.L && mapRef.current) {
      if (!leafletInstance.current) {
        leafletInstance.current = window.L.map(mapRef.current).setView([latitude, longitude], 14);

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(leafletInstance.current);

        const customIcon = window.L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background-color:#FF6D00; width:32px; height:32px; border-radius:50%; border:3px solid white; display:flex; align-items:center; justify-center; color:white; font-weight:bold; shadow:0 4px 10px rgba(0,0,0,0.3); justify-content:center"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32]
        });

        window.L.marker([latitude, longitude], { icon: customIcon })
          .addTo(leafletInstance.current)
          .bindPopup(`<b>${name || 'غدامس'}</b><br/>${address || ''}`)
          .openPopup();
      }
    }
  }, [latitude, longitude, name, address]);

  const handleOpenDirections = () => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`, '_blank');
  };

  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 relative group">
      <div ref={mapRef} className="h-64 sm:h-72 w-full z-10"></div>
      
      <div className="absolute bottom-3 left-3 z-20">
        <button
          onClick={handleOpenDirections}
          className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-900 text-white font-bold text-xs px-3.5 py-2 rounded-xl shadow-lg backdrop-blur-md transition-all"
        >
          <Navigation className="w-4 h-4 text-orange-400" />
          <span>فتح الاتجاهات على الخريطة</span>
        </button>
      </div>
    </div>
  );
}
