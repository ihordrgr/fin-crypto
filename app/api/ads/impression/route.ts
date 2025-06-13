import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { adId, userId } = body;

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("impressions");

    await collection.insertOne({
      adId,
      userId,
      timestamp: new Date()
    });

    return NextResponse.json({ message: 'Impression recorded successfully' });
  } catch (error) {
    console.error("Error recording impression:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}