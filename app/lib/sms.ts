import twilio from "twilio"

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

export async function sendSMS(to: string, body: string) {
  try {
    // Format phone number to E.164 format
    let formattedNumber = to.replace(/\D/g, "")

    // Add country code if not present (assuming India +91)
    if (!formattedNumber.startsWith("91") && !formattedNumber.startsWith("+91")) {
      formattedNumber = `+91${formattedNumber}`
    } else if (formattedNumber.startsWith("91")) {
      formattedNumber = `+${formattedNumber}`
    }

    console.log(`Sending SMS to ${formattedNumber}: ${body}`)

    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedNumber,
    })

    console.log("SMS sent successfully:", message.sid)
    return { success: true, messageId: message.sid }
  } catch (error) {
    console.error("Error sending SMS:", error)
    return { success: false, error }
  }
}

