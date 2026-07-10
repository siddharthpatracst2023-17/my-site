import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Navigation, Car, Compass, Zap, Layers, RefreshCw } from 'lucide-react';
import { Location, Supplier, BookingStatus, Driver } from '../types';
import { LOCATIONS, SUPPLIERS } from '../constants';

interface MapTrackerProps {
  pickup: Location | null;
  dropoff: Location | null;
  activeSupplier: Supplier | null;
  activeDriver: Driver | null;
  bookingStatus: BookingStatus;
  progress: number; // 0 to 100 representing trip progress
}

interface AmbientCab {
  id: string;
  lat: number;
  lng: number;
  color: string;
  angle: number;
  name: string;
}

export default function MapTracker({
  pickup,
  dropoff,
  activeSupplier,
  activeDriver,
  bookingStatus,
  progress
}: MapTrackerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ambientCabs, setAmbientCabs] = useState<AmbientCab[]>([]);
  const [driverPos, setDriverPos] = useState<{ lat: number; lng: number } | null>(null);
  const [showSuppliers, setShowSuppliers] = useState(true);
  const [mapTheme, setMapTheme] = useState<'midnight' | 'light' | 'emerald'>('midnight');

  // Initialize random roaming cabs on mount
  useEffect(() => {
    const cabs: AmbientCab[] = [];
    for (let i = 0; i < 12; i++) {
      const randomSupplier = SUPPLIERS[Math.floor(Math.random() * SUPPLIERS.length)];
      cabs.push({
        id: `ambient-${i}`,
        lat: 10 + Math.random() * 80,
        lng: 10 + Math.random() * 80,
        color: randomSupplier.color,
        angle: Math.random() * 360,
        name: randomSupplier.name
      });
    }
    setAmbientCabs(cabs);
  }, []);

  // Update roaming cabs (ambient movement)
  useEffect(() => {
    const timer = setInterval(() => {
      setAmbientCabs(prev => 
        prev.map(cab => {
          // Gently shift coordinates to simulate driving
          const angleRad = (cab.angle * Math.PI) / 180;
          let newLat = cab.lat + Math.sin(angleRad) * 0.4;
          let newLng = cab.lng + Math.cos(angleRad) * 0.4;
          let newAngle = cab.angle;

          // Bounce off map edges
          if (newLat < 5 || newLat > 95 || newLng < 5 || newLng > 95) {
            newAngle = (cab.angle + 180) % 360;
            newLat = Math.max(5, Math.min(95, newLat));
            newLng = Math.max(5, Math.min(95, newLng));
          } else if (Math.random() < 0.05) {
            // Randomly turn slightly
            newAngle = (cab.angle + (Math.random() * 60 - 30)) % 360;
          }

          return {
            ...cab,
            lat: parseFloat(newLat.toFixed(2)),
            lng: parseFloat(newLng.toFixed(2)),
            angle: newAngle
          };
        })
      );
    }, 400);

    return () => clearInterval(timer);
  }, []);

  // Live driver position calculation based on booking status & progress
  useEffect(() => {
    if (!pickup) {
      setDriverPos(null);
      return;
    }

    // Driver starting point for "en-route to pickup" (simulate from a nearby coordinate)
    const driverStartLat = pickup.lat - 12;
    const driverStartLng = pickup.lng + 15;

    if (bookingStatus === 'driver_assigned' || bookingStatus === 'driver_en_route') {
      // Interpolate from start coordinate to pickup point based on progress
      const factor = progress / 100;
      const currentLat = driverStartLat + (pickup.lat - driverStartLat) * factor;
      const currentLng = driverStartLng + (pickup.lng - driverStartLng) * factor;
      setDriverPos({ lat: currentLat, lng: currentLng });
    } else if (bookingStatus === 'trip_active' && dropoff) {
      // Interpolate from pickup to dropoff based on progress
      const factor = progress / 100;
      const currentLat = pickup.lat + (dropoff.lat - pickup.lat) * factor;
      const currentLng = pickup.lng + (dropoff.lng - pickup.lng) * factor;
      setDriverPos({ lat: currentLat, lng: currentLng });
    } else if (bookingStatus === 'completed' && dropoff) {
      setDriverPos({ lat: dropoff.lat, lng: dropoff.lng });
    } else {
      setDriverPos(null);
    }
  }, [bookingStatus, progress, pickup, dropoff]);

  // Determine themes colors
  const themeClasses = {
    midnight: {
      bg: 'bg-[#0B0B0C] elegant-dots',
      river: 'fill-[#121214]/65 stroke-zinc-800/40',
      grid: 'stroke-zinc-800/20',
      parks: 'fill-zinc-900/50 stroke-zinc-800/10',
      roads: 'stroke-zinc-900',
      labelBg: 'bg-[#121214]/95 text-zinc-300 border-zinc-800/80'
    },
    light: {
      bg: 'bg-stone-50',
      river: 'fill-blue-100/70 stroke-blue-200/50',
      grid: 'stroke-stone-200/50',
      parks: 'fill-emerald-100/30 stroke-emerald-200/20',
      roads: 'stroke-stone-200/80',
      labelBg: 'bg-white/90 text-stone-800 border-stone-200'
    },
    emerald: {
      bg: 'bg-zinc-900',
      river: 'fill-sky-950/30 stroke-sky-900/20',
      grid: 'stroke-zinc-800/60',
      parks: 'fill-green-950/20 stroke-green-900/20',
      roads: 'stroke-zinc-800/80',
      labelBg: 'bg-zinc-950/90 text-zinc-100 border-zinc-800'
    }
  }[mapTheme];

  // Calculate driving angle for active driver icon
  const getDriverAngle = () => {
    if (bookingStatus === 'driver_en_route' && pickup) {
      const driverStartLat = pickup.lat - 12;
      const driverStartLng = pickup.lng + 15;
      const dy = pickup.lat - driverStartLat;
      const dx = pickup.lng - driverStartLng;
      return (Math.atan2(dy, dx) * 180) / Math.PI;
    }
    if (bookingStatus === 'trip_active' && pickup && dropoff) {
      const dy = dropoff.lat - pickup.lat;
      const dx = dropoff.lng - pickup.lng;
      return (Math.atan2(dy, dx) * 180) / Math.PI;
    }
    return 0;
  };

  const driverAngle = getDriverAngle();

  return (
    <div className="relative w-full h-[320px] sm:h-[420px] rounded-2xl overflow-hidden border border-zinc-800/80 shadow-2xl flex flex-col shadow-black/80 bg-[#121214]" id="map-section">
      {/* Map Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-10 flex justify-between items-center pointer-events-none">
        <div className="flex gap-1.5 pointer-events-auto bg-[#121214]/95 backdrop-blur-md border border-zinc-800 rounded-lg p-1 shadow-xl">
          <button 
            id="theme-midnight"
            onClick={() => setMapTheme('midnight')}
            className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-all duration-300 cursor-pointer ${mapTheme === 'midnight' ? 'bg-yellow-400 text-zinc-950 shadow-md' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            Obsidian
          </button>
          <button 
            id="theme-light"
            onClick={() => setMapTheme('light')}
            className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-all duration-300 cursor-pointer ${mapTheme === 'light' ? 'bg-yellow-400 text-zinc-950 shadow-md' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            Light Gold
          </button>
          <button 
            id="theme-emerald"
            onClick={() => setMapTheme('emerald')}
            className={`px-3 py-1 text-[11px] font-semibold rounded-md transition-all duration-300 cursor-pointer ${mapTheme === 'emerald' ? 'bg-yellow-400 text-zinc-950 shadow-md' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            City Slate
          </button>
        </div>

        <button 
          id="toggle-suppliers-view"
          onClick={() => setShowSuppliers(!showSuppliers)}
          className="pointer-events-auto flex items-center gap-1.5 bg-[#121214]/95 backdrop-blur-md border border-zinc-800/80 text-zinc-300 hover:text-yellow-400 text-[11px] px-3 py-1.5 rounded-lg shadow-xl font-medium transition-all duration-300 cursor-pointer"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{showSuppliers ? 'Hide Fleet' : 'Show Fleet'}</span>
        </button>
      </div>

      {/* Map Content */}
      <div ref={containerRef} className={`w-full flex-grow relative ${themeClasses.bg} transition-colors duration-500`}>
        {/* Stylized Map Grid and Geometries */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Water/River System */}
          <path 
            d="M -5 45 C 30 50, 40 40, 60 65 C 75 80, 85 75, 105 85 L 105 105 L -5 105 Z" 
            className={`${themeClasses.river} transition-all duration-500`}
            strokeWidth="1.5"
          />

          {/* Parks & Green zones */}
          <rect x="5" y="5" width="22" height="15" rx="2" className={`${themeClasses.parks} transition-all duration-500`} />
          <circle cx="85" cy="18" r="10" className={`${themeClasses.parks} transition-all duration-500`} />
          <polygon points="50,45 65,30 55,20 40,30" className={`${themeClasses.parks} transition-all duration-500`} />

          {/* Grid lines (Secondary Streets) */}
          <g className={`${themeClasses.grid} transition-all duration-500`} strokeWidth="0.08">
            {/* Horizontal streets */}
            {Array.from({ length: 10 }).map((_, i) => (
              <line key={`h-${i}`} x1="0" y1={i * 10} x2="100" y2={i * 10} />
            ))}
            {/* Vertical streets */}
            {Array.from({ length: 10 }).map((_, i) => (
              <line key={`v-${i}`} x1={i * 10} y1="0" x2={i * 10} y2="100" />
            ))}
          </g>

          {/* Primary Arterial Roads */}
          <g stroke={mapTheme === 'light' ? '#E7E5E4' : '#1E293B'} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" className="opacity-90">
            <line x1="10" y1="0" x2="10" y2="100" />
            <line x1="50" y1="0" x2="50" y2="100" />
            <line x1="90" y1="0" x2="90" y2="100" />
            <line x1="0" y1="30" x2="100" y2="30" />
            <line x1="0" y1="70" x2="100" y2="70" />
            {/* Diagonal bypass */}
            <line x1="0" y1="90" x2="90" y2="0" />
          </g>

          {/* Active Booking Route Lines */}
          <AnimatePresence>
            {pickup && dropoff && (
              <>
                {/* Full Route Path */}
                <motion.line
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  x1={pickup.lng}
                  y1={pickup.lat}
                  x2={dropoff.lng}
                  y2={dropoff.lat}
                  stroke={activeSupplier?.color || '#3B82F6'}
                  strokeWidth="0.8"
                  strokeLinecap="round"
                  className="opacity-40"
                  strokeDasharray="1.5 1"
                />

                {/* Completed Part of Active Route */}
                {bookingStatus === 'trip_active' && (
                  <line
                    x1={pickup.lng}
                    y1={pickup.lat}
                    x2={pickup.lng + (dropoff.lng - pickup.lng) * (progress / 100)}
                    y2={pickup.lat + (dropoff.lat - pickup.lat) * (progress / 100)}
                    stroke={activeSupplier?.color || '#3B82F6'}
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    className="shadow-glow"
                  />
                )}

                {/* Dispatch Connection to Pickup */}
                {(bookingStatus === 'driver_assigned' || bookingStatus === 'driver_en_route') && driverPos && (
                  <motion.line
                    x1={driverPos.lng}
                    y1={driverPos.lat}
                    x2={pickup.lng}
                    y2={pickup.lat}
                    stroke="#F59E0B"
                    strokeWidth="0.8"
                    strokeLinecap="round"
                    strokeDasharray="1 1"
                    animate={{ strokeDashoffset: [0, -10] }}
                    transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                  />
                )}
              </>
            )}
          </AnimatePresence>
        </svg>

        {/* Ambient Roaming Drivers (connected suppliers) */}
        {showSuppliers && ambientCabs.map((cab) => (
          <div
            key={cab.id}
            className="absolute transition-all duration-300 pointer-events-auto"
            style={{
              top: `${cab.lat}%`,
              left: `${cab.lng}%`,
              transform: `translate(-50%, -50%) rotate(${cab.angle}deg)`
            }}
            title={`${cab.name} unit`}
          >
            <div 
              className="p-1 rounded-full border border-slate-900/60 shadow-md backdrop-blur-xs flex items-center justify-center cursor-help"
              style={{ backgroundColor: cab.color }}
            >
              <Car className="w-2.5 h-2.5 text-slate-950 font-bold" />
            </div>
          </div>
        ))}

        {/* Pickup and Dropoff Pins on Map */}
        <AnimatePresence>
          {pickup && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center z-20"
              style={{ top: `${pickup.lat}%`, left: `${pickup.lng}%` }}
            >
              <div className="bg-emerald-600 text-white rounded-lg px-2 py-0.5 text-[10px] font-bold shadow-lg border border-emerald-500 whitespace-nowrap mb-1 flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                PICKUP
              </div>
              <div className="p-1.5 bg-emerald-950/90 border border-emerald-500 rounded-full shadow-lg text-emerald-400">
                <MapPin className="w-4.5 h-4.5" />
              </div>
            </motion.div>
          )}

          {dropoff && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center z-20"
              style={{ top: `${dropoff.lat}%`, left: `${dropoff.lng}%` }}
            >
              <div className="bg-rose-600 text-white rounded-lg px-2 py-0.5 text-[10px] font-bold shadow-lg border border-rose-500 whitespace-nowrap mb-1">
                DESTINATION
              </div>
              <div className="p-1.5 bg-rose-950/90 border border-rose-500 rounded-full shadow-lg text-rose-400">
                <Navigation className="w-4.5 h-4.5 rotate-45" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Searching dispatch radar scan */}
        <AnimatePresence>
          {bookingStatus === 'searching' && pickup && (
            <div 
              className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none"
              style={{ top: `${pickup.lat}%`, left: `${pickup.lng}%` }}
            >
              <div className="absolute w-28 h-28 border border-cyan-500/30 rounded-full animate-ping opacity-60" />
              <div className="absolute w-48 h-48 border border-cyan-500/20 rounded-full animate-pulse opacity-40" />
              <div className="absolute w-12 h-12 bg-cyan-500/10 rounded-full flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />
              </div>
            </div>
          )}
        </AnimatePresence>

        {/* Active Dispatched Driver on Map */}
        <AnimatePresence>
          {driverPos && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center"
              style={{ top: `${driverPos.lat}%`, left: `${driverPos.lng}%` }}
            >
              {/* Tooltip info */}
              <div className="bg-[#121214] border border-zinc-800/80 text-zinc-100 px-2.5 py-1.5 rounded-md text-[10px] font-medium shadow-2xl whitespace-nowrap mb-6 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                <span>
                  {bookingStatus === 'driver_assigned' || bookingStatus === 'driver_en_route' 
                    ? `Driver incoming` 
                    : `Active trip en-route`}
                </span>
              </div>
              {/* Physical Car Icon */}
              <div 
                className="p-2 rounded-full border border-slate-900 shadow-2xl flex items-center justify-center animate-bounce duration-700"
                style={{ 
                  backgroundColor: activeSupplier?.color || '#F59E0B',
                  transform: `rotate(${driverAngle}deg)`
                }}
              >
                <Car className="w-4 h-4 text-slate-950 font-bold" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Location Label Markers (Static Geographics) */}
        {LOCATIONS.map((loc) => {
          // Hide marker if it overlaps with active pickup/dropoff to keep clean
          const isPickup = pickup?.id === loc.id;
          const isDropoff = dropoff?.id === loc.id;
          if (isPickup || isDropoff) return null;

          return (
            <div
              key={loc.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
              style={{ top: `${loc.lat}%`, left: `${loc.lng}%` }}
            >
              <div className={`px-2 py-1 rounded-md text-[9px] font-semibold border shadow-xs tracking-tight select-none transition-colors duration-500 ${themeClasses.labelBg}`}>
                {loc.name.split(' ')[0]} {loc.name.split(' ')[1] || ''}
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Map Telemetry Footer */}
      <div className="bg-[#121214]/95 border-t border-zinc-800/80 p-3.5 flex justify-between items-center text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-yellow-400 animate-pulse" />
          <span className="font-mono text-[10px] tracking-wider text-zinc-400">COORDINATE HUB ACTIVE: 5 SUPPLIERS DISPATCHED</span>
        </div>
        <div className="flex items-center gap-3 font-semibold">
          {bookingStatus === 'searching' && (
            <span className="text-yellow-400 animate-pulse flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin text-yellow-400" /> Scanning local fleets...
            </span>
          )}
          {bookingStatus === 'driver_en_route' && (
            <span className="text-yellow-400 flex items-center gap-1">
              <Zap className="w-3 h-3 fill-yellow-400" /> Driver pickup progress: {Math.round(progress)}%
            </span>
          )}
          {bookingStatus === 'trip_active' && (
            <span className="text-emerald-400 flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin" /> In transit progress: {Math.round(progress)}%
            </span>
          )}
          {bookingStatus === 'completed' && (
            <span className="text-emerald-500 font-bold">✓ Ride Completed</span>
          )}
          {bookingStatus === 'idle' && (
            <span className="text-zinc-500 font-medium">System Ready • Select Routes</span>
          )}
        </div>
      </div>
    </div>
  );
}
