import { Location, Supplier, Driver, VehicleTier } from './types';

export const LOCATIONS: Location[] = [
  { id: 'damnjodi', name: 'Damanjodi (NALCO Township)', lat: 88, lng: 35 },
  { id: 'koraput', name: 'Koraput Junction & Hills', lat: 75, lng: 25 },
  { id: 'sunabeda', name: 'Sunabeda Aero-Engine Town', lat: 55, lng: 45 },
  { id: 'vizag', name: 'Vizag Beach Road Hub', lat: 15, lng: 85 },
  { id: 'airport', name: 'Visakhapatnam Airport (VTZ)', lat: 30, lng: 80 },
  { id: 'railway_station', name: 'Visakhapatnam Railway Station', lat: 20, lng: 70 }
];

export const SUPPLIERS: Supplier[] = [
  {
    id: 'metro_cabs',
    name: 'Metro Cabs India',
    logo: '🚕',
    rating: 4.7,
    completedRides: 14200,
    baseFare: 100.00,
    perMileRate: 15.00,
    activeDrivers: 24,
    supportedTiers: ['economy', 'comfort', 'xl'],
    color: '#EAB308', // yellow-500
    description: 'The classic local taxi network. Reliable, ubiquitous, and pocket-friendly.'
  },
  {
    id: 'eco_ride',
    name: 'EcoRide Green',
    logo: '🌿',
    rating: 4.8,
    completedRides: 8900,
    baseFare: 120.00,
    perMileRate: 18.00,
    activeDrivers: 15,
    supportedTiers: ['economy', 'comfort'],
    color: '#22C55E', // green-500
    description: '100% hybrid and electric fleet. Quiet, clean, and eco-conscious travel.'
  },
  {
    id: 'elite_chauffeur',
    name: 'Elite Chauffeur',
    logo: '🎩',
    rating: 4.9,
    completedRides: 3100,
    baseFare: 250.00,
    perMileRate: 30.00,
    activeDrivers: 8,
    supportedTiers: ['premium'],
    color: '#06B6D4', // cyan-500
    description: 'Premium black car and professional chauffeur service for business.'
  },
  {
    id: 'town_dispatch',
    name: 'Town & Ghat Travels',
    logo: '🚐',
    rating: 4.5,
    completedRides: 12400,
    baseFare: 150.00,
    perMileRate: 22.00,
    activeDrivers: 18,
    supportedTiers: ['comfort', 'xl'],
    color: '#EF4444', // red-500
    description: 'Perfect for ghat roads, group travel, and heavy luggage. SUVs & local operators.'
  },
  {
    id: 'quick_coop',
    name: 'QuickCoop Drivers',
    logo: '⚡',
    rating: 4.6,
    completedRides: 6800,
    baseFare: 80.00,
    perMileRate: 12.00,
    activeDrivers: 12,
    supportedTiers: ['economy', 'comfort'],
    color: '#8B5CF6', // purple-500
    description: 'Local driver cooperative. Quick pickups directly supporting native operators.'
  }
];

export const DRIVERS: Driver[] = [
  {
    id: 'd1',
    name: 'Rajesh Patnaik',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    rating: 4.8,
    phone: '+91 94371 23456',
    carModel: 'Maruti Suzuki Dzire (Yellow-Black)',
    carPlate: 'OD-10-A-1234',
    supplierId: 'metro_cabs'
  },
  {
    id: 'd2',
    name: 'Sunita Bisoyi',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    rating: 4.9,
    phone: '+91 70081 87654',
    carModel: 'Tata Nexon EV (Emerald Green)',
    carPlate: 'AP-31-EV-9900',
    supplierId: 'eco_ride'
  },
  {
    id: 'd3',
    name: 'Amitabh Mishra',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    rating: 4.95,
    phone: '+91 90901 23456',
    carModel: 'Toyota Innova Crysta (Black)',
    carPlate: 'AP-31-XX-0777',
    supplierId: 'elite_chauffeur'
  },
  {
    id: 'd4',
    name: 'Debashish Panda',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    rating: 4.6,
    phone: '+91 82495 34567',
    carModel: 'Mahindra Scorpio-N (Silver)',
    carPlate: 'OD-10-B-5678',
    supplierId: 'town_dispatch'
  },
  {
    id: 'd5',
    name: 'Sanjeev Nayak',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    rating: 4.7,
    phone: '+91 91785 76543',
    carModel: 'Hyundai Aura (White)',
    carPlate: 'OD-10-C-8181',
    supplierId: 'quick_coop'
  }
];

// Calculate coordinate distance (scaled to realistic kilometers for Andhra-Odisha corridor)
export function calculateDistance(loc1: Location, loc2: Location): number {
  const dx = loc1.lat - loc2.lat;
  const dy = loc1.lng - loc2.lng;
  const dist = Math.sqrt(dx * dx + dy * dy);
  // Scale to realistic km (e.g. Vizag to Koraput is ~220 km)
  return parseFloat((dist * 2.5).toFixed(1));
}

// Calculate duration in minutes (avg speed 50km/h on ghat roads)
export function calculateDuration(distance: number): number {
  // distance / speed * 60 + mountain traffic buffers
  const baseTime = (distance / 50) * 60;
  return Math.ceil(baseTime + 10); // minimum buffer
}

// Get fare multiplier for different vehicle tiers
export function getTierMultiplier(tier: VehicleTier): number {
  switch (tier) {
    case 'economy': return 1.0;
    case 'comfort': return 1.3;
    case 'premium': return 2.2;
    case 'xl': return 1.6;
    default: return 1.0;
  }
}
