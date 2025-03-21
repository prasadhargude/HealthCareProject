import { NextResponse } from "next/server"
import { createAppointment, bookTimeslot } from "@/lib/db-service"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    const requiredFields = ["doctorId", "patientName", "patientEmail", "patientPhone", "date", "time", "timeslotId"]

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 })
      }
    }

    // Create appointment
    const appointmentData = {
      doctorId: body.doctorId,
      patientName: body.patientName,
      patientEmail: body.patientEmail,
      patientPhone: body.patientPhone,
      date: body.date,
      time: body.time,
      specialty: body.specialty,
      patientNotes: body.patientNotes || "",
      status: "pending",
      createdAt: new Date(),
    }

    const appointment = await createAppointment(appointmentData)

    // Mark timeslot as booked
    await bookTimeslot(body.timeslotId)

    return NextResponse.json({
      message: "Appointment created successfully",
      appointmentId: appointment._id,
    })
  } catch (error) {
    console.error("Error creating appointment:", error)
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 })
  }
}

