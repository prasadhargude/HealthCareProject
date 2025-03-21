import Razorpay from "razorpay"

// Initialize Razorpay with your key_id and key_secret
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
})

export async function createOrder(options: {
  amount: number
  currency: string
  receipt: string
  notes?: Record<string, string>
}) {
  try {
    const order = await razorpay.orders.create({
      amount: options.amount * 100, // Razorpay expects amount in paise
      currency: options.currency,
      receipt: options.receipt,
      notes: options.notes,
    })

    return order
  } catch (error) {
    console.error("Error creating Razorpay order:", error)
    throw error
  }
}

export async function verifyPayment(options: {
  orderId: string
  paymentId: string
  signature: string
}) {
  const { orderId, paymentId, signature } = options

  // Create a signature using the HMAC SHA256 algorithm
  const crypto = require("crypto")
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
    .update(`${orderId}|${paymentId}`)
    .digest("hex")

  // Compare the generated signature with the signature received from Razorpay
  if (generatedSignature === signature) {
    return true
  }

  return false
}

export default razorpay

