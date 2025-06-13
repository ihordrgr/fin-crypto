import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { botId, action } = body;

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection("bot_controls");

    await collection.insertOne({
      botId,
      action,
      timestamp: new Date()
    });

    return NextResponse.json({ message: 'Bot control action recorded successfully' });
  } catch (error) {
    console.error("Error recording bot control:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}