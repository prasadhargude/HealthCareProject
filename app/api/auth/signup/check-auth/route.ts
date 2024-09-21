import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb'; // Import ObjectId

export async function GET() {
  try {
    const token = cookies().get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as { id: string; email: string; role: string };

    const client = await clientPromise;
    const db = client.db('healthconnect');

    const collection = decoded.role === 'doctor' ? 'doctors' : 'users';
    
    // Convert decoded.id (string) to ObjectId
    const user = await db.collection(collection).findOne({ _id: new ObjectId(decoded.id) });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { password, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Check auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
