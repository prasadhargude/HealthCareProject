const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function populateAvailableSlots() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('healthconnect');
    const availableSlotsCollection = db.collection('availableSlots');

    // Clear existing slots
    await availableSlotsCollection.deleteMany({});

    const specialties = ['General Physician', 'Pediatrician', 'Dermatologist', 'Orthopedist', 'Cardiologist'];
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days from now

    for (let date = startDate; date <= endDate; date.setDate(date.getDate() + 1)) {
      for (const specialty of specialties) {
        for (let hour = 9; hour < 17; hour++) {
          const time = `${hour.toString().padStart(2, '0')}:00`;
          await availableSlotsCollection.insertOne({
            specialty,
            date: date.toISOString().split('T')[0],
            time,
            isAvailable: true
          });
        }
      }
    }

    console.log('Available slots populated successfully');
  } finally {
    await client.close();
    console.log('Database connection closed');
  }
}

populateAvailableSlots().catch(console.error);