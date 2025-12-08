export enum ProductType {
  OLIVE_OIL = 'Olive Oil',
  WINE = 'Wine',
  PASTA = 'Pasta',
  CHEESE = 'Cheese'
}

export interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  icon: 'harvest' | 'press' | 'bottle' | 'shipping' | 'store';
  verified: boolean;
  hash: string;
}

export interface Product {
  id: string;
  name: string;
  type: ProductType;
  producer: string;
  origin: string;
  harvestYear: number;
  description: string;
  imageUrl: string;
  timeline: TimelineEvent[];
  certificates: string[];
  sustainabilityScore: number; // 0-100
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  icon: 'blockchain' | 'security' | 'gamification' | 'ai';
  duration: string;
  level: string;
}

export interface Member {
  id: string;
  name: string;
  role: string;
  city: string;
  description: string;
  coordinates: { lat: number; lng: number }; // Real geospatial coordinates
  type: 'educational' | 'corporate' | 'tech';
}