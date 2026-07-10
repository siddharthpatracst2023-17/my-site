import React, { useState } from 'react';
import { Booking } from '../types';
import { Star, Shield, Clipboard, ExternalLink, MapPin, Navigation, UserCheck, Calendar, IndianRupee } from 'lucide-react';

interface BookingHistoryProps {
  bookings: Booking[];
  onRateRide: (bookingId: string, rating: number) => void;
}

export default function BookingHistory({
  bookings,
  onRateRide
}: BookingHistoryProps) {
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  return (
    <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-5 shadow-xl flex flex-col gap-5 shadow-black/60" id="history-container">
      <div>
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-yellow-400" />
          <span>My Centralized Bookings & Receipts</span>
        </h2>
        <p className="text-[11px] text-zinc-400 mt-1">
          Review past dispatches, analyze verified secure transactions, and rate suppliers.
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="bg-[#0B0B0C] border border-zinc-800/80 rounded-xl p-8 text-center text-zinc-500">
          <Calendar className="w-10 h-10 text-zinc-700 mx-auto mb-2.5" />
          <p className="text-xs font-semibold">No booking history detected yet.</p>
          <p className="text-[10px] text-zinc-600 mt-1">Book your first centralized local ride to populate registries.</p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {bookings.map((booking) => {
            const isSelectedReceipt = selectedReceiptId === booking.id;
            const finalTotal = parseFloat((booking.fare + (booking.tip || 0) + 50.00 + (booking.fare * 0.08)).toFixed(2));

            return (
              <div 
                key={booking.id} 
                id={`history-item-${booking.id}`}
                className="bg-[#0B0B0C] border border-zinc-800/80 rounded-xl overflow-hidden transition-all hover:border-zinc-700/80"
              >
                {/* Header Summary */}
                <div className="p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div className="flex gap-3 items-center">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                      style={{ backgroundColor: `${booking.supplier.color}15`, border: `1px solid ${booking.supplier.color}30` }}
                    >
                      {booking.supplier.logo}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-white">{booking.supplier.name}</span>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-[#121214] border border-zinc-800/80 text-zinc-400 uppercase font-mono">
                          {booking.tier}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold font-mono ${
                          booking.status === 'completed' 
                            ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40' 
                            : 'bg-yellow-950/40 text-yellow-400 border border-yellow-900/40'
                        }`}>
                          {booking.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="text-[10px] text-zinc-400 mt-1.5 flex items-center gap-1.5">
                        <span>{booking.timestamp}</span>
                        <span>•</span>
                        <span className="font-mono text-zinc-500">{booking.distance} km</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Receipt toggle */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-0 border-slate-900 pt-2.5 sm:pt-0">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-zinc-500 font-medium">Charged </span>
                      <span className="text-sm font-black text-white">₹{finalTotal.toFixed(2)}</span>
                    </div>

                    <button
                      id={`toggle-receipt-${booking.id}`}
                      onClick={() => setSelectedReceiptId(isSelectedReceipt ? null : booking.id)}
                      className="px-3 py-1.5 bg-[#121214] hover:bg-[#18181B] border border-zinc-800 text-[10px] font-bold text-zinc-300 rounded-lg transition-all cursor-pointer"
                    >
                      {isSelectedReceipt ? 'Hide Receipt' : 'View Receipt'}
                    </button>
                  </div>
                </div>

                {/* Expanded Receipt Breakdown */}
                {isSelectedReceipt && (
                  <div className="border-t border-zinc-900 bg-[#0B0B0C]/80 p-4 space-y-4" id={`receipt-pane-${booking.id}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Driver and Route */}
                      <div className="space-y-3">
                        {booking.driver && (
                          <div className="bg-[#121214]/60 p-3 rounded-lg border border-zinc-800/80 flex items-center gap-3">
                            <img 
                              src={booking.driver.avatar} 
                              alt={booking.driver.name} 
                              className="w-10 h-10 rounded-full object-cover border border-zinc-800/80"
                            />
                            <div>
                              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                                <span>{booking.driver.name}</span>
                                <span className="flex items-center text-[10px] text-yellow-400 font-bold">
                                  <Star className="w-2.5 h-2.5 fill-yellow-400 mr-0.5" />
                                  {booking.driver.rating}
                                </span>
                              </div>
                              <p className="text-[10px] text-zinc-400 mt-0.5">{booking.driver.carModel} • {booking.driver.carPlate}</p>
                            </div>
                          </div>
                        )}

                        <div className="space-y-2 text-[11px]">
                          <div className="flex gap-2 items-start">
                            <MapPin className="w-3.5 h-3.5 text-yellow-400 mt-0.5 shrink-0" />
                            <div>
                              <span className="text-zinc-500 font-semibold block uppercase text-[9px] tracking-wider">Pickup</span>
                              <span className="text-zinc-200">{booking.pickup.name}</span>
                            </div>
                          </div>
                          <div className="flex gap-2 items-start">
                            <Navigation className="w-3.5 h-3.5 text-rose-400 mt-0.5 rotate-45 shrink-0" />
                            <div>
                              <span className="text-zinc-500 font-semibold block uppercase text-[9px] tracking-wider">Destination</span>
                              <span className="text-zinc-200">{booking.dropoff.name}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Payment Tokenization Receipts */}
                      <div className="bg-[#121214] border border-zinc-800/80 rounded-xl p-3.5 space-y-3">
                        <div className="flex justify-between items-center text-xs font-bold text-white">
                          <span>Secure Payment Audit</span>
                          <span className="text-[10px] font-semibold text-yellow-400 flex items-center gap-1">
                            <Shield className="w-3 h-3" /> VERIFIED HOLD
                          </span>
                        </div>

                        <div className="space-y-1.5 text-[10px] font-mono text-zinc-400 border-b border-zinc-850 pb-2.5">
                          <div className="flex justify-between">
                            <span>Base Fare Quote</span>
                            <span className="text-zinc-200">₹{booking.fare.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Central Dispatch Fee</span>
                            <span className="text-zinc-200">₹50.00</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Local Service Taxes</span>
                            <span className="text-zinc-200">₹{(booking.fare * 0.08).toFixed(2)}</span>
                          </div>
                          {booking.tip && (
                            <div className="flex justify-between text-yellow-400">
                              <span>Driver Contribution Tip</span>
                              <span>₹{booking.tip.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-bold text-white text-xs pt-1 border-t border-zinc-800/50 mt-1">
                            <span>Total Settlement</span>
                            <span className="text-yellow-400">₹{finalTotal.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Cryptographic Ledger Info */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-[9px] font-mono text-zinc-500">
                            <span>TOKEN: SHA-256 SECURED</span>
                            <span>METHOD: {booking.paymentMethod}</span>
                          </div>
                          <div className="bg-[#0B0B0C] p-2 rounded border border-zinc-800/80 flex items-center justify-between text-[9px] font-mono text-zinc-400">
                            <span className="truncate max-w-[180px]">tx_hash_0x{booking.id.toUpperCase()}cb6f3328e</span>
                            <button
                              id={`copy-token-${booking.id}`}
                              onClick={() => copyToClipboard(booking.id, `tx_hash_0x${booking.id.toUpperCase()}cb6f3328e`)}
                              className="text-yellow-400 hover:text-yellow-300 font-bold ml-2 shrink-0 flex items-center gap-1 cursor-pointer"
                            >
                              {copiedId === booking.id ? (
                                <span className="text-emerald-400">Copied!</span>
                              ) : (
                                <>
                                  <Clipboard className="w-3 h-3" /> Copy
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Star Rating Section */}
                    {booking.status === 'completed' && (
                      <div className="flex items-center justify-between border-t border-slate-900 pt-3 flex-wrap gap-2">
                        <span className="text-[11px] text-slate-400 font-medium">Rate driver performance:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={`star-${star}`}
                              id={`rate-star-${booking.id}-${star}`}
                              onClick={() => onRateRide(booking.id, star)}
                              className="p-1 hover:scale-115 transition-transform cursor-pointer"
                            >
                              <Star 
                                className={`w-4 h-4 ${
                                  star <= (booking.rating || 0) 
                                    ? 'fill-amber-400 text-amber-400' 
                                    : 'text-slate-600 hover:text-amber-400'
                                }`} 
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
