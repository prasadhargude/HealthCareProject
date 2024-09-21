import clientPromise from './mongodb';
import { addDays, format } from 'date-fns';

export async function updateAvailableSlots() {
  const client = await clientPromise;
  const db = client.db("healthconnect");
  const collection = db.collection("availableSlots");

  // Delete old slots
  const yesterday = format(addDays(new Date(), -1), 'yyyy-MM-dd');
  await collection.deleteMany({ date: { $lt: yesterday } });

  // Generate new slots for the next 3 days
  const specialties = ["General Physician", "Cardiologist", "Dermatologist", "Pediatrician"];
  const timeSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

  for (let i = 0; i < 3; i++) {
    const date = format(addDays(new Date(), i), 'yyyy-MM-dd');
    
    for (const specialty of specialties) {
      for (const time of timeSlots) {
        await collection.updateOne(
          { specialty, date, time },
          { 
            $setOnInsert: { 
              specialty, 
              date, 
              time, 
              isAvailable: true 
            }
          },
          { upsert: true }
        );
      }
    }
  }

  console.log('Available slots updated successfully');
}