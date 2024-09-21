import { connectToDatabase } from '@/lib/mongodb';

export async function GET(req) {
  try {
    const db = await connectToDatabase();
    // Use the db object to perform database operations
    // ...
  } catch (error) {
    console.error('Database operation failed:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}