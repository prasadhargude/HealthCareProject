import { NextResponse } from "next/server"
import { getAuthToken, getDiagnosis, mockSpecializations } from "@/lib/apiMedic"
import type { ApiMedicDiagnosis } from "@/lib/apiMedic"

export async function POST(request: Request) {
  try {
    const { symptoms, gender, yearOfBirth } = await request.json()

    if (!Array.isArray(symptoms) || symptoms.length === 0) {
      return NextResponse.json({ message: "Invalid or missing symptoms array" }, { status: 400 })
    }

    // Try to get data from ApiMedic
    const token = await getAuthToken()

    if (token) {
      try {
        // If we have a token, try to get diagnosis from the API
        const diagnosisResults = await getDiagnosis(token, symptoms, gender, yearOfBirth)
        return NextResponse.json(diagnosisResults)
      } catch (apiError) {
        console.error("Error fetching diagnosis from API:", apiError)
        // Fall back to mock data if API call fails
        return useMockDiagnosis(symptoms)
      }
    } else {
      // If no token, use mock data
      console.log("Using mock diagnosis data (no API token)")
      return useMockDiagnosis(symptoms)
    }
  } catch (error) {
    console.error("Error processing diagnosis:", error)
    return NextResponse.json({ message: "Failed to process diagnosis" }, { status: 500 })
  }
}

function useMockDiagnosis(symptoms: number[]) {
  // Create mock diagnosis results based on the symptoms
  const mockDiagnosis: ApiMedicDiagnosis[] = []

  // Find the most relevant specialization based on symptoms
  let specialization = mockSpecializations.default
  for (const symptomId of symptoms) {
    const symptomIdStr = symptomId.toString()
    if (mockSpecializations[symptomIdStr]) {
      specialization = mockSpecializations[symptomIdStr]
      break
    }
  }

  // Create mock diagnosis results
  for (const condition of specialization.conditions) {
    mockDiagnosis.push({
      Issue: {
        ID: Math.floor(Math.random() * 1000),
        Name: condition,
        Accuracy: 70 + Math.floor(Math.random() * 20), // Random accuracy between 70-90%
        IcdName: condition,
        ProfName: condition,
      },
      Specialisation: [
        {
          ID: Math.floor(Math.random() * 100),
          Name: specialization.name,
          SpecialistID: Math.floor(Math.random() * 10),
        },
      ],
    })
  }

  return NextResponse.json(mockDiagnosis)
}

