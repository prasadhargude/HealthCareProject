import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  const body = await request.json();
  const { specialty, date, time, patientName, patientPhone } = body;

  if (!specialty || !date || !time || !patientName || !patientPhone) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("healthconnect");
    
    // Check if the slot is still available
    const slot = await db.collection("availableSlots").findOne({
      specialty,
      date,
      time,
      isAvailable: true
    });

    if (!slot) {
      return NextResponse.json({ error: 'Selected slot is no longer available' }, { status: 400 });
    }

    // Book the appointment
    const result = await db.collection("appointments").insertOne({
      specialty,
      date,
      time,
      patientName,
      patientPhone,
      createdAt: new Date()
    });

    // Mark the slot as unavailable
    await db.collection("availableSlots").updateOne(
      { _id: new ObjectId(slot._id) },
      { $set: { isAvailable: false } }
    );

    return NextResponse.json({ appointmentId: result.insertedId });
  } catch (error) {
    console.error("Error booking appointment:", error);
    return NextResponse.json({ error: "Failed to book appointment" }, { status: 500 });
  }
}