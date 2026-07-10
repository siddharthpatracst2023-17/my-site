import React, { useState } from 'react';
import { Supplier, Driver, SupplierStat, VehicleTier } from '../types';
import { SUPPLIERS, DRIVERS, LOCATIONS } from '../constants';
import { Network, Database, Plus, Check, TrendingUp, Users, Info, ShieldAlert, Award } from 'lucide-react';

interface SupplierNetworkProps {
  suppliers: Supplier[];
  drivers: Driver[];
  onAddSupplier: (newSupplier: Supplier) => void;
  onAddDriver: (newDriver: Driver) => void;
  bookingHistoryCount: number;
}

export default function SupplierNetwork({
  suppliers,
  drivers,
  onAddSupplier,
  onAddDriver,
  bookingHistoryCount
}: SupplierNetworkProps) {
  // Tabs: 'stats' | 'register_supplier' | 'register_driver'
  const [activeSubTab, setActiveSubTab] = useState<'stats' | 'registry'>('stats');

  // Supplier Form
  const [supName, setSupName] = useState('');
  const [supColor, setSupColor] = useState('#EC4899'); // Default pink
  const [supLogo, setSupLogo] = useState('🚗');
  const [supBase, setSupBase] = useState('100.00');
  const [supMile, setSupMile] = useState('15.00');
  const [supTiers, setSupTiers] = useState<VehicleTier[]>(['economy']);
  const [supSuccess, setSupSuccess] = useState(false);

  // Driver Form
  const [drvName, setDrvName] = useState('');
  const [drvSupplier, setDrvSupplier] = useState(suppliers[0]?.id || 'metro_cabs');
  const [drvCar, setDrvCar] = useState('');
  const [drvPlate, setDrvPlate] = useState('');
  const [drvSuccess, setDrvSuccess] = useState(false);

  // Handle supplier submit
  const handleSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName || !supBase || !supMile) return;

    const newSup: Supplier = {
      id: supName.toLowerCase().replace(/\s+/g, '_'),
      name: supName,
      logo: supLogo,
      rating: 5.0,
      completedRides: 0,
      baseFare: parseFloat(supBase) || 100.0,
      perMileRate: parseFloat(supMile) || 15.0,
      activeDrivers: 1,
      supportedTiers: supTiers,
      color: supColor,
      description: 'Newly registered independent operator connected via Central CabPath.'
    };

    onAddSupplier(newSup);
    setSupSuccess(true);
    // Reset
    setSupName('');
    setSupBase('100.00');
    setSupMile('15.00');
    setTimeout(() => setSupSuccess(false), 2000);
  };

  // Handle driver submit
  const handleDriverSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!drvName || !drvCar || !drvPlate) return;

    const newDrv: Driver = {
      id: `drv-${Date.now()}`,
      name: drvName,
      avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random()*100000)}?w=150&h=150&fit=crop&crop=face`,
      rating: 5.0,
      phone: '+1 (555) ' + Math.floor(100 + Math.random() * 900) + '-' + Math.floor(1000 + Math.random() * 9000),
      carModel: drvCar,
      carPlate: drvPlate.toUpperCase(),
      supplierId: drvSupplier
    };

    onAddDriver(newDrv);
    setDrvSuccess(true);
    setDrvName('');
    setDrvCar('');
    setDrvPlate('');
    setTimeout(() => setDrvSuccess(false), 2000);
  };

  const toggleTier = (tier: VehicleTier) => {
    if (supTiers.includes(tier)) {
      if (supTiers.length > 1) {
        setSupTiers(supTiers.filter(t => t !== tier));
      }
    } else {
      setSupTiers([...supTiers, tier]);
    }
  };

  // Mock static stats compiled dynamically from initial suppliers
  const totalConnectedDrivers = drivers.length;
  const activeUnions = suppliers.length;

  return (
    <div className="bg-[#121214] border border-zinc-800/80 rounded-2xl p-5 shadow-xl flex flex-col gap-5 shadow-black/60" id="supplier-hub-container">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Network className="w-5 h-5 text-yellow-400" />
            <span>Connected Supplier Portal</span>
          </h2>
          <p className="text-[11px] text-zinc-400 mt-1">
            Real-time telemetry and registries of local transport cooperatives unified in "one path."
          </p>
        </div>

        <div className="flex gap-1.5 bg-[#0B0B0C] border border-zinc-800/80 p-0.5 rounded-lg text-xs">
          <button
            id="hub-tab-stats"
            onClick={() => setActiveSubTab('stats')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              activeSubTab === 'stats'
                ? 'bg-yellow-400/10 border border-yellow-400/25 text-yellow-400 text-[11px]'
                : 'text-zinc-400 hover:text-white text-[11px]'
            }`}
          >
            Network Analytics
          </button>
          <button
            id="hub-tab-registry"
            onClick={() => setActiveSubTab('registry')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              activeSubTab === 'registry'
                ? 'bg-yellow-400/10 border border-yellow-400/25 text-yellow-400 text-[11px]'
                : 'text-zinc-400 hover:text-white text-[11px]'
            }`}
          >
            Add Supplier / Cab
          </button>
        </div>
      </div>

      {activeSubTab === 'stats' ? (
        <div className="space-y-5">
          {/* Executive Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#0B0B0C] p-3.5 rounded-xl border border-zinc-800/80 text-center">
              <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-500">Unions Active</span>
              <div className="text-xl font-black text-yellow-400 mt-1">{activeUnions}</div>
            </div>
            <div className="bg-[#0B0B0C] p-3.5 rounded-xl border border-zinc-800/80 text-center">
              <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-500">Total Registered</span>
              <div className="text-xl font-black text-yellow-400 mt-1">{totalConnectedDrivers} Cars</div>
            </div>
            <div className="bg-[#0B0B0C] p-3.5 rounded-xl border border-zinc-800/80 text-center">
              <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-500">Dispatch Bookings</span>
              <div className="text-xl font-black text-yellow-400 mt-1">{bookingHistoryCount} Rides</div>
            </div>
          </div>

          {/* Supplier Registry Grid */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Unions on Central Path</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {suppliers.map(sup => {
                const supplierDrivers = drivers.filter(d => d.supplierId === sup.id);

                return (
                  <div key={sup.id} className="bg-[#0B0B0C] p-4 rounded-xl border border-zinc-800/80 space-y-2.5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{sup.logo}</span>
                        <span className="font-bold text-xs text-white">{sup.name}</span>
                      </div>
                      <span 
                        className="w-2.5 h-2.5 rounded-full" 
                        style={{ backgroundColor: sup.color }} 
                      />
                    </div>

                    <p className="text-[10px] text-zinc-400 leading-normal line-clamp-2">
                      {sup.description}
                    </p>

                    <div className="flex justify-between items-center text-[10px] font-mono border-t border-zinc-900 pt-2 text-zinc-400">
                      <div>
                        Rate: <span className="text-zinc-200 font-bold">₹{sup.baseFare.toFixed(2)} + ₹{sup.perMileRate.toFixed(2)}/km</span>
                      </div>
                      <div>
                        Registry: <span className="text-zinc-200 font-bold">{supplierDrivers.length} registered</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hotspot Coordinate Multipliers */}
          <div className="bg-[#0B0B0C] border border-zinc-800/80 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-300">
              <TrendingUp className="w-4 h-4 text-yellow-400" />
              <span>Real-Time Hotspot Surge Coefficients</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono">
              <div className="p-2.5 bg-[#121214] rounded border border-zinc-800/80 flex justify-between items-center">
                <span className="text-zinc-400">Airport</span>
                <span className="text-yellow-400 font-bold">1.8x Surge</span>
              </div>
              <div className="p-2.5 bg-[#121214] rounded border border-zinc-800/80 flex justify-between items-center">
                <span className="text-zinc-400">Central Station</span>
                <span className="text-yellow-400 font-bold">1.4x Surge</span>
              </div>
              <div className="p-2.5 bg-[#121214] rounded border border-zinc-800/80 flex justify-between items-center">
                <span className="text-zinc-400">Tech Park</span>
                <span className="text-zinc-400">1.0x Normal</span>
              </div>
              <div className="p-2.5 bg-[#121214] rounded border border-zinc-800/80 flex justify-between items-center">
                <span className="text-zinc-400">Residential Heights</span>
                <span className="text-zinc-400">1.0x Normal</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* A. Register Supplier Form */}
          <form onSubmit={handleSupplierSubmit} className="bg-[#0B0B0C] rounded-xl p-4.5 border border-zinc-800/80 space-y-3.5">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Database className="w-4 h-4 text-yellow-400" />
              <span>Register Transport Cooperative</span>
            </h4>

            <div className="space-y-2">
              <input
                id="reg-sup-name"
                type="text"
                placeholder="Cooperative Union Name"
                className="w-full bg-[#121214] border border-zinc-800/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
                value={supName}
                onChange={(e) => setSupName(e.target.value)}
                required
              />

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[9px] text-zinc-500 font-bold uppercase block mb-1">Base Fare (₹)</label>
                  <input
                    id="reg-sup-base"
                    type="number"
                    step="0.10"
                    placeholder="e.g. 100.00"
                    className="w-full bg-[#121214] border border-zinc-800/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
                    value={supBase}
                    onChange={(e) => setSupBase(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] text-zinc-500 font-bold uppercase block mb-1">Per KM Rate (₹)</label>
                  <input
                    id="reg-sup-mile"
                    type="number"
                    step="0.10"
                    placeholder="e.g. 15.00"
                    className="w-full bg-[#121214] border border-zinc-800/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
                    value={supMile}
                    onChange={(e) => setSupMile(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Tiers Selection */}
              <div>
                <label className="text-[9px] text-zinc-500 font-bold uppercase block mb-1.5">Supported Tiers</label>
                <div className="flex gap-1.5 flex-wrap">
                  {(['economy', 'comfort', 'premium', 'xl'] as VehicleTier[]).map(t => {
                    const isSelected = supTiers.includes(t);
                    return (
                      <button
                        key={t}
                        id={`reg-tier-btn-${t}`}
                        type="button"
                        onClick={() => toggleTier(t)}
                        className={`px-2 py-1 text-[10px] rounded-md font-bold border cursor-pointer ${
                          isSelected 
                            ? 'bg-yellow-400/10 border-yellow-400 text-yellow-400' 
                            : 'bg-[#121214] border-zinc-800/60 text-zinc-500 hover:border-zinc-600'
                        }`}
                      >
                        {t.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color picker representation */}
              <div className="flex gap-1.5 items-center pt-1.5">
                <span className="text-[10px] text-zinc-400 font-semibold mr-1">Color Code:</span>
                {['#EC4899', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'].map(col => (
                  <button
                    key={col}
                    id={`reg-color-btn-${col.replace('#', '')}`}
                    type="button"
                    onClick={() => setSupColor(col)}
                    className={`w-5 h-5 rounded-full border-2 transition-transform cursor-pointer ${
                      supColor === col ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>

            <button
              id="submit-register-supplier"
              type="submit"
              className="w-full py-2 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              {supSuccess ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{supSuccess ? 'Cooperative Connected!' : 'Connect Cooperative'}</span>
            </button>
          </form>

          {/* B. Register Driver Form */}
          <form onSubmit={handleDriverSubmit} className="bg-[#0B0B0C] rounded-xl p-4.5 border border-zinc-800/80 space-y-3.5">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Users className="w-4 h-4 text-yellow-400" />
              <span>Enlist Taxi/Driver Unit</span>
            </h4>

            <div className="space-y-2">
              <input
                id="reg-drv-name"
                type="text"
                placeholder="Driver Full Name"
                className="w-full bg-[#121214] border border-zinc-800/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
                value={drvName}
                onChange={(e) => setDrvName(e.target.value)}
                required
              />

              <div className="relative">
                <label className="text-[9px] text-zinc-500 font-bold uppercase block mb-1">Affiliated Union</label>
                <select
                  id="reg-drv-supplier"
                  className="w-full bg-[#121214] border border-zinc-800/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
                  value={drvSupplier}
                  onChange={(e) => setDrvSupplier(e.target.value)}
                >
                  {suppliers.map(sup => (
                    <option key={`reg-drv-sup-${sup.id}`} value={sup.id} className="bg-[#121214] text-white">{sup.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  id="reg-drv-car"
                  type="text"
                  placeholder="Car Model (e.g. Ford Crown Vic)"
                  className="w-full bg-[#121214] border border-zinc-800/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
                  value={drvCar}
                  onChange={(e) => setDrvCar(e.target.value)}
                  required
                />
                <input
                  id="reg-drv-plate"
                  type="text"
                  placeholder="License Plate (e.g. CAB-492)"
                  className="w-full bg-[#121214] border border-zinc-800/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-yellow-400"
                  value={drvPlate}
                  onChange={(e) => setDrvPlate(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              id="submit-register-driver"
              type="submit"
              className="w-full py-2 bg-yellow-400 hover:bg-yellow-300 text-zinc-950 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              {drvSuccess ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{drvSuccess ? 'Driver Enlisted!' : 'Enlist Driver Unit'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
