import { NextResponse } from "next/server"
import crypto from "crypto"
import { updateOrderPayment, clearCart } from "@/lib/medicine-service"
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

export async function POST(request: Request) {
  try {
    const userId = await getUserId()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = await request.json()

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing required payment details" }, { status: 400 })
    }

    // Check if Razorpay key secret is available
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET
    if (!razorpayKeySecret) {
      console.error("Razorpay key secret is missing")
      return NextResponse.json({ error: "Payment gateway configuration error" }, { status: 500 })
    }

    // Verify the payment signature
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac("sha256", razorpayKeySecret)
      .update(body)
      .digest("hex")

    const isAuthentic = expectedSignature === razorpay_signature

    if (!isAuthentic) {
      console.error("Payment signature verification failed")
      console.error("Expected:", expectedSignature)
      console.error("Received:", razorpay_signature)
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 })
    }

    console.log("Payment verified successfully")

    // Update order with payment details
    if (orderId) {
      try {
        await updateOrderPayment(orderId, razorpay_payment_id, razorpay_order_id, "completed")
        console.log("Order payment updated successfully:", orderId)

        // Clear the cart after successful payment
        await clearCart(userId)
        console.log("Cart cleared successfully for user:", userId)
      } catch (updateError) {
        console.error("Error updating order payment:", updateError)
        // Continue with the success response even if updating the order fails
        // This prevents double-charging the customer
      }
    } else {
      console.warn("No orderId provided, skipping order update")
    }

    return NextResponse.json({
      success: true,
      orderId,
      paymentId: razorpay_payment_id,
    })
  } catch (error) {
    console.error("Error verifying payment:", error)
    
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
      
      if (error.message === "Not authenticated") {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
      }
    }
    
    return NextResponse.json({ 
      error: "Failed to verify payment",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}