import React, { useState } from 'react';
import { Location, Supplier, VehicleTier, FareEstimate } from '../types';
import { LOCATIONS, SUPPLIERS, calculateDistance, calculateDuration, getTierMultiplier } from '../constants';
import { MapPin, Navigation, ArrowRight, Star, Award, Clock, IndianRupee, Sparkles, Compass } from 'lucide-react';

interface BookingFormProps {
  selectedPickup: Location | null;
  selectedDropoff: Location | null;
  selectedTier: VehicleTier;
  selectedSupplier: Supplier | null;
  onSelectPickup: (loc: Location | null) => void;
  onSelectDropoff: (loc: Location | null) => void;
  onSelectTier: (tier: VehicleTier) => void;
  onSelectSupplier: (supplier: Supplier | null) => void;
  onBookRide: () => void;
  isSearching: boolean;
}

export default function BookingForm({
  selectedPickup,
  selectedDropoff,
  selectedTier,
  selectedSupplier,
  onSelectPickup,
  onSelectDropoff,
  onSelectTier,
  onSelectSupplier,
  onBookRide,
  isSearching
}: BookingFormProps) {
  const [customTip, setCustomTip] = useState<string>('');
  const [selectedTipPercent, setSelectedTipPercent] = useState<number>(15);

  // Calculate distance & duration if both selected
  const distance = selectedPickup && selectedDropoff ? calculateDistance(selectedPickup, selectedDropoff) : 0;
  const duration = calculateDuration(distance);

  // Generate estimates for each supplier supporting the tier
  const estimates: FareEstimate[] = SUPPLIERS.filter(supplier => 
    supplier.supportedTiers.includes(selectedTier)
  ).map(supplier => {
    const multiplier = getTierMultiplier(selectedTier);
    const rawFare = supplier.baseFare + (supplier.perMileRate * distance);
    const finalFare = parseFloat((rawFare * multiplier).toFixed(2));
    
    // Custom ETA calculation: Base ETA + a bit of random offset based on distance/location
    const baseEta = supplier.id === 'metro_cabs' ? 2 : supplier.id === 'quick_coop' ? 3 : 5;
    const etaMins = Math.max(1, baseEta + Math.floor(distance % 3));

    return {
      supplierId: supplier.id,
      supplierName: supplier.name,
      color: supplier.color,
      tier: selectedTier,
      fare: finalFare,
      durationMins: duration,
      distanceMiles: distance,
      etaMins
    };
  });

  // Find Best Value (lowest price) and Fastest (lowest ETA) among estimates
  let bestValueId = '';
  let fastestId = '';
  if (estimates.length > 0) {
    bestValueId = estimates.reduce((min, est) => est.fare < min.fare ? est : min, estimates[0]).supplierId;
    fastestId = estimates.reduce((min, est) => est.etaMins < min.etaMins ? est : min, estimates[0]).supplierId;
  }

  const handleBooking = () => {
    if (!selectedPickup || !selectedDropoff || !selectedSupplier) return;
    onBookRide();
  };

  const vehicleTiers: { id: VehicleTier; label: string; desc: string; icon: string }[] = [
    { id: 'economy', label: 'Economy', desc: 'Budget-friendly sedans & hybrids', icon: '🍃' },
    { id: 'comfort', label: 'Comfort', desc: 'Spacious high-rating local sedans', icon: '🚗' },
    { id: 'premium', label: 'Executive Luxury', desc: 'Premium black car chauffeur units', icon: '🎩' },
    { id: 'xl', label: 'Vans & SUVs (XL)', desc: 'Large minivans & SUVs for groups', icon: '🚐' }
  ];

  return (
    <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-5 shadow-xl flex flex-col gap-6 shadow-black/60" id="booking-container">
      <div>
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          <span>Central Dispatch & Booking</span>
        </h2>
        <p className="text-xs text-zinc-400 mt-1">Select pickup, dropoff, and choose from local suppliers.</p>
      </div>

      {/* 1. Pick Locations */}
      <div className="space-y-4">
        {/* Pickup Selector */}
        <div className="relative">
          <label className="text-[11px] uppercase tracking-wider font-bold text-zinc-400 block mb-1.5 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-yellow-400" /> Pickup Location
          </label>
          <select
            id="pickup-select"
            className="w-full bg-[#0B0B0C] border border-zinc-800/80 rounded-xl px-3.5 py-3 text-sm text-zinc-200 focus:outline-none focus:border-yellow-400/80 transition-colors cursor-pointer"
            value={selectedPickup?.id || ''}
            onChange={(e) => {
              const loc = LOCATIONS.find(l => l.id === e.target.value) || null;
              onSelectPickup(loc);
              // Clear supplier selection on change to force refreshing choice
              onSelectSupplier(null);
            }}
          >
            <option value="" disabled>-- Select Local Pickup Landmark --</option>
            {LOCATIONS.map((loc) => (
              <option 
                key={`pickup-${loc.id}`} 
                value={loc.id}
                disabled={selectedDropoff?.id === loc.id}
                className="bg-[#121214] text-zinc-200"
              >
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Dropoff Selector */}
        <div className="relative">
          <label className="text-[11px] uppercase tracking-wider font-bold text-zinc-400 block mb-1.5 flex items-center gap-1">
            <Navigation className="w-3.5 h-3.5 text-yellow-400 rotate-45" /> Destination
          </label>
          <select
            id="dropoff-select"
            className="w-full bg-[#0B0B0C] border border-zinc-800/80 rounded-xl px-3.5 py-3 text-sm text-zinc-200 focus:outline-none focus:border-yellow-400/80 transition-colors cursor-pointer"
            value={selectedDropoff?.id || ''}
            onChange={(e) => {
              const loc = LOCATIONS.find(l => l.id === e.target.value) || null;
              onSelectDropoff(loc);
              onSelectSupplier(null);
            }}
          >
            <option value="" disabled>-- Where are we heading? --</option>
            {LOCATIONS.map((loc) => (
              <option 
                key={`dropoff-${loc.id}`} 
                value={loc.id}
                disabled={selectedPickup?.id === loc.id}
                className="bg-[#121214] text-zinc-200"
              >
                {loc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedPickup && selectedDropoff && (
        <div className="bg-[#0B0B0C] rounded-xl p-3.5 border border-zinc-800/80 flex justify-between items-center text-xs font-mono">
          <div className="text-zinc-400">
            Route Distance: <span className="text-yellow-400 font-bold">{distance} km</span>
          </div>
          <div className="text-zinc-400">
            Est. Trip Time: <span className="text-yellow-400 font-bold">{duration} mins</span>
          </div>
        </div>
      )}

      {/* 2. Vehicle Class Selector */}
      <div>
        <label className="text-[11px] uppercase tracking-wider font-bold text-zinc-400 block mb-2.5">
          Choose Fleet Vehicle Category
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          {vehicleTiers.map((tier) => (
            <button
              key={tier.id}
              id={`tier-${tier.id}`}
              onClick={() => {
                onSelectTier(tier.id);
                onSelectSupplier(null); // Reset selected supplier to refresh options
              }}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                selectedTier === tier.id
                  ? 'bg-yellow-400/5 border-yellow-400 shadow-md shadow-yellow-400/5'
                  : 'bg-[#0B0B0C] border-zinc-800/80 hover:bg-zinc-900/40 hover:border-zinc-700'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-white">{tier.label}</span>
                <span className="text-base">{tier.icon}</span>
              </div>
              <p className="text-[10px] text-zinc-400 leading-snug mt-1">{tier.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Centralized Local Supplier Rates (Compare) */}
      {selectedPickup && selectedDropoff ? (
        <div className="space-y-3" id="supplier-comparison">
          <div className="flex justify-between items-center">
            <label className="text-[11px] uppercase tracking-wider font-bold text-zinc-400">
              Supplier Marketplace Comparison
            </label>
            <span className="text-[10px] text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2.5 py-0.5 rounded-full font-semibold">
              Live Rates
            </span>
          </div>

          {estimates.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-zinc-800 text-center text-xs text-slate-500">
              No local suppliers operate {selectedTier} vehicles for this specific route. Try selecting another category.
            </div>
          ) : (
            <div className="space-y-2.5">
              {estimates.map((est) => {
                const supplierInfo = SUPPLIERS.find(s => s.id === est.supplierId)!;
                const isSelected = selectedSupplier?.id === est.supplierId;

                return (
                  <button
                    key={est.supplierId}
                    id={`supplier-item-${est.supplierId}`}
                    onClick={() => onSelectSupplier(supplierInfo)}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all flex justify-between items-center cursor-pointer ${
                      isSelected
                        ? 'bg-[#18181B] border-yellow-400 shadow-xl shadow-yellow-400/5'
                        : 'bg-[#0B0B0C] border-zinc-800/80 hover:bg-[#121214]'
                    }`}
                  >
                    <div className="flex gap-3 items-center">
                      {/* Supplier brand accent circle */}
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg relative"
                        style={{ backgroundColor: `${supplierInfo.color}15`, border: `1px solid ${supplierInfo.color}40` }}
                      >
                        <span>{supplierInfo.logo}</span>
                        {/* Status online light */}
                        <div className="absolute right-0 bottom-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-950 animate-pulse" />
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-white">{supplierInfo.name}</span>
                          <div className="flex items-center text-[10px] text-yellow-400 font-bold">
                            <Star className="w-2.5 h-2.5 fill-yellow-400 mr-0.5" />
                            {supplierInfo.rating}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-400 font-medium">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-zinc-500" /> {est.etaMins}m ETA
                          </span>
                          <span>•</span>
                          <span>{supplierInfo.activeDrivers} active units</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 font-medium">Quote </span>
                        <span className="text-base font-black text-white">₹{est.fare.toFixed(2)}</span>
                      </div>

                      {/* Best Value / Fastest Tag indicators */}
                      <div className="flex gap-1">
                        {est.supplierId === bestValueId && (
                          <span className="text-[9px] bg-emerald-950/70 text-emerald-400 border border-emerald-900 rounded-md px-1.5 py-0.5 font-bold flex items-center gap-0.5">
                            <IndianRupee className="w-2.5 h-2.5" /> Value
                          </span>
                        )}
                        {est.supplierId === fastestId && (
                          <span className="text-[9px] bg-yellow-950/70 text-yellow-400 border border-yellow-900/60 rounded-md px-1.5 py-0.5 font-bold flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" /> Fast
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#0B0B0C] rounded-xl p-6 border border-zinc-800/80 text-center flex flex-col items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800/80 flex items-center justify-center text-zinc-500">
            <Compass className="w-5 h-5" />
          </div>
          <div className="text-xs font-semibold text-zinc-300">Awaiting Dispatch Selections</div>
          <p className="text-[11px] text-zinc-500 max-w-[240px] leading-relaxed">
            Specify pickup point and target destination to compare local supplier rates and dispatches.
          </p>
        </div>
      )}

      {/* 4. Book dispatch button */}
      <button
        id="book-ride-button"
        disabled={!selectedPickup || !selectedDropoff || !selectedSupplier || isSearching}
        onClick={handleBooking}
        className={`w-full py-3.5 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg transition-all ${
          !selectedPickup || !selectedDropoff || !selectedSupplier || isSearching
            ? 'bg-zinc-900 border border-zinc-800/80 text-zinc-600 cursor-not-allowed'
            : 'bg-yellow-400 text-zinc-950 hover:bg-yellow-300 cursor-pointer shadow-2xl active:scale-[0.99] shadow-yellow-400/10'
        }`}
      >
        <span>
          {isSearching 
            ? 'Initiating Supplier Dispatch...' 
            : selectedSupplier 
              ? `Confirm & Pay with ${selectedSupplier.name}` 
              : 'Select Route & Supplier'}
        </span>
        {!isSearching && <ArrowRight className="w-4.5 h-4.5" />}
      </button>
    </div>
  );
}
