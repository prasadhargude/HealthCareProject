// app/video-consult/meeting/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import VideoConsultation from '@/components/ui/VideoConsultation';

interface AppointmentDetails {
  id: string;
  specialty: string;
  date: string;
  time: string;
  createdAt: string; // Assuming ISO string from the API
}

export default function Meeting() {
  const [appointmentDetails, setAppointmentDetails] = useState<AppointmentDetails | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('id');

  useEffect(() => {
    if (appointmentId) {
      fetchAppointmentDetails(appointmentId);
    } else {
      router.push('/video-consult');
    }
  }, [appointmentId, router]);

  const fetchAppointmentDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/appointment-details?id=${id}`);
      if (response.ok) {
        const data: AppointmentDetails = await response.json();
        setAppointmentDetails(data);
      } else {
        console.error('Failed to fetch appointment details');
        // Optionally, redirect or show an error message
        router.push('/video-consult'); // Example: Redirect to consult page
      }
    } catch (error) {
      console.error('Error fetching appointment details:', error);
      // Optionally, redirect or show an error message
      router.push('/video-consult'); // Example: Redirect to consult page
    }
  };

  if (!appointmentDetails) {
    return <div className="text-center text-gray-600 dark:text-gray-300">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Video Consultation</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
          Appointment with {appointmentDetails.specialty}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Date: {appointmentDetails.date} | Time: {appointmentDetails.time}
        </p>
        <VideoConsultation appointmentId={appointmentDetails.id} patientName="Patient" />
      </div>
    </div>
  );
}
