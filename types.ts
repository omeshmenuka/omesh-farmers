
export enum UserRole {
  BUYER = 'BUYER',
  FARMER = 'FARMER',
  ADMIN = 'ADMIN'
}

export enum ProductCategory {
  VEGETABLES = 'Vegetables',
  FRUITS = 'Fruits',
  DAIRY = 'Dairy',
  HONEY = 'Honey',
  MEAT = 'Meat',
  BAKERY = 'Bakery',
  CRAFTS = 'Crafts'
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  unit: string;
  inStock: boolean;
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Farmer {
  id: string;
  name: string;
  description: string; // Auto-translated content usually goes here
  address: string;
  coordinates: Coordinates;
  products: Product[];
  rating: number;
  reviewCount: number; // Total number of reviews
  imageUrl: string;
  isOpen: boolean;
  phone: string;
  email?: string; // Contact email
  verified: boolean;
  isApproved: boolean; // Determines visibility on the main map/list
  credentials?: {
    username: string;
    password: string;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  type: 'seasonal' | 'new_arrival' | 'system';
}
