import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const specialty = searchParams.get('specialty');
  const date = searchParams.get('date');

  if (!specialty || !date) {
    return NextResponse.json({ error: 'Specialty and date are required' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("healthconnect");
    
    const availableSlots = await db.collection("availableSlots")
      .find({ specialty: specialty, date: date, isAvailable: true })
      .sort({ time: 1 })
      .toArray();

    return NextResponse.json(availableSlots);
  } catch (error) {
    console.error("Error fetching available slots:", error);
    return NextResponse.json({ error: "Failed to fetch available slots" }, { status: 500 });
  }
}