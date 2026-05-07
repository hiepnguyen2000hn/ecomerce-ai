import { NextResponse } from 'next/server';

export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return NextResponse.json({
    stats: [
      { label: 'Revenue', value: '$124,592', change: '+12.5%' },
      { label: 'Orders', value: '1,429', change: '+8.2%' },
      { label: 'Customers', value: '42,910', change: '+4.1%' },
      { label: 'Bounce Rate', value: '24.2%', change: '-2.4%' },
    ],
    recentActivity: [
      { id: '1', type: 'order', message: 'New order from John Doe', time: '2 mins ago' },
      { id: '2', type: 'customer', message: 'New customer registration', time: '15 mins ago' },
      { id: '3', type: 'system', message: 'Inventory update completed', time: '1 hour ago' },
    ]
  });
}
