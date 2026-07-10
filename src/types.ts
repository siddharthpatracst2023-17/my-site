export interface Location {
  id: string;
  name: string;
  lat: number; // 0 to 100 for canvas coordinates
  lng: number; // 0 to 100 for canvas coordinates
}

export type VehicleTier = 'economy' | 'comfort' | 'premium' | 'xl';

export interface Supplier {
  id: string;
  name: string;
  logo: string; // Color name or icon name
  rating: number;
  completedRides: number;
  baseFare: number;
  perMileRate: number;
  activeDrivers: number;
  supportedTiers: VehicleTier[];
  color: string; // Tailwind hex or class color
  description: string;
}

export interface Driver {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  phone: string;
  carModel: string;
  carPlate: string;
  supplierId: string;
}

export interface FareEstimate {
  supplierId: string;
  supplierName: string;
  color: string;
  tier: VehicleTier;
  fare: number;
  durationMins: number;
  distanceMiles: number;
  etaMins: number;
}

export type BookingStatus = 
  | 'idle' 
  | 'searching' 
  | 'payment_pending' 
  | 'driver_assigned' 
  | 'driver_en_route' 
  | 'trip_active' 
  | 'completed' 
  | 'cancelled';

export interface Booking {
  id: string;
  pickup: Location;
  dropoff: Location;
  supplier: Supplier;
  tier: VehicleTier;
  driver: Driver | null;
  fare: number;
  distance: number;
  duration: number;
  status: BookingStatus;
  paymentMethod: string;
  paymentCardLast4?: string;
  timestamp: string;
  rating?: number;
  tip?: number;
}

export interface SupplierStat {
  id: string;
  name: string;
  totalRevenue: number;
  activeDispatches: number;
  onlineDrivers: number;
  idleDrivers: number;
}
