"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Calendar, Clock, User, Video, Phone, FileText, AlertCircle, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Interface to match MongoDB schema
interface AppointmentData {
  _id: string
  doctorId: string
  doctorName: string
  patientName: string
  patientEmail: string
  patientPhone: string
  date: string
  time: string
  specialty: string
  status: string
  symptoms: string
  description?: string
  notes?: string
  createdAt: string
  paymentStatus?: string
  paymentId?: string
  meetingId?: string
  roomUrl?: string
}

export default function AppointmentsPage() {
  const { data: session, status } = useSession()
  const [appointments, setAppointments] = useState<AppointmentData[]>([])
  const [videoConsultations, setVideoConsultations] = useState<AppointmentData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAppointments = async () => {
      if (status === "loading") return

      if (!session) {
        setError("You must be logged in to view your appointments")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // Fetch regular appointments using the new endpoint
        const appointmentsResponse = await fetch("/api/patient/appointments")

        // Fetch video consultations using the new endpoint
        const videoConsultationsResponse = await fetch("/api/patient/video-consultations")

        if (!appointmentsResponse.ok) {
          throw new Error(`Failed to fetch appointments: ${appointmentsResponse.status}`)
        }

        if (!videoConsultationsResponse.ok) {
          throw new Error(`Failed to fetch video consultations: ${videoConsultationsResponse.status}`)
        }

        const appointmentsData = await appointmentsResponse.json()
        const videoConsultationsData = await videoConsultationsResponse.json()

        // Store the original data
        setAppointments(appointmentsData)
        setVideoConsultations(videoConsultationsData)
      } catch (error) {
        console.error("Error fetching appointments:", error)
        setError("Failed to load appointments. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppointments()
  }, [session, status])

  // Combine appointments and video consultations
  const allAppointments = [
    ...appointments.map((appt) => ({ ...appt, type: "in-person" })),
    ...videoConsultations.map((appt) => ({ ...appt, type: "video" })),
  ]

  // Determine if an appointment is upcoming or past based on date and status
  const isUpcoming = (appointment: AppointmentData & { type?: string }) => {
    const appointmentDate = new Date(`${appointment.date} ${appointment.time}`)
    const today = new Date()

    // Consider appointments as upcoming if:
    // 1. The date is in the future, or
    // 2. The date is today and status is pending or confirmed
    return (
      appointmentDate > today ||
      (appointmentDate.toDateString() === today.toDateString() &&
        (appointment.status === "pending" || appointment.status === "confirmed"))
    )
  }

  const upcomingAppointments = allAppointments.filter(isUpcoming)
  const pastAppointments = allAppointments.filter((appointment) => !isUpcoming(appointment))

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: "long", year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString("en-US", options)
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "confirmed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <AlertCircle className="w-4 h-4 mr-1" />
      case "confirmed":
        return <CheckCircle className="w-4 h-4 mr-1" />
      case "completed":
        return <CheckCircle className="w-4 h-4 mr-1" />
      case "cancelled":
        return <XCircle className="w-4 h-4 mr-1" />
      default:
        return null
    }
  }

  const getAppointmentTypeIcon = (type: string) => {
    switch (type) {
      case "in-person":
        return <User className="w-4 h-4 mr-1" />
      case "video":
        return <Video className="w-4 h-4 mr-1" />
      case "phone":
        return <Phone className="w-4 h-4 mr-1" />
      default:
        return <User className="w-4 h-4 mr-1" />
    }
  }

  const handleJoinVideoCall = (roomUrl: string) => {
    window.open(roomUrl, "_blank")
  }

  const handleCancelAppointment = async (id: string, type: string) => {
    try {
      // Use the new endpoints
      const endpoint = type === "video" ? `/api/patient/video-consultations/${id}` : `/api/patient/appointments/${id}`

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "cancelled" }),
      })

      if (!response.ok) {
        throw new Error("Failed to cancel appointment")
      }

      // Update the local state based on appointment type
      if (type === "video") {
        setVideoConsultations((prev) => prev.map((appt) => (appt._id === id ? { ...appt, status: "cancelled" } : appt)))
      } else {
        setAppointments((prev) => prev.map((appt) => (appt._id === id ? { ...appt, status: "cancelled" } : appt)))
      }

      alert("Appointment cancelled successfully")
    } catch (error) {
      console.error("Error cancelling appointment:", error)
      alert("Failed to cancel appointment. Please try again.")
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Your Appointments</h1>
          <div className="animate-pulse space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex flex-col md:flex-row">
                  <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 mb-4 md:mb-0"></div>
                  <div className="md:ml-4 flex-1">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Your Appointments</h1>
          <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md">
            <p className="text-red-800 dark:text-red-300">{error}</p>
            {!session && (
              <div className="mt-4">
                <Link href="/login" className="text-blue-600 hover:underline">
                  Login to view your appointments
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Appointments</h1>

        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "upcoming"
                    ? "border-green-500 text-green-600 dark:text-green-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Upcoming
                {upcomingAppointments.length > 0 && (
                  <span className="ml-2 bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-200">
                    {upcomingAppointments.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("past")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "past"
                    ? "border-green-500 text-green-600 dark:text-green-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Past
              </button>
            </nav>
          </div>
        </div>

        {activeTab === "upcoming" && (
          <>
            {upcomingAppointments.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Upcoming Appointments</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">You don't have any scheduled appointments.</p>
                <Link
                  href="/"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  Find a Doctor
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row">
                        <div className="flex-shrink-0 mb-4 md:mb-0">
                        <Image
  src={`/placeholder.svg?height=64&width=64&text=${appointment?.doctorName?.charAt(0) || "D"}`}
  alt={appointment?.doctorName || "Doctor"}
  width={64}
  height={64}
  className="rounded-full"
/>



                        </div>
                        <div className="md:ml-6 flex-1">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                            <div>
                              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {appointment.doctorName}
                              </h2>
                              <p className="text-gray-600 dark:text-gray-300">{appointment.specialty}</p>
                            </div>
                            <div className="mt-2 md:mt-0">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(appointment.status)}`}
                              >
                                {getStatusIcon(appointment.status)}
                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                              </span>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center text-gray-700 dark:text-gray-300">
                              <Calendar className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                              {formatDate(appointment.date)}
                            </div>
                            <div className="flex items-center text-gray-700 dark:text-gray-300">
                              <Clock className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                              {appointment.time}
                            </div>
                            <div className="flex items-center text-gray-700 dark:text-gray-300">
                              <span className="inline-flex items-center">
                                {getAppointmentTypeIcon(appointment.type || "in-person")}
                                {appointment.type === "video"
                                  ? "Video Consultation"
                                  : appointment.type === "phone"
                                    ? "Phone Consultation"
                                    : "In-person Visit"}
                              </span>
                            </div>
                          </div>

                          <div className="mt-4">
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Symptoms</h3>
                            <p className="mt-1 text-gray-800 dark:text-white">
                              {appointment.symptoms || "None specified"}
                            </p>
                          </div>

                          <div className="mt-6 flex flex-wrap gap-2">
                            {appointment.type === "video" && appointment.roomUrl && (
                              <button
                                onClick={() => handleJoinVideoCall(appointment.roomUrl!)}
                                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                              >
                                <Video className="w-4 h-4 mr-2" />
                                Join Video Call
                              </button>
                            )}
                            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
                              Reschedule
                            </button>
                            <button
                              onClick={() => handleCancelAppointment(appointment._id, appointment.type || "in-person")}
                              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-red-300 dark:border-gray-600 dark:hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "past" && (
          <>
            {pastAppointments.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Past Appointments</h3>
                <p className="text-gray-500 dark:text-gray-400">You don't have any past appointment records.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {pastAppointments.map((appointment) => (
                  <div key={appointment._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row">
                        <div className="flex-shrink-0 mb-4 md:mb-0">
                        <Image
  src={`/placeholder.svg?height=64&width=64&text=${appointment?.doctorName?.charAt(0) || "D"}`}
  alt={appointment?.doctorName || "Doctor"}
  width={64}
  height={64}
  className="rounded-full"
/>

                        </div>
                        <div className="md:ml-6 flex-1">
                          <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                            <div>
                              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {appointment.doctorName}
                              </h2>
                              <p className="text-gray-600 dark:text-gray-300">{appointment.specialty}</p>
                            </div>
                            <div className="mt-2 md:mt-0">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(appointment.status)}`}
                              >
                                {getStatusIcon(appointment.status)}
                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                              </span>
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center text-gray-700 dark:text-gray-300">
                              <Calendar className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                              {formatDate(appointment.date)}
                            </div>
                            <div className="flex items-center text-gray-700 dark:text-gray-300">
                              <Clock className="w-5 h-5 mr-2 text-gray-500 dark:text-gray-400" />
                              {appointment.time}
                            </div>
                            <div className="flex items-center text-gray-700 dark:text-gray-300">
                              <span className="inline-flex items-center">
                                {getAppointmentTypeIcon(appointment.type || "in-person")}
                                {appointment.type === "video"
                                  ? "Video Consultation"
                                  : appointment.type === "phone"
                                    ? "Phone Consultation"
                                    : "In-person Visit"}
                              </span>
                            </div>
                          </div>

                          {appointment.notes && (
                            <div className="mt-4">
                              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Doctor's Notes</h3>
                              <p className="mt-1 text-gray-800 dark:text-white">{appointment.notes}</p>
                            </div>
                          )}

                          <div className="mt-6 flex flex-wrap gap-2">
                            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">
                              <FileText className="w-4 h-4 mr-2" />
                              View Medical Record
                            </button>
                            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
                              Book Follow-up
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

