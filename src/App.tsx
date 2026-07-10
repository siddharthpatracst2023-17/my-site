import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Car, Compass, Network, History, MapPin, 
  ChevronRight, Calendar, Users, AlertTriangle, 
  HelpCircle, ShieldCheck, Heart, User, CheckCircle2, 
  Phone, MessageSquare, Landmark, Info
} from 'lucide-react';

import { Location, Supplier, VehicleTier, BookingStatus, Booking, Driver } from './types';
import { LOCATIONS, SUPPLIERS, DRIVERS, calculateDistance, getTierMultiplier, calculateDuration } from './constants';
import MapTracker from './components/MapTracker';
import BookingForm from './components/BookingForm';
import PaymentFlow from './components/PaymentFlow';
import SupplierNetwork from './components/SupplierNetwork';
import BookingHistory from './components/BookingHistory';

export default function App() {
  // Navigation Tabs: 'book' | 'suppliers' | 'history'
  const [activeTab, setActiveTab] = useState<'book' | 'suppliers' | 'history'>('book');

  // Registry state (allows live registration of suppliers/drivers)
  const [suppliersList, setSuppliersList] = useState<Supplier[]>(SUPPLIERS);
  const [driversList, setDriversList] = useState<Driver[]>(DRIVERS);

  // Form selection states
  const [pickup, setPickup] = useState<Location | null>(null);
  const [dropoff, setDropoff] = useState<Location | null>(null);
  const [selectedTier, setSelectedTier] = useState<VehicleTier>('economy');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Active Dispatch states
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>('idle');
  const [activeDriver, setActiveDriver] = useState<Driver | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null);
  const [activeToast, setActiveToast] = useState<string | null>(null);

  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => setActiveToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  // Saved bookings state (logs)
  const [bookingsHistory, setBookingsHistory] = useState<Booking[]>(() => {
    try {
      const saved = localStorage.getItem('cabpath_bookings');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Simulation Interval Ref
  const simInterval = useRef<NodeJS.Timeout | null>(null);

  // Save bookings to localStorage
  useEffect(() => {
    localStorage.setItem('cabpath_bookings', JSON.stringify(bookingsHistory));
  }, [bookingsHistory]);

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      if (simInterval.current) clearInterval(simInterval.current);
    };
  }, []);

  // Handle Supplier registration
  const handleAddSupplier = (newSup: Supplier) => {
    setSuppliersList(prev => [...prev, newSup]);
  };

  // Handle Driver registration
  const handleAddDriver = (newDrv: Driver) => {
    setDriversList(prev => [...prev, newDrv]);
  };

  // Start Search/Dispatch phase
  const handleBookRide = () => {
    if (!pickup || !dropoff || !selectedSupplier) return;
    setBookingStatus('payment_pending');
  };

  // Execute payment success - starts dispatch scanning
  const handlePaymentSuccess = (cardLast4: string, method: string) => {
    setBookingStatus('searching');
    setProgress(0);

    // Simulate central coordination searching for drivers
    setTimeout(() => {
      // Find a driver from the chosen supplier
      const availableDrivers = driversList.filter(d => d.supplierId === selectedSupplier!.id);
      const chosenDriver = availableDrivers[Math.floor(Math.random() * availableDrivers.length)] || driversList[0];

      setActiveDriver(chosenDriver);
      setBookingStatus('driver_assigned');
      
      // Start en-route simulation
      setTimeout(() => {
        setBookingStatus('driver_en_route');
        startEnRouteSimulation(chosenDriver, cardLast4, method);
      }, 1500);

    }, 3000);
  };

  // En Route (Driver coming to pick up) Simulation
  const startEnRouteSimulation = (driver: Driver, cardLast4: string, method: string) => {
    if (simInterval.current) clearInterval(simInterval.current);
    let currentProg = 0;

    simInterval.current = setInterval(() => {
      currentProg += 2;
      setProgress(currentProg);

      if (currentProg >= 100) {
        clearInterval(simInterval.current!);
        setBookingStatus('trip_active');
        setProgress(0);
        
        // Start Trip (driving to destination) Simulation
        startTripSimulation(driver, cardLast4, method);
      }
    }, 15000 / 50); // ~15 seconds total en-route duration
  };

  // Trip Active (In transit to dropoff) Simulation
  const startTripSimulation = (driver: Driver, cardLast4: string, method: string) => {
    if (simInterval.current) clearInterval(simInterval.current);
    let currentProg = 0;

    simInterval.current = setInterval(() => {
      currentProg += 2.5;
      setProgress(currentProg);

      if (currentProg >= 100) {
        clearInterval(simInterval.current!);
        
        // Finalize Booking
        const dist = calculateDistance(pickup!, dropoff!);
        const multiplier = getTierMultiplier(selectedTier);
        const rawFare = selectedSupplier!.baseFare + (selectedSupplier!.perMileRate * dist);
        const finalFare = parseFloat((rawFare * multiplier).toFixed(2));

        const newBooking: Booking = {
          id: `book-${Date.now().toString().slice(-6)}`,
          pickup: pickup!,
          dropoff: dropoff!,
          supplier: selectedSupplier!,
          tier: selectedTier,
          driver: driver,
          fare: finalFare,
          distance: dist,
          duration: calculateDuration(dist),
          status: 'completed',
          paymentMethod: method,
          paymentCardLast4: cardLast4,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + new Date().toLocaleDateString(),
          rating: 5,
          tip: 50
        };

        setBookingsHistory(prev => [newBooking, ...prev]);
        setBookingStatus('completed');
        setCurrentBooking(newBooking);

        // Switch to history tab after 2.5 seconds so user can see their receipt & rate!
        setTimeout(() => {
          setBookingStatus('idle');
          setPickup(null);
          setDropoff(null);
          setSelectedSupplier(null);
          setActiveTab('history');
        }, 3000);
      }
    }, 15000 / 40); // ~15 seconds total trip duration
  };

  // Cancel ride during tracking
  const handleCancelRide = () => {
    if (simInterval.current) clearInterval(simInterval.current);
    setBookingStatus('idle');
    setPickup(null);
    setDropoff(null);
    setSelectedSupplier(null);
    setActiveDriver(null);
    setProgress(0);
  };

  // Rate ride in history
  const handleRateRide = (bookingId: string, rating: number) => {
    setBookingsHistory(prev => 
      prev.map(b => b.id === bookingId ? { ...b, rating } : b)
    );
  };

  const activeSupplierColor = selectedSupplier?.color || '#3B82F6';

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-zinc-100 flex flex-col font-sans selection:bg-yellow-400 selection:text-zinc-950">
      
      {/* 1. Header Banner */}
      <header className="bg-[#0E0E10]/95 backdrop-blur-md border-b border-zinc-800/80 p-4 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-yellow-400 to-amber-600 flex items-center justify-center text-zinc-950 font-black text-xl shadow-lg shadow-yellow-400/10">
              <Car className="w-5.5 h-5.5 text-zinc-950" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                <span>CabPath</span>
                <span className="text-[10px] bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 px-2 py-0.5 rounded-full font-bold">
                  LOCAL DISPATCH HUB
                </span>
              </h1>
              <p className="text-[10px] text-zinc-400 mt-0.5 font-medium">Connecting Local Operators To One Path</p>
            </div>
          </div>

          {/* Quick System Indicators */}
          <div className="flex items-center gap-3.5 flex-wrap justify-center">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 bg-[#0B0B0C] px-2.5 py-1.5 rounded-lg border border-zinc-800/80">
              <Landmark className="w-3.5 h-3.5 text-yellow-400" />
              <span>5 COOPERATIVE NETWORKS ONLINE</span>
            </div>
            
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-yellow-400 bg-yellow-400/5 px-2.5 py-1.5 rounded-lg border border-yellow-400/10">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
              <span>SECURE END-TO-END DISPATCH LOCK</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Main Workspace Layout */}
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (8 grid columns): Dynamic Live Tracking and Maps */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
          
          {/* Map Tracker Display */}
          <MapTracker
            pickup={pickup}
            dropoff={dropoff}
            activeSupplier={selectedSupplier}
            activeDriver={activeDriver}
            bookingStatus={bookingStatus}
            progress={progress}
          />

          {/* Interactive Live Tracking HUD Card (Overlayed when dispatch is active) */}
          <AnimatePresence>
            {(bookingStatus === 'driver_assigned' || bookingStatus === 'driver_en_route' || bookingStatus === 'trip_active') && activeDriver && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-5 shadow-2xl space-y-4 shadow-black/80"
                id="active-tracking-hud"
              >
                <div className="flex justify-between items-start flex-wrap gap-2.5">
                  <div className="flex gap-3.5 items-center">
                    <img 
                      src={activeDriver.avatar} 
                      alt={activeDriver.name} 
                      className="w-12 h-12 rounded-full object-cover border border-zinc-800/80 shadow-inner"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">{activeDriver.name}</h3>
                        <div className="flex items-center text-[10px] text-yellow-400 font-bold bg-yellow-400/10 border border-yellow-400/20 px-1.5 py-0.5 rounded">
                          ★ {activeDriver.rating}
                        </div>
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-1">{activeDriver.carModel} • <span className="font-mono bg-[#0B0B0C] px-1.5 py-0.5 border border-zinc-800 rounded text-zinc-350">{activeDriver.carPlate}</span></p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Co-op Brand</span>
                    <span 
                      className="text-xs font-black uppercase px-2 py-1 rounded mt-1 inline-block"
                      style={{ backgroundColor: `${activeSupplierColor}15`, color: activeSupplierColor, border: `1px solid ${activeSupplierColor}40` }}
                    >
                      {selectedSupplier?.name}
                    </span>
                  </div>
                </div>

                {/* Progress Indicators */}
                <div className="space-y-2 bg-[#0B0B0C] rounded-xl p-4 border border-zinc-850">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-zinc-400 font-bold flex items-center gap-1">
                      {bookingStatus === 'driver_en_route' ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                          <span>EN-ROUTE TO PICKUP LANDMARK</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                          <span>TRIP ACTIVE • IN TRANSIT</span>
                        </>
                      )}
                    </span>
                    <span className="text-zinc-300 font-semibold">{Math.round(progress)}% progress</span>
                  </div>

                  {/* Horizontal gauge bar */}
                  <div className="h-2 bg-[#121214] rounded-full overflow-hidden border border-zinc-800">
                    <motion.div 
                      className="h-full rounded-full bg-gradient-to-r"
                      style={{ 
                        width: `${progress}%`,
                        backgroundImage: `linear-gradient(90deg, ${activeSupplierColor}, #EAB308)` 
                      }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-zinc-500 font-medium">
                    <span>
                      {bookingStatus === 'driver_en_route' ? `Origin Location` : `${pickup?.name}`}
                    </span>
                    <span>
                      {bookingStatus === 'driver_en_route' ? `${pickup?.name}` : `${dropoff?.name}`}
                    </span>
                  </div>
                </div>

                {/* Live micro-dispatch logs */}
                <div className="flex justify-between items-center pt-2 text-xs border-t border-zinc-800/60">
                  <div className="flex gap-2">
                    <button 
                      id="action-driver-call"
                      onClick={() => setActiveToast(`Initiating secure local loop calling to driver: ${activeDriver.phone}`)}
                      className="p-2 bg-[#0B0B0C] border border-zinc-850 rounded-lg hover:text-white hover:bg-[#121214] transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold text-zinc-300"
                    >
                      <Phone className="w-3.5 h-3.5 text-yellow-400" /> Call
                    </button>
                    <button 
                      id="action-driver-message"
                      onClick={() => setActiveToast(`Opening secure message thread to driver at ${activeDriver.phone}`)}
                      className="p-2 bg-[#0B0B0C] border border-zinc-850 rounded-lg hover:text-white hover:bg-[#121214] transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold text-zinc-300"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-yellow-400" /> Chat
                    </button>
                  </div>

                  <button
                    id="cancel-active-ride"
                    onClick={handleCancelRide}
                    className="px-3.5 py-2 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/40 text-rose-400 rounded-lg text-[11px] font-bold transition-all cursor-pointer"
                  >
                    Cancel Ride
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Prompt banner to guide users if they are idle */}
          {bookingStatus === 'idle' && (
            <div className="bg-[#121214]/60 border border-zinc-800/80 rounded-2xl p-4 flex gap-3.5 items-start">
              <div className="w-8 h-8 rounded-full bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 flex items-center justify-center shrink-0">
                <Info className="w-4.5 h-4.5" />
              </div>
              <div className="text-xs">
                <h4 className="font-bold text-white mb-0.5">How To Book a Centralized Ride</h4>
                <p className="text-zinc-400 leading-relaxed">
                  Select your Landmark coordinates in the Booking Desk. Compare live Quotes provided by connected local suppliers. Click "Confirm & Pay" to verify credentials and lock the route escrow. Your driver will begin immediate route tracking.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (4 grid columns): Navigation Desk Tabs and Forms */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
          
          {/* Main Navigation Desk Selector Tab */}
          <div className="flex bg-[#0E0E10] border border-zinc-800/80 p-1 rounded-xl">
            <button
              id="desk-tab-book"
              onClick={() => setActiveTab('book')}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'book'
                  ? 'bg-yellow-400 text-zinc-950 shadow-md shadow-yellow-400/5'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>Booking Desk</span>
            </button>

            <button
              id="desk-tab-suppliers"
              onClick={() => setActiveTab('suppliers')}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'suppliers'
                  ? 'bg-yellow-400 text-zinc-950 shadow-md shadow-yellow-400/5'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Network className="w-4 h-4" />
              <span>Local Suppliers</span>
            </button>

            <button
              id="desk-tab-history"
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 relative cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-yellow-400 text-zinc-950 shadow-md shadow-yellow-400/5'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Ride History</span>
              {bookingsHistory.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-zinc-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-[#0E0E10]">
                  {bookingsHistory.length}
                </span>
              )}
            </button>
          </div>

          {/* Tab Display Area */}
          <div className="transition-all duration-300">
            {activeTab === 'book' && (
              <>
                {bookingStatus === 'idle' || bookingStatus === 'searching' || bookingStatus === 'completed' ? (
                  <BookingForm
                    selectedPickup={pickup}
                    selectedDropoff={dropoff}
                    selectedTier={selectedTier}
                    selectedSupplier={selectedSupplier}
                    onSelectPickup={setPickup}
                    onSelectDropoff={setDropoff}
                    onSelectTier={setSelectedTier}
                    onSelectSupplier={setSelectedSupplier}
                    onBookRide={handleBookRide}
                    isSearching={bookingStatus === 'searching'}
                  />
                ) : bookingStatus === 'payment_pending' && selectedSupplier ? (
                  <PaymentFlow
                    supplier={selectedSupplier}
                    tier={selectedTier}
                    fare={parseFloat((
                      (selectedSupplier.baseFare + 
                      (selectedSupplier.perMileRate * calculateDistance(pickup!, dropoff!))) * getTierMultiplier(selectedTier)
                    ).toFixed(2))}
                    onPaymentSuccess={handlePaymentSuccess}
                    onCancel={() => setBookingStatus('idle')}
                  />
                ) : (
                  /* Active Tracking Waiting Slate */
                  <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-6 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-yellow-400/10 border border-yellow-400/20 flex items-center justify-center mx-auto animate-pulse text-yellow-400">
                      <Compass className="w-6 h-6 animate-spin" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Live Route Progress Active</h3>
                      <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed">
                        Your booking is currently connected to the dispatcher. Live coordinate maps are rendering on your left.
                      </p>
                    </div>
                    <div className="bg-[#0B0B0C] p-3 rounded-xl border border-zinc-850 text-left text-[11px] font-mono text-zinc-400 space-y-1">
                      <div>• Destination: {dropoff?.name}</div>
                      <div>• Operator: {selectedSupplier?.name}</div>
                      <div>• Vehicle: {selectedTier.toUpperCase()} class</div>
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'suppliers' && (
              <SupplierNetwork
                suppliers={suppliersList}
                drivers={driversList}
                onAddSupplier={handleAddSupplier}
                onAddDriver={handleAddDriver}
                bookingHistoryCount={bookingsHistory.length}
              />
            )}

            {activeTab === 'history' && (
              <BookingHistory
                bookings={bookingsHistory}
                onRateRide={handleRateRide}
              />
            )}
          </div>

        </div>

      </main>

      {/* Elegant HUD Toast Overlay */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 bg-[#121214] border border-yellow-400/30 text-white px-5 py-3.5 rounded-xl shadow-2xl shadow-black/80 flex items-center gap-3"
          >
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-ping shrink-0" />
            <span className="text-xs font-medium font-sans text-zinc-200">{activeToast}</span>
            <button 
              onClick={() => setActiveToast(null)} 
              className="text-[10px] text-zinc-400 hover:text-white ml-2 font-mono cursor-pointer"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Global Footer copyright and status */}
      <footer className="bg-[#0E0E10] border-t border-zinc-800/80 p-4 mt-auto text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© 2026 CabPath Network. All local suppliers coordinated under standard terms.</p>
          <div className="flex gap-4 font-mono text-[10px]">
            <span>SYSTEM STATE: SAFE</span>
            <span>PCI-DSS ENCRYPTION: ACTIVE</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
