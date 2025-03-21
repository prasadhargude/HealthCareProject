import { NextResponse } from "next/server"
import { getUserAddresses, addUserAddress } from "@/lib/medicine-service"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/api/auth/[...nextauth]/route"

// Helper to get user ID from session
async function getUserId() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }
  return session.user.id
}

export async function GET() {
  try {
    const userId = await getUserId()
    const addresses = await getUserAddresses(userId)
    return NextResponse.json(addresses)
  } catch (error) {
    console.error("Error fetching addresses:", error)
    if (error instanceof Error && error.message === "Not authenticated") {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId()
    const addressData = await request.json()

    if (!addressData.name || !addressData.street || !addressData.city || !addressData.state || !addressData.zipCode) {
      return NextResponse.json({ error: "All address fields are required" }, { status: 400 })
    }

    const address = await addUserAddress(userId, addressData)

    if (!address) {
      return NextResponse.json({ error: "Failed to add address" }, { status: 500 })
    }

    return NextResponse.json(address)
  } catch (error) {
    console.error("Error adding address:", error)
    if (error instanceof Error && error.message === "Not authenticated") {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }
    return NextResponse.json({ error: "Failed to add address" }, { status: 500 })
  }
}

