// app/api/appointment-details/route.ts

import { NextResponse } from 'next/server';
import { getAppointmentDetails, Appointment } from '@/database-utils';

export async function GET(req: Request) {
  try {
    const { id } = Object.fromEntries(new URL(req.url).searchParams.entries());

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Invalid appointment ID' }, { status: 400 });
    }

    const appointment: Appointment | null = await getAppointmentDetails(id);

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Convert ObjectId to string for client-side compatibility
    const appointmentResponse = {
      id: appointment._id.toHexString(),
      specialty: appointment.specialty,
      date: appointment.date,
      time: appointment.time,
      createdAt: appointment.createdAt,
    };

    return NextResponse.json(appointmentResponse);
  } catch (error) {
    console.error('Error in appointment-details route:', error);
    return NextResponse.json({ error: 'Failed to fetch appointment details' }, { status: 500 });
  }
}
