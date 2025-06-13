import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  const client = await clientPromise;
  const db = client.db();

  const totalUsers = await db.collection('users').countDocuments();
  const totalBots = await db.collection('bots').countDocuments();
  const totalImpressions = await db.collection('impressions').countDocuments();
  const totalClicks = await db.collection('clicks').countDocuments();

  return NextResponse.json({ totalUsers, totalBots, totalImpressions, totalClicks });
}