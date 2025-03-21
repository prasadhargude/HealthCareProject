import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symptoms = searchParams.get('symptoms')

  if (!symptoms) {
    return NextResponse.json({ error: 'Symptoms are required' }, { status: 400 })
  }

  try {
    const client = await clientPromise
    const db = client.db('healthconnect')

    const specialties = await db.collection('specialties').aggregate([
      {
        $match: {
          keywords: {
            $regex: symptoms,
            $options: 'i'
          }
        }
      },
      {
        $project: {
          name: 1,
          price: 1,
          score: { $size: { $setIntersection: ['$keywords', symptoms.split(' ')] } }
        }
      },
      { $sort: { score: -1 } },
      { $limit: 3 }
    ]).toArray()

    return NextResponse.json(specialties)
  } catch (error) {
    console.error('Error suggesting specialties:', error)
    return NextResponse.json({ error: 'Failed to suggest specialties' }, { status: 500 })
  }
}