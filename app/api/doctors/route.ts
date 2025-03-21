import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const specialty = url.searchParams.get('specialty')

    // Ensure the database connection is established
    const mongoose = await connectToDatabase()
    if (!mongoose.connection || !mongoose.connection.db) {
      throw new Error('Database connection failed') // ✅ Handle potential undefined `db`
    }

    const db = mongoose.connection.db // ✅ Mongoose's native database object
    const collection = db.collection('doctors') // ✅ Correct way to access a collection

    let query = {}
    if (specialty) {
      query = { specialty }
    }

    const doctors = await collection.find(query).limit(6).toArray() // ✅ Now it works!

    return NextResponse.json(doctors, { status: 200 })
  } catch (error) {
    console.error('Error fetching doctors:', error)
    return NextResponse.json({ error: 'Failed to fetch doctors' }, { status: 500 })
  }
}
