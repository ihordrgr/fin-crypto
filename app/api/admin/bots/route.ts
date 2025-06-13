import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  const client = await clientPromise;
  const db = client.db();

  const bots = await db.collection('bots').find().toArray();
  return NextResponse.json({ bots });
}

import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  const client = await clientPromise;
  const db = client.db();

  const body = await req.json();
  const result = await db.collection('bots').insertOne({
    name: body.name,
    active: body.active,
    createdAt: new Date()
  });

  return NextResponse.json({ insertedId: result.insertedId });
}