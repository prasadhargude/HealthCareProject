"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

interface Doctor {
  _id: string
  name: string
  specialty: string
  specialties: string[]
  hospital: string
  location: string
  rating: number
  experience: string
  image: string
  fees: number
  availability: string[]
}

export default function FindDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchDoctors = async (query = "") => {
    setIsLoading(true)
    setError(null)

    try {
      const url = query ? `/api/doctors?name=${encodeURIComponent(query)}` : "/api/doctors"

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error("Failed to fetch doctors")
      }

      const data = await response.json()
      setDoctors(data)
    } catch (err) {
      console.error("Error fetching doctors:", err)
      setError("Failed to load doctors. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    fetchDoctors(searchQuery)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleBookAppointment = (doctorId: string) => {
    router.push(`/book-appointment?doctorId=${doctorId}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Find Doctors</h1>

      <div className="mb-8">
        <div className="flex">
          <Input
            type="text"
            placeholder="Search doctors by name or specialty"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="rounded-r-none"
          />
          <Button onClick={handleSearch} className="rounded-l-none bg-green-600 hover:bg-green-700">
            <Search className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-1/3 mb-4" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => fetchDoctors()} className="bg-green-600 hover:bg-green-700">
            Try Again
          </Button>
        </div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 dark:text-gray-300 mb-4">No doctors found matching your search criteria.</p>
          <Button
            onClick={() => {
              setSearchQuery("")
              fetchDoctors()
            }}
            className="bg-green-600 hover:bg-green-700"
          >
            Show All Doctors
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <Card key={doctor._id} className="overflow-hidden">
              <div className="flex p-6">
                <div className="mr-4">
                  <Image
                    src={doctor.image || "/placeholder.svg?height=80&width=80"}
                    alt={doctor.name}
                    width={80}
                    height={80}
                    className="rounded-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-1 text-gray-800 dark:text-white">{doctor.name}</h2>
                  <p className="text-gray-600 dark:text-gray-300 mb-1">{doctor.specialty}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {doctor.specialties?.map((specialty, index) => (
                      <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center mb-1">
                    <span className="text-yellow-500 mr-1">★</span>
                    <span className="text-gray-700 dark:text-gray-300">{doctor.rating}</span>
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6">
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  <strong>Experience:</strong> {doctor.experience}
                </p>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  <strong>Hospital:</strong> {doctor.hospital}
                </p>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  <strong>Location:</strong> {doctor.location}
                </p>
                <p className="text-green-600 font-semibold mb-4">Consultation Fee: ₹{doctor.fees || 199}</p>
                <Button
                  onClick={() => handleBookAppointment(doctor._id)}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Book Appointment
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

