import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, amount, wallet } = body;

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("withdraw_requests");

    await collection.insertOne({
      userId,
      amount,
      wallet,
      status: 'pending',
      timestamp: new Date()
    });

    return NextResponse.json({ message: 'Withdrawal request submitted' });
  } catch (error) {
    console.error("Error handling withdrawal:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}