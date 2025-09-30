export type Bill = 'monthly' | 'yearly';

export type Review = {
  id: string;
  handle: string;
  avatar: string;
  text: string;
  rating: number;
};

export type Plan = {
  id: string;
  tier: 'Core' | 'Boost' | 'Power' | 'Extreme';
  priceCZK: number;
  popular?: boolean;
  cpu: string;
  vcores: string;
  ram: string;
  storage: string;
  backups: string;
  ports: string;
  ctaHref: string;
};

export type Game = {
  id: string;
  name: string;
  image: string; // URL or import
};
