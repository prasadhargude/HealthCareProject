import { NextResponse } from "next/server"
import { createVideoConsultation, createAppointment, getDoctorById } from "@/lib/db-service"
import { createMeeting, generateMeetingLink } from "@/lib/videosdk"
import { Types } from "mongoose"

export async function POST(req: Request) {
  try {
    const { doctorId, patientId, patientName, patientEmail, patientPhone, date, time, specialty, symptoms, notes } =
      await req.json()

    console.log("📝 Received request data:", {
      doctorId,
      patientName,
      patientEmail,
      date,
      time,
      specialty,
    })

    if (!doctorId) {
      return NextResponse.json({ error: "Doctor ID is required" }, { status: 400 })
    }

    // Validate doctorId is a valid ObjectId
    if (!Types.ObjectId.isValid(doctorId)) {
      return NextResponse.json({ error: "Invalid Doctor ID format" }, { status: 400 })
    }

    // Get doctor details
    console.log("🔍 Fetching doctor details for ID:", doctorId)
    const doctor = await getDoctorById(doctorId)
    console.log("✅ Doctor fetched:", doctor ? "Found" : "Not found")

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 })
    }

    // Create a meeting using VideoSDK
    let meetingId, roomUrl
    try {
      console.log("🔄 Creating VideoSDK meeting...")
      meetingId = await createMeeting()
      roomUrl = generateMeetingLink(meetingId)
      console.log("✅ Meeting created:", { meetingId, roomUrl })
    } catch (err) {
      console.error("❌ Error creating VideoSDK meeting:", err)
      return NextResponse.json({ error: "Failed to create video meeting" }, { status: 500 })
    }

    // Create an appointment record
    console.log("🔄 Creating appointment record...")
    const appointmentData = {
      doctorId: new Types.ObjectId(doctorId),
      patientId: patientId ? new Types.ObjectId(patientId) : undefined,
      patientName,
      patientEmail,
      patientPhone,
      date,
      time,
      specialty,
      status: "pending",
      symptoms,
      description: notes,
      createdAt: new Date(),
      doctorName: doctor.name,
    }

    let appointment
    try {
      appointment = await createAppointment(appointmentData)
      console.log("✅ Appointment created:", appointment._id)
    } catch (err) {
      console.error("❌ Error creating appointment:", err)
      return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 })
    }

    // Create a video consultation record
    console.log("🔄 Creating video consultation record...")
    const consultationData = {
      appointmentId: new Types.ObjectId(appointment._id.toString()),
      meetingId,
      roomUrl,
      doctorId: new Types.ObjectId(doctorId),
      patientId: patientId ? new Types.ObjectId(patientId) : undefined,
      patientName,
      patientEmail,
      patientPhone,
      date,
      time,
      specialty,
      status: "scheduled",
      symptoms,
      notes,
      createdAt: new Date(),
      doctorName: doctor.name,
    }

    let consultation
    try {
      consultation = await createVideoConsultation(consultationData)
      console.log("✅ Video consultation created:", consultation._id)
    } catch (err) {
      console.error("❌ Error creating video consultation:", err)
      return NextResponse.json({ error: "Failed to create video consultation" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      consultationId: consultation._id,
      appointmentId: appointment._id,
    })
  } catch (error) {
    console.error("❌ Error creating video consultation:", error)

    return NextResponse.json(
      {
        error: "Failed to create video consultation",
        details: error instanceof Error ? error.stack : JSON.stringify(error),
      },
      { status: 500 },
    )
  }
}

