const { MongoClient } = require('mongodb')

const uri = process.env.MONGODB_URI
const client = new MongoClient(uri)

async function populateSpecialties() {
  try {
    await client.connect()
    const db = client.db('healthconnect')
    const collection = db.collection('specialties')

    // Clear existing data
    await collection.deleteMany({})

    // Insert sample data
    await collection.insertMany([
      {
        name: 'General Physician',
        price: 399,
        keywords: ['fever', 'cold', 'cough', 'flu', 'headache', 'body ache', 'fatigue']
      },
      {
        name: 'Neurology',
        price: 449,
        keywords: ['headache', 'migraine', 'seizure', 'tremor', 'memory loss', 'dizziness']
      },
      {
        name: 'Eye and Vision',
        price: 449,
        keywords: ['eye pain', 'vision problem', 'redness', 'itching', 'blurry vision']
      },
      {
        name: 'Dermatology',
        price: 449,
        keywords: ['skin rash', 'acne', 'eczema', 'hair loss', 'skin allergy']
      },
      {
        name: 'Orthopedics',
        price: 449,
        keywords: ['joint pain', 'back pain', 'fracture', 'sprain', 'arthritis']
      }
    ])

    console.log('Specialties populated successfully')
  } catch (error) {
    console.error('Error populating specialties:', error)
  } finally {
    await client.close()
  }
}

populateSpecialties()