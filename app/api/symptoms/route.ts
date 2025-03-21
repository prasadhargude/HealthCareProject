import { NextResponse } from "next/server"
import { getAuthToken, getSymptoms, mockSymptoms } from "@/lib/apiMedic"

export async function GET() {
  try {
    // Try to get data from ApiMedic
    const token = await getAuthToken()

    if (token) {
      try {
        // If we have a token, try to get symptoms from the API
        const symptoms = await getSymptoms(token)
        return NextResponse.json(symptoms)
      } catch (apiError) {
        console.error("Error fetching symptoms from API:", apiError)
        // Fall back to mock data if API call fails
        return NextResponse.json(mockSymptoms)
      }
    } else {
      // If no token, use mock data
      console.log("Using mock symptoms data (no API token)")
      return NextResponse.json(mockSymptoms)
    }
  } catch (error) {
    console.error("Error in symptoms endpoint:", error)
    // Return mock data as a fallback
    return NextResponse.json(mockSymptoms)
  }
}

