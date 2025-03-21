// This is a utility file for interacting with the ApiMedic API

const API_AUTH_URL = "https://authservice.priaid.ch/login"
const API_HEALTH_URL = "https://healthservice.priaid.ch"

// Interface for ApiMedic symptom
export interface ApiMedicSymptom {
  ID: number
  Name: string
}

// Interface for ApiMedic diagnosis
export interface ApiMedicDiagnosis {
  Issue: {
    ID: number
    Name: string
    Accuracy: number
    IcdName: string
    ProfName: string
  }
  Specialisation: {
    ID: number
    Name: string
    SpecialistID: number
  }[]
}

/**
 * Get authentication token from ApiMedic
 */
export async function getAuthToken(): Promise<string | null> {
  const username = process.env.APIMEDIC_USERNAME
  const password = process.env.APIMEDIC_PASSWORD

  if (!username || !password) {
    console.warn("ApiMedic credentials are not set in environment variables")
    return null
  }

  const encodedCredentials = Buffer.from(`${username}:${password}`).toString("base64")

  try {
    const response = await fetch(API_AUTH_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${encodedCredentials}`,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data.Token
  } catch (error) {
    console.error("Error getting the token:", error)
    return null
  }
}

/**
 * Get list of symptoms from ApiMedic
 */
export async function getSymptoms(token: string): Promise<ApiMedicSymptom[]> {
  try {
    const response = await fetch(`${API_HEALTH_URL}/symptoms?language=en-gb`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching symptoms:", error)
    throw error
  }
}

/**
 * Get diagnosis based on symptoms from ApiMedic
 */
export async function getDiagnosis(
  token: string,
  symptoms: number[],
  gender: string,
  yearOfBirth: number,
): Promise<ApiMedicDiagnosis[]> {
  try {
    // Build query parameters
    const params = new URLSearchParams({
      symptoms: JSON.stringify(symptoms),
      gender: gender,
      year_of_birth: yearOfBirth.toString(),
      language: "en-gb",
    })

    const response = await fetch(`${API_HEALTH_URL}/diagnosis?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching diagnosis:", error)
    throw error
  }
}

// Mock data for fallback when API is unavailable
export const mockSymptoms: ApiMedicSymptom[] = [
  { ID: 10, Name: "Abdominal pain" },
  { ID: 238, Name: "Anxiety" },
  { ID: 104, Name: "Back pain" },
  { ID: 75, Name: "Chest pain" },
  { ID: 15, Name: "Cough" },
  { ID: 207, Name: "Depression" },
  { ID: 244, Name: "Diarrhea" },
  { ID: 273, Name: "Dizziness" },
  { ID: 87, Name: "Fatigue" },
  { ID: 98, Name: "Fever" },
  { ID: 95, Name: "Headache" },
  { ID: 40, Name: "Heartburn" },
  { ID: 73, Name: "High blood pressure" },
  { ID: 128, Name: "Insomnia" },
  { ID: 133, Name: "Joint pain" },
  { ID: 45, Name: "Nausea" },
  { ID: 122, Name: "Rash" },
  { ID: 124, Name: "Runny nose" },
  { ID: 31, Name: "Shortness of breath" },
  { ID: 29, Name: "Sore throat" },
  { ID: 14, Name: "Vomiting" },
  { ID: 52, Name: "Weight loss" },
]

// Mock specializations for different symptom combinations
export const mockSpecializations: Record<string, { name: string; conditions: string[] }> = {
  // Headache related
  "95": { name: "Neurologist", conditions: ["Migraine", "Tension headache"] },

  // Chest pain related
  "75": { name: "Cardiologist", conditions: ["Angina", "Coronary artery disease"] },

  // Cough related
  "15": { name: "Pulmonologist", conditions: ["Bronchitis", "Asthma"] },

  // Abdominal pain related
  "10": { name: "Gastroenterologist", conditions: ["Gastritis", "Irritable bowel syndrome"] },

  // Skin related
  "122": { name: "Dermatologist", conditions: ["Eczema", "Psoriasis"] },

  // Runny nose related
  "124": { name: "Dermatologist", conditions: ["Eczema", "Psoriasis"] },

  // Joint pain related
  "133": { name: "Rheumatologist", conditions: ["Arthritis", "Rheumatoid arthritis"] },

  // Mental health related
  "238": { name: "Psychiatrist", conditions: ["Anxiety disorder", "Panic attacks"] },
  "207": { name: "Psychiatrist", conditions: ["Major depressive disorder", "Dysthymia"] },

  // Default
  default: { name: "General Practitioner", conditions: ["General health assessment"] },
}

