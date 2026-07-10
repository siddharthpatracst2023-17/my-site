import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, ShieldCheck, Lock, CheckCircle2, Apple, AlertCircle, RefreshCw, Smartphone, Sparkles, IndianRupee } from 'lucide-react';
import { Supplier, VehicleTier } from '../types';
import { getTierMultiplier } from '../constants';

interface PaymentFlowProps {
  supplier: Supplier;
  tier: VehicleTier;
  fare: number;
  onPaymentSuccess: (cardLast4: string, paymentMethod: string) => void;
  onCancel: () => void;
}

export default function PaymentFlow({
  supplier,
  tier,
  fare,
  onPaymentSuccess,
  onCancel
}: PaymentFlowProps) {
  // Card input states
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [zip, setZip] = useState('');

  // UI state
  const [isFlipped, setIsFlipped] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple_pay'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [driverTip, setDriverTip] = useState<number>(50); // Default ₹50 tip

  // Automatic card type detector
  const getCardType = (num: string) => {
    const cleanNum = num.replace(/\D/g, '');
    if (cleanNum.startsWith('4')) return { name: 'Visa', color: 'from-zinc-900 to-[#121214]', logo: '💳 Visa' };
    if (cleanNum.startsWith('5')) return { name: 'Mastercard', color: 'from-zinc-900 to-[#121214]', logo: '💳 Mastercard' };
    if (cleanNum.startsWith('3')) return { name: 'Amex', color: 'from-zinc-900 to-[#121214]', logo: '💳 Amex' };
    return { name: 'Generic', color: 'from-zinc-900 to-[#121214]', logo: '💳 Secure Card' };
  };

  const cardDetails = getCardType(cardNumber);

  // Formatted Card Inputs
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s?/g, '').replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    
    // Group by 4s
    const formatted = value.match(/.{1,4}/g)?.join(' ') || '';
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    setExpiry(value);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 3) value = value.slice(0, 3);
    setCvv(value);
  };

  // Processing steps simulation
  const processingMessages = [
    'Initializing secure handshakes...',
    'Encrypting card credentials (PCI-DSS Level 1)...',
    'Generating secure single-use payment token...',
    'Authorizing escrow hold with bank gateway...',
    'Dispatch finalized. Relaying ride data...'
  ];

  const handleProcessPayment = () => {
    // Basic verification
    if (paymentMethod === 'card') {
      const cleanNum = cardNumber.replace(/\s/g, '');
      if (cleanNum.length < 15 || expiry.length < 5 || cvv.length < 3 || !cardName) {
        alert('Please fill in complete credit card parameters safely.');
        return;
      }
    }

    setIsProcessing(true);
    setProcessingStep(0);
  };

  useEffect(() => {
    if (!isProcessing) return;

    const interval = setInterval(() => {
      setProcessingStep(prev => {
        if (prev >= processingMessages.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            setIsProcessing(false);
            setIsCompleted(true);
            const last4 = paymentMethod === 'card' 
              ? cardNumber.slice(-4) || '4242' 
              : '8812';
            onPaymentSuccess(last4, paymentMethod === 'card' ? 'Credit Card' : 'Apple Pay');
          }, 800);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isProcessing]);

  // Compute payment breakdown
  const taxRate = 0.08;
  const dispatchSurcharge = 50.00; // Central platform coordination cost
  const baseFareCalculated = fare;
  const taxCalculated = parseFloat((baseFareCalculated * taxRate).toFixed(2));
  const totalDue = parseFloat((baseFareCalculated + taxCalculated + dispatchSurcharge + driverTip).toFixed(2));

  return (
    <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-5 shadow-xl max-w-md w-full mx-auto shadow-black/80" id="payment-container">
      {/* Padlock status */}
      <div className="flex justify-between items-center pb-4 border-b border-zinc-800/80 mb-5">
        <div className="flex items-center gap-2">
          <div className="bg-yellow-400/10 border border-yellow-400/25 p-1.5 rounded-lg text-yellow-400">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Centralized Escrow Checkout</h3>
            <p className="text-[10px] text-zinc-400">Secure dispatch payment pipeline</p>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-[#0B0B0C] border border-zinc-800/80 px-2.5 py-1 rounded-md">
          <ShieldCheck className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-[9px] font-mono font-semibold text-yellow-400">PCI COMPLIANT</span>
        </div>
      </div>

      {!isProcessing && !isCompleted ? (
        <div className="space-y-5">
          {/* Payment Method Selector */}
          <div className="flex gap-2.5">
            <button
              id="payment-method-card"
              onClick={() => setPaymentMethod('card')}
              className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                paymentMethod === 'card'
                  ? 'bg-[#18181B] border-yellow-400 text-yellow-400 shadow-md shadow-yellow-400/5'
                  : 'bg-[#0B0B0C] border-zinc-800/80 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Credit/Debit Card</span>
            </button>
            <button
              id="payment-method-apple"
              onClick={() => setPaymentMethod('apple_pay')}
              className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                paymentMethod === 'apple_pay'
                  ? 'bg-[#18181B] border-yellow-400 text-yellow-400 shadow-md shadow-yellow-400/5'
                  : 'bg-[#0B0B0C] border-zinc-800/80 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Apple className="w-4 h-4" />
              <span>Wallet Pay</span>
            </button>
          </div>

          {/* CARD FORM */}
          {paymentMethod === 'card' ? (
            <div className="space-y-4">
              {/* Animated 3D Flip Credit Card Visualizer */}
              <div className="perspective-1000 w-full h-[160px] sm:h-[180px] relative rounded-xl overflow-hidden shadow-2xl">
                <motion.div
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6, ease: 'easeInOut' }}
                  className="w-full h-full relative preserve-3d"
                >
                  {/* Card Front */}
                  <div className={`absolute inset-0 backface-hidden bg-gradient-to-br ${cardDetails.color} p-4 flex flex-col justify-between border border-white/10 text-white rounded-xl`}>
                    <div className="flex justify-between items-start">
                      <div className="text-[10px] uppercase tracking-widest font-mono font-bold opacity-80">
                        {supplier.name} Dispatch Network
                      </div>
                      <span className="text-xs font-bold bg-white/10 px-2 py-0.5 rounded-md backdrop-blur-xs">
                        {cardDetails.logo}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {/* Chip & Wi-fi */}
                      <div className="flex justify-between items-center">
                        <div className="w-8 h-6 bg-yellow-400/80 rounded-md shadow-inner" />
                        <span className="font-mono text-[9px] opacity-60">SECURE DISPATCH RFID</span>
                      </div>

                      {/* Card Number */}
                      <div className="font-mono text-base tracking-widest text-center py-1">
                        {cardNumber || '•••• •••• •••• ••••'}
                      </div>
                    </div>

                    <div className="flex justify-between items-end">
                      <div className="max-w-[70%]">
                        <span className="text-[8px] uppercase tracking-wider opacity-60 block">CARDHOLDER</span>
                        <span className="font-mono text-xs tracking-wide truncate block">{cardName.toUpperCase() || 'YOUR FULL NAME'}</span>
                      </div>
                      <div>
                        <span className="text-[8px] uppercase tracking-wider opacity-60 block">EXPIRES</span>
                        <span className="font-mono text-xs tracking-wide block">{expiry || 'MM/YY'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Back */}
                  <div className={`absolute inset-0 backface-hidden bg-gradient-to-br ${cardDetails.color} p-4 flex flex-col justify-between border border-white/10 text-white rounded-xl [transform:rotateY(180deg)]`}>
                    <div className="h-8 bg-slate-950 -mx-4 mt-2" />
                    
                    <div className="space-y-4">
                      <div className="flex gap-2.5 items-center bg-slate-100 rounded-md p-1">
                        <div className="h-6 bg-stone-300 w-3/4 stripe-pattern opacity-60" />
                        <div className="bg-amber-100 text-slate-900 font-mono text-xs font-bold px-2 py-0.5 text-center flex-grow rounded">
                          {cvv || 'CVV'}
                        </div>
                      </div>
                      <div className="text-[8px] text-center opacity-70 leading-relaxed font-sans px-2">
                        This tokenized method operates exclusively with secure local supplier coordination networks. Escalated for verification.
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-mono opacity-60 pt-2">
                      <span>SECURE TOKENIZED</span>
                      <span>CVV2 PROTECTED</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Physical Input Fields */}
              <div className="space-y-3">
                <div className="relative">
                  <input
                    id="payment-cardholder-name"
                    type="text"
                    placeholder="Cardholder Full Name"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    onFocus={() => setIsFlipped(false)}
                  />
                </div>

                <div className="relative">
                  <input
                    id="payment-card-number"
                    type="text"
                    placeholder="Card Number"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    onFocus={() => setIsFlipped(false)}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <input
                    id="payment-expiry"
                    type="text"
                    placeholder="MM/YY"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 text-center focus:outline-none focus:border-cyan-500 transition-colors"
                    value={expiry}
                    onChange={handleExpiryChange}
                    onFocus={() => setIsFlipped(false)}
                  />
                  <input
                    id="payment-cvv"
                    type="text"
                    placeholder="CVV"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 text-center focus:outline-none focus:border-cyan-500 transition-colors"
                    value={cvv}
                    onChange={handleCvvChange}
                    onFocus={() => setIsFlipped(true)}
                    onBlur={() => setIsFlipped(false)}
                  />
                  <input
                    id="payment-zip"
                    type="text"
                    placeholder="Zip Code"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 text-center focus:outline-none focus:border-cyan-500 transition-colors"
                    value={zip}
                    onChange={(e) => setZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                    onFocus={() => setIsFlipped(false)}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* APPLE PAY SIMULATOR */
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-950 mx-auto font-black text-xl shadow-lg">
                <Apple className="w-6 h-6 fill-slate-950 text-slate-950" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Apple Pay & Express checkout</h4>
                <p className="text-[11px] text-slate-400 mt-1">Pay with one click from Apple Wallet secure credit cards.</p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-800/60 text-cyan-400 text-[10px] font-bold">
                <Smartphone className="w-3.5 h-3.5" />
                Biometrics authorized on device
              </div>
            </div>
          )}

          {/* DRIVER TIP SELECTOR */}
          <div className="space-y-2">
            <label className="text-[11px] uppercase tracking-wider font-bold text-zinc-400 flex justify-between items-center">
              <span>Support Local Driver (Tip)</span>
              <span className="text-yellow-400 font-bold font-mono">+₹{driverTip.toFixed(2)}</span>
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[20, 50, 100, 200].map((tipValue) => (
                <button
                  key={`tip-${tipValue}`}
                  id={`tip-btn-${tipValue}`}
                  type="button"
                  onClick={() => setDriverTip(tipValue)}
                  className={`py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    driverTip === tipValue
                      ? 'bg-yellow-400/10 border-yellow-400 text-yellow-400 shadow shadow-yellow-400/5'
                      : 'bg-[#0B0B0C] border-zinc-800/80 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  ₹{tipValue}
                </button>
              ))}
            </div>
          </div>

          {/* CHECKOUT SUMMARY BILLING */}
          <div className="bg-[#0B0B0C] rounded-xl p-3.5 border border-zinc-800/80 space-y-2.5">
            <div className="flex justify-between items-center text-xs text-zinc-400">
              <span>Base Ride Fare ({tier.toUpperCase()})</span>
              <span className="font-bold text-zinc-200">₹{baseFareCalculated.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-zinc-400">
              <span>Central Dispatch Coordination Fee</span>
              <span className="font-bold text-zinc-200">₹{dispatchSurcharge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-zinc-400">
              <span>Local Service Taxes (8.0%)</span>
              <span className="font-bold text-zinc-200">₹{taxCalculated.toFixed(2)}</span>
            </div>
            {driverTip > 0 && (
              <div className="flex justify-between items-center text-xs text-yellow-400/80">
                <span>Driver Contribution gratuity</span>
                <span className="font-bold">₹{driverTip.toFixed(2)}</span>
              </div>
            )}
            <div className="h-px bg-zinc-800/80 my-2" />
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-zinc-200 font-sans">Total Escrow Amount</span>
              <div className="flex items-center text-lg font-black text-white">
                <IndianRupee className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400">{totalDue.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* BUTTON ACTIONS */}
          <div className="flex gap-2">
            <button
              id="cancel-payment"
              onClick={onCancel}
              className="px-4 py-3 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-bold transition-all hover:bg-[#0B0B0C] cursor-pointer"
            >
              Back
            </button>
            <button
              id="process-payment-btn"
              onClick={handleProcessPayment}
              className="flex-grow py-3 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
            >
              <ShieldCheck className="w-4.5 h-4.5" />
              <span>Authorize Secure Escrow Hold</span>
            </button>
          </div>
        </div>
      ) : (
        /* LOADING ANIMATING TOKENIZATION */
        <div className="p-8 text-center space-y-6">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-zinc-800 border-t-yellow-400 animate-spin" />
            <div className="absolute inset-2 bg-[#0B0B0C] rounded-full flex items-center justify-center">
              <Lock className="w-5 h-5 text-yellow-400 animate-pulse" />
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white">Security Verification in Progress</h4>
            <div className="min-h-8 flex items-center justify-center">
              <span className="text-xs text-yellow-400 font-mono tracking-wide animate-pulse">
                {processingMessages[processingStep]}
              </span>
            </div>
          </div>

          {/* Progress gauge blocks */}
          <div className="flex justify-center gap-1">
            {processingMessages.map((_, idx) => (
              <div
                key={`p-bar-${idx}`}
                className={`h-1.5 w-6 rounded-full transition-all duration-300 ${
                  idx <= processingStep ? 'bg-yellow-400' : 'bg-zinc-800'
                }`}
              />
            ))}
          </div>

          <p className="text-[10px] text-slate-500 font-sans max-w-[280px] mx-auto leading-relaxed">
            Do not refresh. Handshaking with verified bank accounts is covered by 256-bit AES cryptographic keys.
          </p>
        </div>
      )}
    </div>
  );
}
