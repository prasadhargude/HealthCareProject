'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'

const doctors = [
  { id: 1, name: 'Dr. John Doe', specialty: 'Cardiologist', rating: 4.8, experience: '15 years' },
  { id: 2, name: 'Dr. Jane Smith', specialty: 'Dermatologist', rating: 4.9, experience: '10 years' },
  { id: 3, name: 'Dr. Mike Johnson', specialty: 'Pediatrician', rating: 4.7, experience: '12 years' },
]

export default function FindDoctors() {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredDoctors = doctors.filter(doctor =>
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Find Doctors</h1>
      
      <div className="mb-8">
        <div className="flex">
          <input
            type="text"
            placeholder="Search doctors by name or specialty"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 border border-gray-300 rounded-l-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button className="bg-green-600 text-white p-2 rounded-r-md hover:bg-green-700">
            <Search className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map(doctor => (
          <div key={doctor.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">{doctor.name}</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-2">{doctor.specialty}</p>
            <p className="text-gray-600 dark:text-gray-300 mb-2">Experience: {doctor.experience}</p>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Rating: {doctor.rating}/5</p>
            <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Book Appointment</button>
          </div>
        ))}
      </div>
    </div>
  )
}