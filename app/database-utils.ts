// app/database-utils.ts

import { MongoClient, Db, ObjectId } from 'mongodb';

// Ensure MongoDB URI is available
if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME || 'healthconnect';

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  var _mongoClientPromise: Promise<MongoClient>;
}

// Prevent multiple connections in development
if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function connectToDatabase(): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}

export interface Specialty {
  _id: string;
  name: string;
}

export interface Appointment {
  _id: ObjectId;
  specialty: string;
  date: string;
  time: string;
  createdAt: Date;
}
export interface AvailableSlot {
  _id: string; // or ObjectId if you want to use MongoDB's ObjectId
  specialty: string;
  date: string;
  time: string;
  isBooked: boolean;
}


export async function getSpecialties(): Promise<Specialty[]> {
  try {
    const db = await connectToDatabase();
    const specialtiesCollection = db.collection<Specialty>('specialties');
    const specialties = await specialtiesCollection.find({}).toArray();
    return specialties;
  } catch (error) {
    console.error('Error fetching specialties:', error);
    throw new Error('Failed to fetch specialties');
  }
}

export async function getAvailableSlots(specialty: string, date: string): Promise<AvailableSlot[]> {
  try {
    const db = await connectToDatabase();
    const slots = await db.collection<AvailableSlot>('availableSlots').find({
      specialty,
      date,
      isBooked: false,
    }).toArray();
    return slots;
  } catch (error) {
    console.error('Error fetching available slots:', error);
    throw new Error('Failed to fetch available slots');
  }
}
export async function bookAppointment(specialty: string, date: string, time: string, patientId: string) {
  try {
    const db = await connectToDatabase();

    // Update the available slot to mark it as booked
    const updateResult = await db.collection('availableSlots').updateOne(
      { specialty, date, time },
      { $set: { isBooked: true } }
    );

    if (updateResult.modifiedCount === 0) {
      throw new Error('No available slot found to book');
    }

    // Insert a new appointment in the 'appointments' collection
    const appointmentResult = await db.collection('appointments').insertOne({
      specialty,
      date,
      time,
      patientId, // Include patientId here
      createdAt: new Date(),
    });

    return appointmentResult.insertedId;
  } catch (error) {
    console.error('Error booking appointment:', error);
    throw new Error('Failed to book appointment');
  }
}


export async function getAppointmentDetails(appointmentId: string): Promise<Appointment | null> {
  try {
    const db = await connectToDatabase();
    const appointment = await db.collection<Appointment>('appointments').findOne({ _id: new ObjectId(appointmentId) });
    return appointment;
  } catch (error) {
    console.error('Error fetching appointment details:', error);
    throw new Error('Failed to fetch appointment details');
  }
}
