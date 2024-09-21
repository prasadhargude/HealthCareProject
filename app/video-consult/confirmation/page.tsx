'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'

interface Appointment {
  _id: string
  specialty: string
  date: string
  time: string
  patientName: string
  patientPhone: string
}

export default function ConfirmationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const appointmentId = searchParams.get('id')
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!appointmentId) {
      router.push('/video-consult')
      return
    }

    const fetchAppointment = async () => {
      try {
        const response = await axios.get(`/api/appointment-details?id=${appointmentId}`)
        setAppointment(response.data)
      } catch (error) {
        console.error('Error fetching appointment details:', error)
        setError('Failed to load appointment details')
      }
    }

    fetchAppointment()
  }, [appointmentId, router])

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  if (!appointment) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-green-600">Appointment Confirmed</h1>
      <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
        Your video consultation has been successfully booked!
      </div>
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-xl font-semibold mb-4 text-green-600">Appointment Details</h2>
        <p><strong>Specialty:</strong> {appointment.specialty}</p>
        <p><strong>Date:</strong> {appointment.date}</p>
        <p><strong>Time:</strong> {appointment.time}</p>
        <p><strong>Patient Name:</strong> {appointment.patientName}</p>
        <p><strong>Patient Phone:</strong> {appointment.patientPhone}</p>
      </div>
      <button
        onClick={() => router.push('/video-consult')}
        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        Back to Video Consultations
      </button>
    </div>
  )
}