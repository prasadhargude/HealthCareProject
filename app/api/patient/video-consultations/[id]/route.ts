import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/api/auth/[...nextauth]/route"
import { getVideoConsultationById, updateVideoConsultationStatus } from "@/lib/appointment-service"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const consultationId = params.id
    const consultation = await getVideoConsultationById(consultationId)

    if (!consultation) {
      return NextResponse.json({ error: "Video consultation not found" }, { status: 404 })
    }

    // Ensure the user can only access their own consultations
    if (session.user.email !== consultation.patientEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    return NextResponse.json(consultation)
  } catch (error) {
    console.error("Error fetching video consultation:", error)
    return NextResponse.json({ error: "Failed to fetch video consultation" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    // Get the user session
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const consultationId = params.id
    const { status } = await request.json()

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    // Get the consultation first to check authorization
    const consultation = await getVideoConsultationById(consultationId)

    if (!consultation) {
      return NextResponse.json({ error: "Video consultation not found" }, { status: 404 })
    }

    // Ensure the user can only update their own consultations
    if (session.user.email !== consultation.patientEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const updatedConsultation = await updateVideoConsultationStatus(consultationId, status)

    return NextResponse.json(updatedConsultation)
  } catch (error) {
    console.error("Error updating video consultation:", error)
    return NextResponse.json({ error: "Failed to update video consultation" }, { status: 500 })
  }
}

