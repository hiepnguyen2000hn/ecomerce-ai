import { atom } from 'jotai';
import type { UserMe } from './api/types';

// Navigation
export const activeTabAtom       = atom<string>('products');
export const selectedProductAtom = atom<any>(null);
export const languageAtom        = atom<string>('en');

// Auth (tokens persisted by lib/api/client.ts; user in-memory only)
export const currentUserAtom     = atom<UserMe | null>(null);
export const isAuthenticatedAtom = atom((get) => get(currentUserAtom) !== null);

// Ads Command — connection state (persisted to localStorage)
export type AdsConnection = { meta: boolean; sheets: boolean; sku: string | null };
export const adsConnectionAtom = atom<AdsConnection>({ meta: false, sheets: false, sku: null });

// Ads Command — active sub-tab
export type AdsTab = 'Monitor' | 'Launcher' | 'Strategy' | 'Logs';
export const adsTabAtom = atom<AdsTab>('Monitor');
