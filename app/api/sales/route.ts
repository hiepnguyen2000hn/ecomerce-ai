import { NextResponse } from 'next/server';

export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const sales = Array.from({ length: 10 }, (_, i) => ({
    id: `sale-${i}`,
    product: `Product ${Math.floor(Math.random() * 10) + 1}`,
    amount: (Math.random() * 500 + 50).toFixed(2),
    date: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
    status: Math.random() > 0.2 ? 'Completed' : 'Pending'
  }));

  return NextResponse.json(sales);
}
