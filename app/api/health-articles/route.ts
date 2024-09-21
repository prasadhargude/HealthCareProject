import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("healthconnect")

    const articles = await db
      .collection("articles")
      .find({})
      .sort({ date: -1 })
      .toArray()

    return NextResponse.json(articles)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 })
  }
}