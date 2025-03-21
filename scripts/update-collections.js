const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function updateCollections() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('healthconnect');

    // Update availableSlots collection
    const availableSlotsCollection = db.collection('availableSlots');
    
    // Add isAvailable field to all documents if it doesn't exist
    await availableSlotsCollection.updateMany(
      { isAvailable: { $exists: false } },
      { $set: { isAvailable: true } }
    );

    console.log('Updated availableSlots collection');

    // Update appointments collection
    const appointmentsCollection = db.collection('appointments');

    // Add new fields to all documents if they don't exist
    await appointmentsCollection.updateMany(
      {},
      {
        $set: {
          patientName: 'Unknown',
          patientPhone: 'Unknown',
          patientNotes: '',
          status: 'Scheduled',
          createdAt: new Date()
        }
      },
      { upsert: false }
    );

    console.log('Updated appointments collection');

    // Verify the updates
    const availableSlotsExample = await availableSlotsCollection.findOne({});
    console.log('Example availableSlots document:', availableSlotsExample);

    const appointmentExample = await appointmentsCollection.findOne({});
    console.log('Example appointment document:', appointmentExample);

  } catch (error) {
    console.error('Error updating collections:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

updateCollections().catch(console.error);