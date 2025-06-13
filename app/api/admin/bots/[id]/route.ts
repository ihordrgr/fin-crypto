import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = await clientPromise;
  const db = client.db();

  const result = await db.collection('bots').deleteOne({ _id: new ObjectId(params.id) });

  return NextResponse.json({ success: result.deletedCount === 1 });
}