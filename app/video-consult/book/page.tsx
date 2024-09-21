'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery, useMutation, QueryClient, QueryClientProvider } from 'react-query'
import axios from 'axios'

const queryClient = new QueryClient()

interface AvailableSlot {
  _id: string
  specialty: string
  date: string
  time: string
  isAvailable: boolean
}

interface BookingData {
  specialty: string
  date: string
  time: string
  patientName: string
  patientPhone: string
}

function BookingForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const specialty = searchParams.get('specialty')

  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [patientName, setPatientName] = useState('')
  const [patientPhone, setPatientPhone] = useState('')

  const { data: availableSlots, isLoading, error } = useQuery<AvailableSlot[], Error>(
    ['availableSlots', specialty, selectedDate],
    async () => {
      if (!specialty || !selectedDate) return []
      const response = await axios.get<AvailableSlot[]>(`/api/available-slots?specialty=${encodeURIComponent(specialty)}&date=${selectedDate}`)
      return response.data
    },
    { enabled: !!specialty && !!selectedDate }
  )

  const bookMutation = useMutation<{ appointmentId: string }, Error, BookingData>(
    (bookingData) => axios.post('/api/book-appointment', bookingData).then(res => res.data),
    {
      onSuccess: (data) => {
        router.push(`/video-consult/confirmation?id=${data.appointmentId}`)
      },
    }
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (specialty && selectedDate && selectedTime && patientName && patientPhone) {
      bookMutation.mutate({
        specialty,
        date: selectedDate,
        time: selectedTime,
        patientName,
        patientPhone,
      })
    }
  }

  if (!specialty) {
    router.push('/video-consult')
    return null
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Select Date
        </label>
        <input
          type="date"
          id="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
        />
      </div>

      {selectedDate && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Select Time</h2>
          {isLoading ? (
            <p>Loading available slots...</p>
          ) : error ? (
            <p className="text-red-500">Error loading available slots</p>
          ) : availableSlots?.length === 0 ? (
            <p>No available slots for the selected date.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {availableSlots?.map((slot) => (
                <button
                  key={slot._id}
                  type="button"
                  onClick={() => setSelectedTime(slot.time)}
                  className={`px-4 py-2 rounded ${
                    selectedTime === slot.time
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-green-600 border border-green-600 hover:bg-green-50'
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div>
        <label htmlFor="patientName" className="block text-sm font-medium text-gray-700">
          Full Name
        </label>
        <input
          type="text"
          id="patientName"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
        />
      </div>

      <div>
        <label htmlFor="patientPhone" className="block text-sm font-medium text-gray-700">
          Phone Number
        </label>
        <input
          type="tel"
          id="patientPhone"
          value={patientPhone}
          onChange={(e) => setPatientPhone(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
        />
      </div>

      <button
        type="submit"
        disabled={!selectedDate || !selectedTime || !patientName || !patientPhone || bookMutation.isLoading}
        className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        {bookMutation.isLoading ? 'Booking...' : 'Book Appointment'}
      </button>
    </form>
  )
}

export default function BookAppointmentPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6 text-green-600">Book Video Consultation</h1>
        <BookingForm />
      </div>
    </QueryClientProvider>
  )
}