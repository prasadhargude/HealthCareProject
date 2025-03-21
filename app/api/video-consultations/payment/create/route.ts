import { NextResponse } from "next/server"
import { getVideoConsultationById, getDoctorById, updateVideoConsultation } from "@/lib/db-service"
import Razorpay from "razorpay"

export async function POST(req: Request) {
  try {
    const { consultationId } = await req.json()

    if (!consultationId) {
      return NextResponse.json({ error: "Consultation ID is required" }, { status: 400 })
    }

    // Get consultation details
    const consultation = await getVideoConsultationById(consultationId)
    if (!consultation) {
      return NextResponse.json({ error: "Consultation not found" }, { status: 404 })
    }

    // Get doctor details to determine fees
    const doctor = await getDoctorById(consultation.doctorId.toString())
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 })
    }

    const amount = doctor.fees || 499 // Default to 499 if fees not specified

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "",
    })

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount * 100, // Amount in paise
      currency: "INR",
      receipt: `receipt_video_${consultationId}`,
      notes: {
        consultationId: consultationId,
        doctorId: consultation.doctorId.toString(),
        patientName: consultation.patientName,
      },
    })

    // Update consultation with order ID
    await updateVideoConsultation(consultationId, {
      paymentId: order.id,
      paymentStatus: "created",
    })

    return NextResponse.json({
      orderId: order.id,
      amount: amount,
      currency: "INR",
    })
  } catch (error) {
    console.error("Error creating payment order:", error)
    return NextResponse.json(
      {
        error: "Failed to create payment order",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

