"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, Calendar, Clock, Video, Copy, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "react-hot-toast"

export default function ConsultationConfirmation() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const consultationId = searchParams.get("id")

  const [consultation, setConsultation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!consultationId) {
      router.push("/video-consult")
      return
    }

    fetchConsultationDetails()
  }, [consultationId, router])

  const fetchConsultationDetails = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/video-consultations/${consultationId}`)

      if (!response.ok) {
        throw new Error("Failed to fetch consultation details")
      }

      const data = await response.json()
      setConsultation(data)
    } catch (err) {
      console.error("Error fetching consultation details:", err)
      setError("Failed to load consultation details")
    } finally {
      setIsLoading(false)
    }
  }

  const copyMeetingLink = () => {
    if (consultation?.roomUrl) {
      navigator.clipboard.writeText(consultation.roomUrl)
      toast.success("Meeting link copied to clipboard")
    }
  }

  const joinMeeting = () => {
    if (consultation?.meetingId) {
      window.open(`/video-consult/meeting/${consultation.meetingId}`, "_blank")
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Skeleton className="h-10 w-3/4 mb-6" />
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-full mb-4" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-20 w-full mb-4" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
            <AlertCircle className="h-6 w-6 mx-auto mb-2" />
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
          <Button onClick={fetchConsultationDetails} className="bg-green-600 hover:bg-green-700">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Consultation Confirmed!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your video consultation has been scheduled successfully.
            </p>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">Date:</span>
                </div>
                <span className="font-medium text-gray-800 dark:text-white">{consultation?.date}</span>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">Time:</span>
                </div>
                <span className="font-medium text-gray-800 dark:text-white">{consultation?.time}</span>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <Video className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-gray-700 dark:text-gray-300">Doctor:</span>
                </div>
                <span className="font-medium text-gray-800 dark:text-white">{consultation?.doctorName}</span>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 dark:text-gray-300 mb-2">Your video consultation link:</p>
              <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded-md">
                <span className="text-sm text-gray-600 dark:text-gray-400 truncate mr-2">{consultation?.roomUrl}</span>
                <Button variant="ghost" size="sm" onClick={copyMeetingLink} className="flex-shrink-0">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={joinMeeting}
                className="w-full bg-green-600 hover:bg-green-700 flex items-center justify-center"
              >
                <Video className="h-5 w-5 mr-2" />
                Join Video Consultation
              </Button>

              <Button variant="outline" onClick={() => router.push("/my-consultations")} className="w-full">
                View My Consultations
              </Button>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
              You will receive an SMS with the consultation link shortly.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

