import { NextResponse } from "next/server"
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
    const { amount } = await request.json()

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Valid amount is required" }, { status: 400 })
    }

    // Check if Razorpay keys are available
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET

    if (!razorpayKeyId || !razorpayKeySecret) {
      console.error("Razorpay API keys are missing")
      return NextResponse.json({ error: "Payment gateway configuration error" }, { status: 500 })
    }

    // Dynamically import Razorpay to avoid server-side issues
    const Razorpay = (await import('razorpay')).default

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret,
    })

    // Create a shorter receipt ID (must be <= 40 characters)
    // Use a shorter prefix and truncate the userId if needed
    const shortUserId = userId.substring(0, 8) // Take first 8 chars of userId
    const timestamp = Date.now().toString().substring(6) // Take last 7 digits of timestamp
    const receiptId = `rcpt_${shortUserId}_${timestamp}`

    // Create order
    const orderOptions = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: "INR",
      receipt: receiptId,
    }

    console.log("Creating Razorpay order with options:", orderOptions)

    const order = await razorpay.orders.create(orderOptions)

    console.log("Razorpay order created:", order)

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    })
  } catch (error) {
    console.error("Error creating payment order:", error)
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
      
      if (error.message === "Not authenticated") {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
      }
      
      // Check for Razorpay specific errors
      if (error.message.includes("razorpay")) {
        return NextResponse.json({ 
          error: "Payment gateway error", 
          details: error.message 
        }, { status: 500 })
      }
    }
    
    return NextResponse.json({ 
      error: "Failed to create payment order",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 })
  }
}