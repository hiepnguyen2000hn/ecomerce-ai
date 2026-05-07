export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  image: string;
  status: 'Draft' | 'Testing' | 'Scaling' | 'Mature' | 'Stopped';
  category: string;
  price: number;
  available: number;
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    sku: 'WF-DRS-01',
    name: 'Silk Evening Wrap Dress',
    description: 'High-quality freshwater pearl drop earrings featuring a sophisticated minimalist aesthetic. Hand-selected for luster and shape, these 10mm pearls are mounted on premium hypoallergenic precious metal findings for lasting brilliance.',
    image: 'https://picsum.photos/seed/dress/800/800',
    status: 'Scaling',
    category: 'Váy',
    price: 15.00,
    available: 450
  },
  {
    id: '2',
    sku: 'WF-JCK-05',
    name: 'Lightweight Bomber Jacket',
    description: 'High-quality freshwater pearl drop earrings featuring a sophisticated minimalist aesthetic. Hand-selected for luster and shape, these 10mm pearls are mounted on premium hypoallergenic precious metal findings for lasting brilliance.',
    image: 'https://picsum.photos/seed/jacket/800/800',
    status: 'Testing',
    category: 'Áo khoác',
    price: 25.00,
    available: 1200
  },
  {
    id: '3',
    sku: 'WF-ACC-12',
    name: 'Luxury Minimalist Watch',
    description: 'High-quality freshwater pearl drop earrings featuring a sophisticated minimalist aesthetic. Hand-selected for luster and shape, these 10mm pearls are mounted on premium hypoallergenic precious metal findings for lasting brilliance.',
    image: 'https://picsum.photos/seed/watch/800/800',
    status: 'Mature',
    category: 'Trang sức',
    price: 45.00,
    available: 300
  },
  {
    id: '4',
    sku: 'WF-BAG-09',
    name: 'Leather Messenger Bag',
    description: 'High-quality freshwater pearl drop earrings featuring a sophisticated minimalist aesthetic. Hand-selected for luster and shape, these 10mm pearls are mounted on premium hypoallergenic precious metal findings for lasting brilliance.',
    image: 'https://picsum.photos/seed/bag/800/800',
    status: 'Scaling',
    category: 'Phụ kiện',
    price: 35.00,
    available: 85
  },
  {
    id: '5',
    sku: 'WF-JW-99',
    name: 'Pearl Drop Earrings v2',
    description: 'High-quality freshwater pearl drop earrings featuring a sophisticated minimalist aesthetic. Hand-selected for luster and shape, these 10mm pearls are mounted on premium hypoallergenic precious metal findings for lasting brilliance.',
    image: 'https://picsum.photos/seed/earrings/800/800',
    status: 'Draft',
    category: 'Trang sức',
    price: 15.00,
    available: 450
  }
];
