
import { Farmer, ProductCategory } from './types';

export const ADMIN_PASSWORD = 'admin'; // Simple password for demo

export const MOCK_FARMERS: Farmer[] = [
  {
    id: '1',
    name: 'Zaļā Zeme (Green Earth)',
    description: 'Family-owned organic farm located just outside Riga. We specialize in root vegetables and seasonal greens.',
    address: 'Mārupe district, Latvia',
    coordinates: { lat: 56.9000, lng: 24.0500 },
    rating: 4.8,
    reviewCount: 5,
    imageUrl: 'https://picsum.photos/400/300?random=1',
    isOpen: true,
    phone: '+371 20000001',
    verified: true,
    isApproved: true,
    credentials: { username: 'farm1', password: '123' },
    products: [
      { id: 'p1', name: 'Organic Potatoes', category: ProductCategory.VEGETABLES, price: 0.80, unit: 'kg', inStock: true },
      { id: 'p2', name: 'Carrots', category: ProductCategory.VEGETABLES, price: 1.20, unit: 'kg', inStock: true },
    ]
  },
  {
    id: '2',
    name: 'Bišu Draugs (Bees Friend)',
    description: 'Premium honey harvested from the wild forests of Sigulda. 100% natural and unfiltered.',
    address: 'Sigulda region, Latvia',
    coordinates: { lat: 57.1500, lng: 24.8500 },
    rating: 4.9,
    reviewCount: 3,
    imageUrl: 'https://picsum.photos/400/300?random=2',
    isOpen: false,
    phone: '+371 20000002',
    verified: true,
    isApproved: true,
    credentials: { username: 'farm2', password: '123' },
    products: [
      { id: 'p3', name: 'Forest Honey', category: ProductCategory.HONEY, price: 8.00, unit: 'jar', inStock: true },
      { id: 'p4', name: 'Beeswax Candles', category: ProductCategory.CRAFTS, price: 5.00, unit: 'pc', inStock: true },
    ]
  },
  {
    id: '3',
    name: 'Svaigi Piena Produkti',
    description: 'Fresh dairy directly from our cows. Milk, cheese, and homemade butter available daily.',
    address: 'Bauska region, Latvia',
    coordinates: { lat: 56.4000, lng: 24.1800 },
    rating: 4.6,
    reviewCount: 2,
    imageUrl: 'https://picsum.photos/400/300?random=3',
    isOpen: true,
    phone: '+371 20000003',
    verified: false,
    isApproved: true,
    credentials: { username: 'farm3', password: '123' },
    products: [
      { id: 'p5', name: 'Fresh Milk', category: ProductCategory.DAIRY, price: 1.50, unit: 'l', inStock: true },
      { id: 'p6', name: 'Cottage Cheese', category: ProductCategory.DAIRY, price: 4.50, unit: 'kg', inStock: false },
    ]
  },
  {
    id: '4',
    name: 'Rīgas Centrāltirgus Stends 45',
    description: 'Find us at the central market! We sell seasonal berries and fruits gathered from local forests.',
    address: 'Riga Central Market, Riga',
    coordinates: { lat: 56.9440, lng: 24.1160 },
    rating: 4.7,
    reviewCount: 8,
    imageUrl: 'https://picsum.photos/400/300?random=4',
    isOpen: true,
    phone: '+371 20000004',
    verified: true,
    isApproved: true,
    credentials: { username: 'farm4', password: '123' },
    products: [
      { id: 'p7', name: 'Strawberries', category: ProductCategory.FRUITS, price: 6.00, unit: 'kg', inStock: true },
      { id: 'p8', name: 'Blueberries', category: ProductCategory.FRUITS, price: 8.50, unit: 'kg', inStock: true },
    ]
  }
];

export const CATEGORIES = [
  { label: 'All', value: 'ALL' },
  { label: 'Vegetables', value: ProductCategory.VEGETABLES },
  { label: 'Fruits', value: ProductCategory.FRUITS },
  { label: 'Dairy', value: ProductCategory.DAIRY },
  { label: 'Honey', value: ProductCategory.HONEY },
];