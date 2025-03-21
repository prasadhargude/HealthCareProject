import { NextResponse } from 'next/server';
import { getAppointmentById, getDoctorById } from '@/lib/db-service';
import mongoose from 'mongoose';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid appointment ID' }, { status: 400 });
    }
    
    const appointment = await getAppointmentById(id);

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Get doctor details if needed
    let doctorDetails = null;
    if (appointment.doctorId) {
      doctorDetails = await getDoctorById(appointment.doctorId.toString());
    }

    return NextResponse.json({
      _id: appointment._id,
      doctorId: appointment.doctorId,
      patientName: appointment.patientName,
      patientEmail: appointment.patientEmail,
      patientPhone: appointment.patientPhone,
      date: appointment.date,
      time: appointment.time,
      specialty: appointment.specialty,
      status: appointment.status,
      doctorName: doctorDetails?.name || 'Unknown Doctor'
    });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}