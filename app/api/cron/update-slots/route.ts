import { NextResponse } from 'next/server';
import { updateAvailableSlots } from '@/lib/updateAvailableSlots';

export async function GET() {
  try {
    await updateAvailableSlots();
    return NextResponse.json({ message: 'Available slots updated successfully' });
  } catch (error) {
    console.error('Error updating available slots:', error);
    return NextResponse.json({ error: 'Failed to update available slots' }, { status: 500 });
  }
}