import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/api/auth/[...nextauth]/route"
import { getVideoConsultationByAppointmentId, getVideoConsultationByMeetingId } from "@/lib/appointment-service"

export async function GET(request: Request) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const appointmentId = searchParams.get("appointmentId")
    const meetingId = searchParams.get("meetingId")

    if (!appointmentId && !meetingId) {
      return NextResponse.json({ error: "Either appointmentId or meetingId is required" }, { status: 400 })
    }

    let consultation

    if (appointmentId) {
      consultation = await getVideoConsultationByAppointmentId(appointmentId)
    } else if (meetingId) {
      consultation = await getVideoConsultationByMeetingId(meetingId)
    }

    if (!consultation) {
      return NextResponse.json({ error: "Consultation not found" }, { status: 404 })
    }

    // Ensure the user can only access their own consultations
    if (session.user.email !== consultation.patientEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json(consultation)
  } catch (error) {
    console.error("Error fetching consultation:", error)
    return NextResponse.json({ error: "Failed to fetch consultation" }, { status: 500 })
  }
}

