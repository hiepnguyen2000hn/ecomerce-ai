import { NextRequest, NextResponse } from 'next/server';
import { MOCK_PRODUCTS, Product } from '@/lib/mock-data';

// In a real app, this would be a database call
let products = [...MOCK_PRODUCTS];

export async function GET() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const newProduct: Product = await request.json();
  products = [newProduct, ...products];
  return NextResponse.json(newProduct);
}
