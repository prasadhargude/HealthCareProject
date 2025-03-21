import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/api/auth/[...nextauth]/route"
import { createOrder } from "@/lib/medicine-service"

interface IOrder {
  userId: string
  items: { medicineId: string; name: string; price: number; quantity: number }[]
  totalAmount: number
  shippingAddress: {
    name: string
    street: string
    city: string
    state: string
    zipCode: string
  }
  status: string // ✅ Ensure 'status' is defined in IOrder
  paymentStatus: string
}

// Helper to get user ID from session
async function getUserId() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }
  return session.user.id
}
export async function POST(request: Request) {
    try {
      const userId = await getUserId()
      const orderData = await request.json()
  
      // Validate order data
      if (!orderData.items || !orderData.shippingDetails) {
        return NextResponse.json({ error: "Invalid order data" }, { status: 400 })
      }
  
      // Create the order - map shippingDetails to shippingAddress
      const orderId = await createOrder({
        userId,
        items: orderData.items.map((item: { medicineId: string; name?: string; price: number; quantity: number }) => ({
          medicineId: item.medicineId,
          name: item.name || "",
          price: item.price,
          quantity: item.quantity,
        })),
        totalAmount: orderData.total,
        shippingAddress: {
          name: orderData.shippingDetails.name,
          street: orderData.shippingDetails.address,
          city: orderData.shippingDetails.city,
          state: orderData.shippingDetails.state,
          zipCode: orderData.shippingDetails.pincode,
        },
        orderStatus: "pending", // ✅ Use 'orderStatus' instead of 'status'
        paymentStatus: "pending",
      })
  
      return NextResponse.json({ success: true, orderId })
    } catch (error) {
      console.error("Error creating order:", error)
      if (error instanceof Error && error.message === "Not authenticated") {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
      }
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
    }
  }
  