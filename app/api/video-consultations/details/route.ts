import { NextResponse } from 'next/server';
import { getVideoConsultationByMeetingId } from '@/lib/db-service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const meetingId = searchParams.get('meetingId');

    if (!meetingId) {
      return NextResponse.json({ error: 'Meeting ID is required' }, { status: 400 });
    }

    const consultation = await getVideoConsultationByMeetingId(meetingId);

    if (!consultation) {
      return NextResponse.json({ error: 'Consultation not found' }, { status: 404 });
    }

    return NextResponse.json(consultation);
  } catch (error) {
    console.error('Error fetching consultation details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch consultation details' },
      { status: 500 }
    );
  }
}