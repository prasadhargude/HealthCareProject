import { NextResponse } from 'next/server';
import { getVideoConsultationByMeetingId } from '@/lib/db-service';
import connectToDatabase from '@/lib/mongodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const meetingId = searchParams.get('meetingId');

    if (!meetingId) {
      return NextResponse.json({ error: 'Meeting ID is required' }, { status: 400 });
    }

    // Check if MONGODB_URI is configured
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'Database connection string is missing. Please check environment variables.' },
        { status: 500 }
      );
    }

    // Connect to database - move inside the function
    await connectToDatabase();
    
    const consultation = await getVideoConsultationByMeetingId(meetingId);

    if (!consultation) {
      return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
    }

    return NextResponse.json(consultation);
  } catch (error: any) {
    console.error('Error fetching consultation details:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch consultation details' },
      { status: 500 }
    );
  }
}