import { NextResponse } from "next/server"
import { getCartItems, addToCart, clearCart } from "@/lib/medicine-service"
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
    const cartItems = await getCartItems(userId)

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + item.medicine.price * item.quantity
    }, 0)

    const shipping = cartItems.length > 0 ? 5.99 : 0
    const total = subtotal + shipping

    return NextResponse.json({
      items: cartItems,
      subtotal,
      shipping,
      total,
    })
  } catch (error) {
    console.error("Error fetching cart:", error)
    if (error instanceof Error && error.message === "Not authenticated") {
      return NextResponse.json({ error: "Not authenticated", code: "UNAUTHORIZED" }, { status: 401 })
    }
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId()
    const { medicineId, quantity } = await request.json()

    if (!medicineId) {
      return NextResponse.json({ error: "Medicine ID is required" }, { status: 400 })
    }

    const cartItem = await addToCart(userId, medicineId, quantity || 1)
    return NextResponse.json(cartItem)
  } catch (error) {
    console.error("Error adding to cart:", error)
    if (error instanceof Error && error.message === "Not authenticated") {
      return NextResponse.json({ error: "Not authenticated", code: "UNAUTHORIZED" }, { status: 401 })
    }
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const userId = await getUserId()
    await clearCart(userId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error clearing cart:", error)
    if (error instanceof Error && error.message === "Not authenticated") {
      return NextResponse.json({ error: "Not authenticated", code: "UNAUTHORIZED" }, { status: 401 })
    }
    return NextResponse.json({ error: "Failed to clear cart" }, { status: 500 })
  }
}