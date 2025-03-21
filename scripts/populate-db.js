import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function populateDatabase() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('healthconnect');

    // Populate doctors
    const doctors = [
      { name: 'Dr. John Doe', specialty: 'Cardiology', imageUrl: 'https://example.com/doctor1.jpg' },
      { name: 'Dr. Jane Smith', specialty: 'Pediatrics', imageUrl: 'https://example.com/doctor2.jpg' },
      { name: 'Dr. Mike Johnson', specialty: 'Dermatology', imageUrl: 'https://example.com/doctor3.jpg' },
    ];
    await db.collection('doctors').insertMany(doctors);
    console.log('Doctors added successfully');

    // Populate available slots
    const availableSlots = [];
    const specialties = ['Cardiology', 'Pediatrics', 'Dermatology'];
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
      for (const specialty of specialties) {
        for (let hour = 9; hour < 17; hour++) {
          availableSlots.push({
            specialty,
            date: date.toISOString().split('T')[0],
            time: `${hour.toString().padStart(2, '0')}:00`,
            isAvailable: true
          });
        }
      }
    }

    await db.collection('availableSlots').insertMany(availableSlots);
    console.log('Available slots added successfully');

  } finally {
    await client.close();
    console.log('Database connection closed');
  }
}

populateDatabase().catch(console.error);