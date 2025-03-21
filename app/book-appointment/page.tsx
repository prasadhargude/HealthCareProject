"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { format } from "date-fns"
import { Calendar, User, Mail, Phone, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

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
}

interface Timeslot {
  _id: string
  doctorId: string
  date: string
  time: string
  isBooked: boolean
}

export default function BookAppointment() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const doctorId = searchParams.get("doctorId")

  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [timeslots, setTimeslots] = useState<Timeslot[]>([])
  const [selectedTimeslot, setSelectedTimeslot] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    patientName: "",
    patientEmail: "",
    patientPhone: "",
    patientNotes: "",
  })
  const [formErrors, setFormErrors] = useState({
    patientName: "",
    patientEmail: "",
    patientPhone: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!doctorId) {
      router.push("/find-doctors")
      return
    }

    fetchDoctor()
  }, [doctorId, router])

  useEffect(() => {
    if (doctorId && date) {
      fetchTimeslots()
    }
  }, [doctorId, date])

  const fetchDoctor = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/doctors/${doctorId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch doctor details")
      }

      const data = await response.json()
      setDoctor(data)
    } catch (err) {
      console.error("Error fetching doctor:", err)
      setError("Failed to load doctor details. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTimeslots = async () => {
    if (!doctorId || !date) return

    try {
      const formattedDate = format(date, "yyyy-MM-dd")
      const response = await fetch(`/api/timeslots?doctorId=${doctorId}&date=${formattedDate}`)

      if (!response.ok) {
        throw new Error("Failed to fetch timeslots")
      }

      const data = await response.json()
      setTimeslots(data)
      setSelectedTimeslot(null) // Reset selection when date changes
    } catch (err) {
      console.error("Error fetching timeslots:", err)
      setTimeslots([])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user types
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    let valid = true
    const newErrors = { ...formErrors }

    if (!formData.patientName.trim()) {
      newErrors.patientName = "Name is required"
      valid = false
    }

    if (!formData.patientEmail.trim()) {
      newErrors.patientEmail = "Email is required"
      valid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.patientEmail)) {
      newErrors.patientEmail = "Email is invalid"
      valid = false
    }

    if (!formData.patientPhone.trim()) {
      newErrors.patientPhone = "Phone number is required"
      valid = false
    } else if (!/^\d{10}$/.test(formData.patientPhone.replace(/\D/g, ""))) {
      newErrors.patientPhone = "Phone number should be 10 digits"
      valid = false
    }

    setFormErrors(newErrors)
    return valid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !selectedTimeslot || !date || !doctor) {
      return
    }

    setIsSubmitting(true)

    try {
      // Create appointment
      const selectedTime = timeslots.find((t) => t._id === selectedTimeslot)?.time || ""
      const formattedDate = format(date, "yyyy-MM-dd")

      const appointmentResponse = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctorId: doctor._id,
          patientName: formData.patientName,
          patientEmail: formData.patientEmail,
          patientPhone: formData.patientPhone,
          patientNotes: formData.patientNotes,
          date: formattedDate,
          time: selectedTime,
          timeslotId: selectedTimeslot,
          specialty: doctor.specialty,
        }),
      })

      if (!appointmentResponse.ok) {
        throw new Error("Failed to create appointment")
      }

      const appointmentData = await appointmentResponse.json()

      // Proceed to payment
      router.push(`/payment?appointmentId=${appointmentData.appointmentId}`)
    } catch (err) {
      console.error("Error creating appointment:", err)
      setError("Failed to book appointment. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Skeleton className="h-10 w-3/4 mb-6" />
          <div className="flex mb-6">
            <Skeleton className="h-20 w-20 rounded-full mr-4" />
            <div>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-40 w-full mb-6" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => fetchDoctor()} className="bg-green-600 hover:bg-green-700">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">Doctor not found.</p>
          <Button onClick={() => router.push("/find-doctors")} className="bg-green-600 hover:bg-green-700">
            Back to Find Doctors
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Book an Appointment</h1>

        {/* Doctor Info Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-start">
              <div className="mr-4">
                <Image
                  src={doctor.image || "/placeholder.svg?height=100&width=100"}
                  alt={doctor.name}
                  width={100}
                  height={100}
                  className="rounded-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-1 text-gray-800 dark:text-white">{doctor.name}</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-1">{doctor.specialty}</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  {doctor.specialties?.map((specialty, index) => (
                    <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {specialty}
                    </Badge>
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-1">{doctor.hospital}</p>
                <p className="text-gray-600 dark:text-gray-300 mb-2">{doctor.location}</p>
                <p className="text-green-600 font-semibold">Consultation Fee: ₹{doctor.fees || 199}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit}>
          {/* Date Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Select Date & Time</h2>
            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/2">
                <Label className="mb-2 block">Appointment Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                        date > new Date(new Date().setDate(new Date().getDate() + 30))
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="md:w-1/2">
                <Label className="mb-2 block">Available Time Slots</Label>
                {timeslots.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 p-2">
                    No available slots for the selected date. Please choose another date.
                  </p>
                ) : (
                  <RadioGroup
                    value={selectedTimeslot || ""}
                    onValueChange={setSelectedTimeslot}
                    className="grid grid-cols-3 gap-2"
                  >
                    {timeslots.map((slot) => (
                      <div key={slot._id} className="flex items-center space-x-2">
                        <RadioGroupItem value={slot._id} id={slot._id} />
                        <Label
                          htmlFor={slot._id}
                          className="cursor-pointer py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          {slot.time}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </div>
            </div>
          </div>

          {/* Patient Information */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Patient Information</h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="patientName">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="patientName"
                    name="patientName"
                    value={formData.patientName}
                    onChange={handleInputChange}
                    className="pl-10"
                    placeholder="Enter your full name"
                  />
                </div>
                {formErrors.patientName && <p className="text-red-500 text-sm mt-1">{formErrors.patientName}</p>}
              </div>

              <div>
                <Label htmlFor="patientEmail">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="patientEmail"
                    name="patientEmail"
                    type="email"
                    value={formData.patientEmail}
                    onChange={handleInputChange}
                    className="pl-10"
                    placeholder="Enter your email address"
                  />
                </div>
                {formErrors.patientEmail && <p className="text-red-500 text-sm mt-1">{formErrors.patientEmail}</p>}
              </div>

              <div>
                <Label htmlFor="patientPhone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="patientPhone"
                    name="patientPhone"
                    value={formData.patientPhone}
                    onChange={handleInputChange}
                    className="pl-10"
                    placeholder="Enter your phone number"
                  />
                </div>
                {formErrors.patientPhone && <p className="text-red-500 text-sm mt-1">{formErrors.patientPhone}</p>}
              </div>

              <div>
                <Label htmlFor="patientNotes">Notes (Optional)</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Textarea
                    id="patientNotes"
                    name="patientNotes"
                    value={formData.patientNotes}
                    onChange={handleInputChange}
                    className="pl-10 min-h-[100px]"
                    placeholder="Describe your symptoms or any information you want to share with the doctor"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700"
            disabled={isSubmitting || !selectedTimeslot}
          >
            {isSubmitting ? "Processing..." : "Proceed to Payment"}
          </Button>
        </form>
      </div>
    </div>
  )
}

