'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

interface Appointment {
  id: number;
  doctorName: string;
  patientName: string;
  city: string;
  slot: string;
  symptoms: string;
  description: string;
}

export default function AppointmentConfirmation() {
  const searchParams = useSearchParams()
  const [appointment, setAppointment] = useState<Appointment | null>(null)

  useEffect(() => {
    const appointmentId = searchParams.get('appointmentId')
    if (appointmentId) {
      fetchAppointment(appointmentId)
    }
  }, [searchParams])

  const fetchAppointment = async (id: string) => {
    try {
      const response = await fetch(`/api/appointments/${id}`)
      if (!response.ok) {
        throw new Error('Failed to fetch appointment')
      }
      const data = await response.json()
      setAppointment(data)
    } catch (error) {
      console.error('Error fetching appointment:', error)
    }
  }

  if (!appointment) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Appointment Confirmed</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Appointment Details</h2>
        <p><strong>Doctor:</strong> {appointment.doctorName}</p>
        <p><strong>Patient:</strong> {appointment.patientName}</p>
        <p><strong>City:</strong> {appointment.city}</p>
        <p><strong>Time Slot:</strong> {appointment.slot}</p>
        <p><strong>Symptoms:</strong> {appointment.symptoms}</p>
        <p><strong>Description:</strong> {appointment.description}</p>
      </div>
    </div>
  )
}