import { NextResponse } from 'next/server';
import { getAppointmentById, getDoctorById, createPayment, updateAppointment } from '@/lib/db-service';
import mongoose from 'mongoose';

// You'll need to install the Razorpay SDK
// npm install razorpay
import Razorpay from 'razorpay';

export async function POST(req: Request) {
  try {
    const { appointmentId } = await req.json();
    
    if (!appointmentId || !mongoose.Types.ObjectId.isValid(appointmentId)) {
      return NextResponse.json({ error: 'Invalid appointment ID' }, { status: 400 });
    }
    
    // Get appointment details
    const appointment = await getAppointmentById(appointmentId);
    
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }
    
    // Get doctor details to determine fees
    const doctor = await getDoctorById(appointment.doctorId.toString());
    const amount = doctor?.fees || 199; // Default to 199 if fees not specified
    
    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    });
    
    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      receipt: `receipt_${appointmentId}`,
      notes: {
        appointmentId: appointmentId,
        doctorId: appointment.doctorId.toString(),
        patientName: appointment.patientName,
      },
    });
    
    // Save payment details in database
    await createPayment({
      appointmentId: new mongoose.Types.ObjectId(appointmentId),
      orderId: order.id,
      amount: amount,
      currency: 'INR',
      status: 'created',
      createdAt: new Date(),
    });
    
    // Update appointment with order ID
    await updateAppointment(appointmentId, {
      paymentOrderId: order.id
    });
    
    return NextResponse.json({
      orderId: order.id,
      amount: amount,
      currency: 'INR',
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
  }
}