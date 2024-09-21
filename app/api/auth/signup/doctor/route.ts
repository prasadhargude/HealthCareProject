import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, gender, username, mobileNumber, address, password, specialization, licenseNumber, experience } = await req.json();

    const client = await clientPromise;
    const db = client.db('healthconnect');

    // Check if doctor already exists
    const existingDoctor = await db.collection('doctors').findOne({ email });
    if (existingDoctor) {
      return NextResponse.json({ error: 'Doctor already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new doctor
    const result = await db.collection('doctors').insertOne({
      firstName,
      lastName,
      email,
      gender,
      username,
      mobileNumber,
      address,
      password: hashedPassword,
      specialization,
      licenseNumber,
      experience,
      role: 'doctor',
      createdAt: new Date(),
    });

    return NextResponse.json({ message: 'Doctor created successfully', doctorId: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error('Doctor signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}