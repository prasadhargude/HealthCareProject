import { NextResponse } from "next/server"
import { getMedicineById } from "@/lib/medicine-service"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const medicine = await getMedicineById(id)

    if (!medicine) {
      return NextResponse.json({ error: "Medicine not found" }, { status: 404 })
    }

    return NextResponse.json(medicine)
  } catch (error) {
    console.error("Error fetching medicine:", error)
    return NextResponse.json({ error: "Failed to fetch medicine" }, { status: 500 })
  }
}

