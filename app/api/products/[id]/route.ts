import { NextRequest, NextResponse } from 'next/server';
import { MOCK_PRODUCTS, Product } from '@/lib/mock-data';

let products = [...MOCK_PRODUCTS];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const updates: Partial<Product> = await request.json();
  
  const index = products.findIndex(p => p.id === id);
  if (index !== -1) {
    products[index] = { ...products[index], ...updates };
    return NextResponse.json(products[index]);
  }
  
  return NextResponse.json({ error: 'Product not found' }, { status: 404 });
}
