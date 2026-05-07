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
    description: 'High-quality evening wrap dress with a sophisticated silhouette. Crafted from premium silk for a luxurious feel and elegant drape.',
    image: 'https://picsum.photos/seed/dress/800/800',
    status: 'Scaling',
    category: 'Dress',
    price: 15.00,
    available: 450
  },
  {
    id: '2',
    sku: 'WF-JCK-05',
    name: 'Lightweight Bomber Jacket',
    description: 'Versatile lightweight bomber jacket perfect for seasonal transitions. Features water-resistant fabric and a modern athletic cut.',
    image: 'https://picsum.photos/seed/jacket/800/800',
    status: 'Testing',
    category: 'Outerwear',
    price: 25.00,
    available: 1200
  },
  {
    id: '3',
    sku: 'WF-ACC-12',
    name: 'Luxury Minimalist Watch',
    description: 'Timeless luxury watch with a minimalist face and premium leather strap. Precision engineered for style and reliability.',
    image: 'https://picsum.photos/seed/watch/800/800',
    status: 'Mature',
    category: 'Accessories',
    price: 45.00,
    available: 300
  },
  {
    id: '4',
    sku: 'WF-BAG-09',
    name: 'Leather Messenger Bag',
    description: 'Full-grain leather messenger bag with multiple compartments. Designed for the modern professional on the move.',
    image: 'https://picsum.photos/seed/bag/800/800',
    status: 'Scaling',
    category: 'Bags',
    price: 35.00,
    available: 85
  },
  {
    id: '5',
    sku: 'WF-JW-99',
    name: 'Pearl Drop Earrings v2',
    description: 'Sophisticated pearl drop earrings featuring high-luster 10mm pearls. Mounted on hypoallergenic settings for daily comfort.',
    image: 'https://picsum.photos/seed/earrings/800/800',
    status: 'Draft',
    category: 'Jewelry',
    price: 15.00,
    available: 450
  }
];

export interface LandingPage {
  id: string;
  productId: string;
  slug: string;
  status: 'Needs Review' | 'Published' | 'Archived';
  traffic: {
    users: number;
    views: number;
  };
  conversion: {
    cvr: number;
    cpa: number;
  };
  createdAt: string;
}

export const MOCK_LANDING_PAGES: LandingPage[] = [
  {
    id: 'lp-1',
    productId: '1',
    slug: 'lp-v1-msg',
    status: 'Needs Review',
    traffic: { users: 890, views: 1250 },
    conversion: { cvr: 3.2, cpa: 12.5 },
    createdAt: '2024-05-20 14:30'
  },
  {
    id: 'lp-2',
    productId: '2',
    slug: 'lp-v2-msg',
    status: 'Published',
    traffic: { users: 3100, views: 4500 },
    conversion: { cvr: 4.8, cpa: 10.2 },
    createdAt: '2024-05-18 09:15'
  }
];
