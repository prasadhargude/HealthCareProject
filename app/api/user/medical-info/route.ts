import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/api/auth/[...nextauth]/route"
import { updateUserById } from "@/lib/db-utils"

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    await updateUserById(session.user.id, data)

    return NextResponse.json({ success: true, message: "Medical information updated successfully" })
  } catch (error) {
    console.error("Error updating medical information:", error)
    return NextResponse.json({ error: "Failed to update medical information" }, { status: 500 })
  }
}

