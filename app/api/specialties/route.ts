import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("healthconnect");
    const specialties = await db.collection("specialties").find({}).toArray();
    
    return NextResponse.json(specialties);
  } catch (error) {
    console.error("Error fetching specialties:", error);
    return NextResponse.json({ error: "Failed to fetch specialties" }, { status: 500 });
  }
}