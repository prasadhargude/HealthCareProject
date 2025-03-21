import { NextResponse } from "next/server"
import { getVideoConsultationById } from "@/lib/db-service"
import { sendSMS } from "@/lib/sms"

export async function POST(req: Request) {
  try {
    const { consultationId } = await req.json()

    if (!consultationId) {
      return NextResponse.json({ error: "Consultation ID is required" }, { status: 400 })
    }

    // Get consultation details
    const consultation = await getVideoConsultationById(consultationId)

    if (!consultation) {
      return NextResponse.json({ error: "Consultation not found" }, { status: 404 })
    }

    // Prepare message
    const message = `Your video consultation is confirmed for ${consultation.date} at ${consultation.time}. Join using this link: ${consultation.roomUrl}`

    // Send SMS
    try {
      const result = await sendSMS(consultation.patientPhone, message)

      if (!result.success) {
        console.error("SMS sending failed:", result.error)
        return NextResponse.json(
          {
            warning: "SMS notification could not be sent",
            details: result.error,
          },
          { status: 200 },
        )
      }
    } catch (error) {
      console.error("Error sending SMS:", error)
      // Continue even if SMS fails
      return NextResponse.json(
        {
          warning: "SMS notification could not be sent",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 200 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "SMS notification sent successfully",
    })
  } catch (error) {
    console.error("Error sending SMS notification:", error)
    return NextResponse.json(
      {
        error: "Failed to send SMS notification",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

