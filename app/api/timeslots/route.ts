import { NextResponse } from "next/server"
import { getAvailableTimeslots } from "@/lib/db-service"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const doctorId = searchParams.get("doctorId")
    const date = searchParams.get("date")

    if (!doctorId || !date) {
      return NextResponse.json({ error: "Doctor ID and date are required" }, { status: 400 })
    }

    const timeslots = await getAvailableTimeslots(doctorId, date)

    return NextResponse.json(timeslots)
  } catch (error) {
    console.error("Error fetching timeslots:", error)
    return NextResponse.json({ error: "Failed to fetch timeslots" }, { status: 500 })
  }
}

