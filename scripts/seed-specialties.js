const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

async function seedSpecialties() {
  try {
    await client.connect();
    const database = client.db('healthconnect');
    const specialties = database.collection('specialties');

    // Clear existing specialties
    await specialties.deleteMany({});

    // Insert new specialties
    const result = await specialties.insertMany([
      { name: 'Cardiology' },
      { name: 'Dermatology' },
      { name: 'Neurology' },
      { name: 'Pediatrics' },
      { name: 'Orthopedics' },
      { name: 'Gynecology' },
      { name: 'Ophthalmology' },
      { name: 'Psychiatry' }
    ]);

    console.log(`${result.insertedCount} specialties were inserted`);
  } finally {
    await client.close();
  }
}

seedSpecialties().catch(console.error);