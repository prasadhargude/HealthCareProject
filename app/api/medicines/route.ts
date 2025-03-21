import { NextResponse } from "next/server"
import { getMedicines, searchMedicines, getMedicinesByCategory } from "@/lib/medicine-service"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const category = searchParams.get("category")

    let medicines

    if (search) {
      medicines = await searchMedicines(search)
    } else if (category) {
      medicines = await getMedicinesByCategory(category)
    } else {
      medicines = await getMedicines()
    }

    return NextResponse.json(medicines)
  } catch (error) {
    console.error("Error fetching medicines:", error)
    return NextResponse.json({ error: "Failed to fetch medicines" }, { status: 500 })
  }
}

