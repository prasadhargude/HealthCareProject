import { NextResponse } from "next/server"

const specialties = [
  { _id: "1", name: "General Practitioner", icon: "👨‍⚕️" },
  { _id: "2", name: "Neurologist", icon: "🧠" },
  { _id: "3", name: "Pulmonologist", icon: "🫁" },
  { _id: "4", name: "Cardiologist", icon: "❤️" },
  { _id: "5", name: "Gastroenterologist", icon: "🫃" },
  { _id: "6", name: "Dermatologist", icon: "🧴" },
  { _id: "7", name: "Rheumatologist", icon: "🦴" },
  { _id: "8", name: "Pediatrician", icon: "👶" },
  { _id: "9", name: "Psychiatrist", icon: "🧠" },
  { _id: "10", name: "Ophthalmologist", icon: "👁️" },
  { _id: "11", name: "Gynecologist", icon: "👩" },
  { _id: "12", name: "Urologist", icon: "🚽" },
]

export async function GET() {
  return NextResponse.json(specialties)
}

