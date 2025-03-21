import { NextResponse } from "next/server"
import { getVideoConsultationById } from "@/lib/db-service"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json({ error: "Consultation ID is required" }, { status: 400 })
    }

    const consultation = await getVideoConsultationById(id)

    if (!consultation) {
      return NextResponse.json({ error: "Consultation not found" }, { status: 404 })
    }

    return NextResponse.json(consultation)
  } catch (error) {
    console.error("Error fetching consultation:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch consultation",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

