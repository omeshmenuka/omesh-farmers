
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

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  details: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface Farmer {
  id: string;
  name: string;
  description: string;
  address: string;
  coordinates: Coordinates;
  products: Product[];
  orders?: Order[]; // List of received orders
  rating: number;
  reviewCount: number;
  imageUrl: string;
  isOpen: boolean;
  phone: string;
  email?: string;
  verified: boolean;
  isApproved: boolean;
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
  type: 'seasonal' | 'new_arrival' | 'system' | 'stock_update';
  link?: string;
}
