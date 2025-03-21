"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Heart, Star, Calendar, MapPin, Phone, Video, Search, Filter, Trash2 } from 'lucide-react'
import Link from "next/link"
import Image from "next/image"

interface Doctor {
  id: string
  name: string
  specialty: string
  image: string
  rating: number
  reviews: number
  experience: number
  location: string
  availability: string[]
  consultationFees: number
  education: string[]
  languages: string[]
  about: string
  services: string[]
}

export default function SavedDoctorsPage() {
  const { data: session } = useSession()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [specialtyFilter, setSpecialtyFilter] = useState<string | null>(null)

  useEffect(() => {
    const fetchSavedDoctors = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/saved-doctors")
        
        if (response.ok) {
          const data = await response.json()
          setDoctors(data)
        } else {
          // If API fails, use mock data
          setDoctors([
            {
              id: "doc1",
              name: "Dr. Sarah Johnson",
              specialty: "Cardiologist",
              image: "/placeholder.svg?height=120&width=120",
              rating: 4.8,
              reviews: 124,
              experience: 12,
              location: "Apollo Hospital, Mumbai",
              availability: ["Mon", "Wed", "Fri"],
              consultationFees: 1200,
              education: ["MBBS - AIIMS, Delhi", "MD - Cardiology, AIIMS, Delhi"],
              languages: ["English", "Hindi"],
              about: "Dr. Sarah Johnson is a renowned cardiologist with over 12 years of experience in treating various heart conditions.",
              services: ["Echocardiography", "Cardiac CT", "Cardiac MRI", "Angiography"]
            },
            {
              id: "doc2",
              name: "Dr. Michael Chen",
              specialty: "Dermatologist",
              image: "/placeholder.svg?height=120&width=120",
              rating: 4.6,
              reviews: 98,
              experience: 8,
              location: "Fortis Hospital, Delhi",
              availability: ["Tue", "Thu", "Sat"],
              consultationFees: 1000,
              education: ["MBBS - Manipal University", "MD - Dermatology, PGI Chandigarh"],
              languages: ["English", "Hindi", "Mandarin"],
              about: "Dr. Michael Chen specializes in cosmetic dermatology and skin disorders with 8 years of clinical experience.",
              services: ["Skin Consultation", "Acne Treatment", "Laser Therapy", "Chemical Peels"]
            },
            {
              id: "doc3",
              name: "Dr. Emily Rodriguez",
              specialty: "Pediatrician",
              image: "/placeholder.svg?height=120&width=120",
              rating: 4.9,
              reviews: 156,
              experience: 15,
              location: "Max Hospital, Bangalore",
              availability: ["Mon", "Tue", "Wed", "Thu", "Fri"],
              consultationFees: 900,
              education: ["MBBS - Christian Medical College, Vellore", "MD - Pediatrics, AIIMS, Delhi"],
              languages: ["English", "Hindi", "Spanish"],
              about: "Dr. Emily Rodriguez is a compassionate pediatrician with 15 years of experience in child healthcare.",
              services: ["Well Child Visits", "Vaccinations", "Developmental Assessments", "Acute Care"]
            }
          ])
        }
      } catch (error) {
        console.error("Error fetching saved doctors:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchSavedDoctors()
    }
  }, [session])

  const handleRemoveDoctor = async (doctorId: string) => {
    try {
      const response = await fetch(`/api/saved-doctors/${doctorId}`, {
        method: "DELETE"
      })
      
      if (response.ok) {
        setDoctors(prev => prev.filter(doctor => doctor.id !== doctorId))
        alert("Doctor removed from saved list")
      } else {
        throw new Error("Failed to remove doctor")
      }
    } catch (error) {
      console.error("Error removing doctor:", error)
      alert("Failed to remove doctor. Please try again.")
    }
  }

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesSpecialty = specialtyFilter ? doctor.specialty === specialtyFilter : true
    
    return matchesSearch && matchesSpecialty
  })

  const specialties = Array.from(new Set(doctors.map(doctor => doctor.specialty)))

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Saved Doctors</h1>
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex">
                  <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                  <div className="ml-6 flex-1">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Saved Doctors</h1>
        
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
          
          <div className="w-full md:w-auto">
            <div className="relative">
              <select
                value={specialtyFilter || ""}
                onChange={(e) => setSpecialtyFilter(e.target.value || null)}
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-green-500 focus:border-green-500 appearance-none"
              >
                <option value="">All Specialties</option>
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
        
        {filteredDoctors.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <Heart className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Saved Doctors</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchTerm || specialtyFilter 
                ? "No doctors match your search criteria. Try adjusting your filters."
                : "You haven't saved any doctors yet."}
            </p>
            {!searchTerm && !specialtyFilter && (
              <Link
                href="/doctors"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                Find Doctors
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredDoctors.map((doctor) => (
              <div key={doctor.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row">
                    <div className="flex-shrink-0 mb-4 md:mb-0">
                      <Image
                        src={doctor.image || "/placeholder.svg"}
                        alt={doctor.name}
                        width={120}
                        height={120}
                        className="rounded-full"
                      />
                    </div>
                    <div className="md:ml-6 flex-1">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                        <div>
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {doctor.name}
                          </h2>
                          <p className="text-gray-600 dark:text-gray-300">{doctor.specialty}</p>
                          
                          <div className="flex items-center mt-1">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400" />
                              <span className="ml-1 text-gray-700 dark:text-gray-300">{doctor.rating}</span>
                            </div>
                            <span className="mx-2 text-gray-500 dark:text-gray-400">•</span>
                            <span className="text-gray-700 dark:text-gray-300">{doctor.reviews} reviews</span>
                          </div>
                          
                          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div className="flex items-center text-gray-700 dark:text-gray-300">
                              <MapPin className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" />
                              {doctor.location}
                            </div>
                            <div className="flex items-center text-gray-700 dark:text-gray-300">
                              <Calendar className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" />
                              {doctor.experience} years experience
                            </div>
                          </div>
                          
                          <div className="mt-4">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Available on</h3>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {doctor.availability.map((day, index) => (
                                <span 
                                  key={index} 
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                >
                                  {day}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="mt-6 flex flex-wrap gap-2">
                            <Link
                              href={`/doctors/${doctor.id}`}
                              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                            >
                              View Profile
                            </Link>
                            <Link
                              href={`/book-appointment/${doctor.id}`}
                              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                            >
                              <Calendar className="w-4 h-4 mr-2" />
                              Book Appointment
                            </Link>
                            <button
                              onClick={() => handleRemoveDoctor(doctor.id)}
                              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-red-300 dark:border-gray-600 dark:hover:bg-gray-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Remove
                            </button>
                          </div>
                        </div>
                        
                        <div className="mt-4 md:mt-0 md:ml-4 flex flex-col items-center">
                          <div className="text-lg font-semibold text-gray-900 dark:text-white">
                            ₹{doctor.consultationFees}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            per consultation
                          </div>
                          <div className="mt-2 flex space-x-2">
                            <button className="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
                              <Phone className="w-5 h-5" />
                            </button>
                            <button className="inline-flex items-center p-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
                              <Video className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}