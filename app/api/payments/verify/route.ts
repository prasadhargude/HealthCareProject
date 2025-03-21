import { NextResponse } from "next/server"
import { updatePaymentStatus, updateAppointment } from "@/lib/db-service"
import crypto from "crypto"

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, appointmentId } = await req.json()

    console.log("Payment verification request received:", {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      appointmentId,
    })

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !appointmentId) {
      console.error("Missing required parameters")
      return NextResponse.json(
        {
          error: "Missing required payment verification parameters",
        },
        { status: 400 },
      )
    }

    // Verify the payment signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(text)
      .digest("hex")

    console.log("Signature verification:", {
      received: razorpay_signature,
      generated: generatedSignature,
      match: generatedSignature === razorpay_signature,
    })

    if (generatedSignature !== razorpay_signature) {
      console.error("Invalid payment signature")
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 })
    }

    // Update payment status in database
    try {
      await updatePaymentStatus(razorpay_order_id, "completed")
    } catch (dbError) {
      console.error("Error updating payment status:", dbError)
      // Continue with appointment update even if payment update fails
    }

    // Update appointment status
    try {
      await updateAppointment(appointmentId, {
        status: "confirmed",
        paymentId: razorpay_payment_id,
        paymentStatus: "completed",
        paymentOrderId: razorpay_order_id
      })
    } catch (dbError) {
      console.error("Error updating appointment:", dbError)
      return NextResponse.json(
        {
          error: "Payment verified but failed to update appointment",
          details: dbError instanceof Error ? dbError.message : "Unknown error",
        },
        { status: 500 },
      )
    }

    console.log("Payment verification successful")

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
    })
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json(
      {
        error: "Failed to verify payment",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}