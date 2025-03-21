import { NextResponse } from "next/server"
import { createOrder, getOrdersByUser } from "@/lib/medicine-service"
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
    const orders = await getOrdersByUser(userId)
    return NextResponse.json(orders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    if (error instanceof Error && error.message === "Not authenticated") {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId()
    const { items, totalAmount, shippingAddress, prescriptionImage } = await request.json()

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Order must contain at least one item" }, { status: 400 })
    }

    if (!shippingAddress) {
      return NextResponse.json({ error: "Shipping address is required" }, { status: 400 })
    }

    const orderData = {
      userId,
      items,
      totalAmount,
      shippingAddress,
      prescriptionImage,
      paymentStatus: "pending",
      orderStatus: "processing",
      createdAt: new Date(),
    }

    const order = await createOrder(orderData)

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error creating order:", error)
    if (error instanceof Error && error.message === "Not authenticated") {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}

