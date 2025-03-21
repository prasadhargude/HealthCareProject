"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Check, AlertCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import Script from "next/script"
import { toast } from "react-hot-toast"
import { IAppointment, IDoctor } from "@/lib/db-service"
import mongoose from "mongoose"

// Define types for the API responses
interface AppointmentResponse {
  _id: string
  doctorId: string
  patientName: string
  patientEmail: string
  patientPhone: string
  date: string
  time: string
  specialty: string
  status: string
  doctorName: string
}

interface DoctorResponse extends Omit<IDoctor, keyof Document> {
  _id: string
}

interface PaymentOrder {
  orderId: string
  amount: number
  currency: string
}

export default function Payment() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const appointmentId = searchParams.get("appointmentId")

  const [appointment, setAppointment] = useState<AppointmentResponse | null>(null)
  const [doctor, setDoctor] = useState<DoctorResponse | null>(null)
  const [paymentOrder, setPaymentOrder] = useState<PaymentOrder | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "success" | "failed">("pending")
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (!appointmentId) {
      toast.error("No appointment selected")
      router.push("/find-doctors")
      return
    }

    fetchAppointmentDetails()
  }, [appointmentId, router])

  const fetchAppointmentDetails = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Fetch appointment details
      const appointmentResponse = await fetch(`/api/appointments/${appointmentId}`)

      if (!appointmentResponse.ok) {
        throw new Error("Failed to fetch appointment details")
      }

      const appointmentData = await appointmentResponse.json()
      setAppointment(appointmentData)

      // Fetch doctor details
      const doctorResponse = await fetch(`/api/doctors/${appointmentData.doctorId}`)

      if (!doctorResponse.ok) {
        throw new Error("Failed to fetch doctor details")
      }

      const doctorData = await doctorResponse.json()
      setDoctor(doctorData)

      // Create payment order
      const orderResponse = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ appointmentId }),
      })

      if (!orderResponse.ok) {
        throw new Error("Failed to create payment order")
      }

      const orderData = await orderResponse.json()
      setPaymentOrder(orderData)
    } catch (err) {
      console.error("Error fetching details:", err)
      setError("Failed to load payment details. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePayment = () => {
    if (!paymentOrder || !appointment) return

    setIsProcessing(true)

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: paymentOrder.amount * 100, // Amount in paise
      currency: paymentOrder.currency,
      name: "HealthConnect",
      description: `Consultation with ${doctor?.name || "Doctor"}`,
      order_id: paymentOrder.orderId,
      prefill: {
        name: appointment.patientName,
        email: appointment.patientEmail,
        contact: appointment.patientPhone,
      },
      theme: {
        color: "#10b981", // Green-600
      },
      handler: (response: any) => {
        verifyPayment(response)
      },
      modal: {
        ondismiss: () => {
          setIsProcessing(false)
        },
      },
    }

    const razorpayWindow = new (window as any).Razorpay(options)
    razorpayWindow.open()
  }

  const verifyPayment = async (response: any) => {
    try {
      console.log("Verifying payment:", response)

      const verifyResponse = await fetch("/api/payments/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          appointmentId,
        }),
      })

      const responseData = await verifyResponse.json()

      if (!verifyResponse.ok) {
        console.error("Payment verification failed:", responseData)
        throw new Error(responseData.error || "Payment verification failed")
      }

      setPaymentStatus("success")
      toast.success("Payment successful!")
    } catch (err) {
      console.error("Error verifying payment:", err)
      setPaymentStatus("failed")
      toast.error(err instanceof Error ? err.message : "Payment verification failed")
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
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
        <div className="max-w-md mx-auto text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => fetchAppointmentDetails()} className="bg-green-600 hover:bg-green-700">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (paymentStatus === "success") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Payment Successful!</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">Your appointment has been confirmed.</p>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
                <p className="text-gray-700 dark:text-gray-300 mb-1">
                  <strong>Doctor:</strong> {doctor?.name || appointment?.doctorName}
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-1">
                  <strong>Date:</strong> {appointment?.date}
                </p>
                <p className="text-gray-700 dark:text-gray-300 mb-1">
                  <strong>Time:</strong> {appointment?.time}
                </p>
              </div>
              <Button
                onClick={() => router.push("/my-appointments")}
                className="bg-green-600 hover:bg-green-700 w-full"
              >
                View My Appointments
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (paymentStatus === "failed") {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">Payment Failed</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                We couldn't process your payment. Please try again.
              </p>
              <Button
                onClick={handlePayment}
                className="bg-green-600 hover:bg-green-700 w-full mb-4"
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Try Again"}
              </Button>
              <Button variant="outline" onClick={() => router.push("/find-doctors")} className="w-full">
                Cancel and Return
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Complete Your Payment</h1>

          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Appointment Summary</h2>

              {doctor && (
                <div className="flex items-center mb-4">
                  <Image
                    src={doctor.image || "/placeholder.svg?height=50&width=50"}
                    alt={doctor.name}
                    width={50}
                    height={50}
                    className="rounded-full object-cover mr-3"
                  />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">{doctor.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{doctor.specialty}</p>
                  </div>
                </div>
              )}

              {appointment && (
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <p className="text-gray-600 dark:text-gray-300">Date:</p>
                    <p className="text-gray-800 dark:text-white">{appointment.date}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-600 dark:text-gray-300">Time:</p>
                    <p className="text-gray-800 dark:text-white">{appointment.time}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-gray-600 dark:text-gray-300">Patient:</p>
                    <p className="text-gray-800 dark:text-white">{appointment.patientName}</p>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                <div className="flex justify-between font-medium">
                  <p className="text-gray-800 dark:text-white">Consultation Fee:</p>
                  <p className="text-gray-800 dark:text-white">₹{doctor?.fees || 199}</p>
                </div>
              </div>

              <Button
                onClick={handlePayment}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isProcessing || !paymentOrder}
              >
                {isProcessing ? "Processing..." : `Pay ₹${doctor?.fees || 199}`}
              </Button>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>Your payment is secured by Razorpay</p>
            <div className="flex justify-center mt-2">
              <Image src="/placeholder.svg?height=24&width=80&text=Razorpay" alt="Razorpay" width={80} height={24} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}