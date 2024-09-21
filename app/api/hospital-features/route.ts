import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("healthconnect")

    const features = await db
      .collection("hospitalFeatures")
      .find({})
      .toArray()

    return NextResponse.json(features.map(feature => feature.name))
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch hospital features' }, { status: 500 })
  }
}