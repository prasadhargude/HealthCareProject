import { NextResponse } from "next/server"
import { updateCartItemQuantity, removeFromCart } from "@/lib/medicine-service"
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

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserId()
    const cartItemId = params.id
    const { quantity } = await request.json()

    if (typeof quantity !== "number" || quantity < 1) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 })
    }

    const updatedItem = await updateCartItemQuantity(userId, cartItemId, quantity)

    if (!updatedItem) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 })
    }

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error("Error updating cart item:", error)
    if (error instanceof Error && error.message === "Not authenticated") {
      return NextResponse.json({ error: "Not authenticated", code: "UNAUTHORIZED" }, { status: 401 })
    }
    return NextResponse.json({ error: "Failed to update cart item" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = await getUserId()
    const cartItemId = params.id

    const success = await removeFromCart(userId, cartItemId)

    if (!success) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing cart item:", error)
    if (error instanceof Error && error.message === "Not authenticated") {
      return NextResponse.json({ error: "Not authenticated", code: "UNAUTHORIZED" }, { status: 401 })
    }
    return NextResponse.json({ error: "Failed to remove cart item" }, { status: 500 })
  }
}