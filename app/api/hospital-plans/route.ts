import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("healthconnect")

    const plans = await db
      .collection("hospitalPlans")
      .find({})
      .toArray()

    return NextResponse.json(plans)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch hospital plans' }, { status: 500 })
  }
}