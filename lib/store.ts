import { atom } from 'jotai';
import { Product } from '@/lib/mock-data';

// App state atoms
export const activeTabAtom = atom<string>('products');
export const selectedProductAtom = atom<Product | null>(null);

// User preferences
export const languageAtom = atom<string>('en');
