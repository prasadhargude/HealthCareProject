import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/api/auth/[...nextauth]/route"
import { getPatientVideoConsultations } from "@/lib/appointment-service"

export async function GET() {
  try {
    // Get the user session
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get video consultations using email
    const userEmail = session.user.email

    if (!userEmail) {
      return NextResponse.json({ error: "User email not available" }, { status: 400 })
    }

    const consultations = await getPatientVideoConsultations(userEmail)

    return NextResponse.json(consultations)
  } catch (error) {
    console.error("Error fetching video consultations:", error)
    return NextResponse.json({ error: "Failed to fetch video consultations" }, { status: 500 })
  }
}

