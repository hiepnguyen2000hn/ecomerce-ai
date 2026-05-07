import { NextResponse } from 'next/server';

export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 700));
  
  const customers = [
    { id: '1', name: 'Alice Johnson', email: 'alice@example.com', orders: 12, totalSpent: '$1,240' },
    { id: '2', name: 'Bob Smith', email: 'bob@smith.com', orders: 5, totalSpent: '$450' },
    { id: '3', name: 'Charlie Brown', email: 'charlie@peanuts.com', orders: 24, totalSpent: '$3,892' },
    { id: '4', name: 'Diana Prince', email: 'wonder@themyscira.com', orders: 8, totalSpent: '$920' },
    { id: '5', name: 'Edward Norton', email: 'fight@club.com', orders: 15, totalSpent: '$2,100' },
  ];

  return NextResponse.json(customers);
}
