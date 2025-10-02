// store/types.ts
export type IntervalKey = 'monthly' | 'quarterly' | 'semi_annual' | 'annual';

export type Review = {
  id: string;
  handle: string;
  avatar: string;
  text: string;
  rating: number;
};

// Data for pricing cards coming from the server (Inertia props)
export type PlanCardData = {
  id: string; // plan key (e.g., 'core')
  tier: 'Core' | 'Boost' | 'Power' | 'Extreme' | string; // human name
  intervals: Partial<Record<IntervalKey, number>>; // minor units (e.g., CZK)
  currency: string; // e.g., 'czk'
  popular?: boolean;
  cpu: string;
  vcores: string;
  ram: string;
  storage: string;
  backups: string;
  ports: string;
};

export type Game = {
  id: string;
  name: string;
  image: string; // URL or import
};
