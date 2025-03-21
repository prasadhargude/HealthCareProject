'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { CalendarIcon, Clock, User, Phone, FileText, Video, AlertCircle, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { format, addDays, isSameDay } from 'date-fns'
import { toast } from 'react-hot-toast'
import Script from 'next/script'
import { getDoctorsForVideoConsultation } from '@/lib/videosdk'

interface TimeSlot {
  id: number;
  time: string;
  isAvailable: boolean;
}

interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  specialties: string[];
  image: string;
  fees: number;
  experience?: number;
  rating?: number;
}

export default function BookVideoConsultation() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = useState('')
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [patientName, setPatientName] = useState('')
  const [patientEmail, setPatientEmail] = useState('')
  const [patientPhone, setPatientPhone] = useState('')
  const [symptoms, setSymptoms] = useState('')
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [paymentOrder, setPaymentOrder] = useState<{orderId: string, amount: number} | null>(null)
  const [consultationId, setConsultationId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "success" | "failed">("pending")
  const [searchQuery, setSearchQuery] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const specialty = searchParams.get('specialty')

  useEffect(() => {
    fetchDoctors()
    generateTimeSlots()
  }, [specialty])  
  

  useEffect(() => {
    if (selectedDate) {
      generateTimeSlots()
    }
  }, [selectedDate])

  const fetchDoctors = async () => {
    try {
      setIsLoading(true)
      setError('')
  
      const response = await fetch(`/api/doctors?specialty=${encodeURIComponent(specialty || '')}`)
  
      if (!response.ok) {
        throw new Error(`Failed to fetch doctors, status: ${response.status}`)
      }
  
      const data = await response.json()
      console.log('Fetched doctors:', data)
      setDoctors(data)
  
      if (data.length === 1) {
        setSelectedDoctor(data[0])
      }
    } catch (error) {
      console.error('Error fetching doctors:', error)
      setError('Failed to fetch doctor information')
    } finally {
      setIsLoading(false)
    }
  }
  
  
  
  
  const generateTimeSlots = () => {
    // Generate time slots from 9 AM to 5 PM
    const slots: TimeSlot[] = []
    const today = new Date()
    const isToday = isSameDay(selectedDate, today)
    const currentHour = today.getHours()
    
    for (let hour = 9; hour <= 17; hour++) {
      // Skip past hours if today
      if (isToday && hour <= currentHour) continue
      
      const time = `${hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`
      slots.push({
        id: hour,
        time: time,
        isAvailable: true
      })
    }
    
    setAvailableSlots(slots)
  }

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !patientName || !patientEmail || !patientPhone || !selectedDoctor) {
      toast.error('Please fill in all required fields and select a doctor')
      return
    }
    
    setIsLoading(true)
    setError('')
    
    try {
      console.log("Sending booking request:", {
        doctorId: selectedDoctor?._id,
        patientName,
        patientEmail,
        patientPhone,
        date: format(selectedDate, 'yyyy-MM-dd'),
        time: selectedTime,
        specialty: selectedDoctor?.specialty || '',
        symptoms,
        notes: additionalNotes,
      });
      
      const response = await fetch('/api/video-consultations/create', {
      
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctorId: selectedDoctor?._id || '',
          patientName,
          patientEmail,
          patientPhone,
          date: format(selectedDate, 'yyyy-MM-dd'),
          time: selectedTime,
          specialty: selectedDoctor.specialty,
          symptoms,
          notes: additionalNotes,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.error || `Failed to book consultation, Status: ${response.status}`);
      }
      
      const { consultationId } = await response.json()
      setConsultationId(consultationId)
      
      // Create payment order
      const paymentResponse = await fetch('/api/video-consultations/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ consultationId }),
      })

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json()
        throw new Error(errorData.error || 'Failed to create payment')
      }

      const paymentData = await paymentResponse.json()
      setPaymentOrder(paymentData)
      
      // Proceed to payment
      handlePayment(paymentData, consultationId)
    } catch (error) {
      console.error('Error booking consultation:', error)
      setError(error instanceof Error ? error.message : 'Error booking consultation')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePayment = (paymentData: {orderId: string, amount: number}, consultationId: string) => {
    setIsProcessing(true)

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: paymentData.amount * 100, // Amount in paise
      currency: 'INR',
      name: "HealthConnect",
      description: `Video Consultation with ${selectedDoctor?.name || "Doctor"}`,
      order_id: paymentData.orderId,
      prefill: {
        name: patientName,
        email: patientEmail,
        contact: patientPhone,
      },
      theme: {
        color: "#10b981", // Green-600
      },
      handler: (response: any) => {
        verifyPayment(response, consultationId)
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

  const verifyPayment = async (response: any, consultationId: string) => {
    try {
      const verifyResponse = await fetch("/api/video-consultations/payment/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          consultationId,
        }),
      })

      const responseData = await verifyResponse.json()

      if (!verifyResponse.ok) {
        throw new Error(responseData.error || "Payment verification failed")
      }

      setPaymentStatus("success")
      
      // Send SMS notification
      await fetch("/api/video-consultations/send-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          consultationId,
        }),
      })
      
      // Redirect to confirmation page
      router.push(`/video-consult/confirmation?id=${consultationId}`)
    } catch (err) {
      console.error("Error verifying payment:", err)
      setPaymentStatus("failed")
      toast.error(err instanceof Error ? err.message : "Payment verification failed")
    } finally {
      setIsProcessing(false)
    }
  }

  // Filter doctors based on search query
  const filteredDoctors = doctors.filter(doctor => 
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Book Video Consultation</h1>
        
        {/* Doctor Selection Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
              {specialty ? `Select ${specialty} Specialist` : 'Select Doctor'}
            </h3>
            
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name or specialty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
            
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p>Loading doctors...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500 flex flex-col items-center">
                <AlertCircle className="h-8 w-8 mb-2" />
                <p>{error}</p>
                <Button 
                  onClick={fetchDoctors} 
                  variant="outline" 
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {specialty 
                  ? `No ${specialty} specialists found at the moment.` 
                  : 'No doctors found matching your search criteria.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDoctors.map((doctor) => (
                  <div 
                    key={doctor._id}
                    onClick={() => setSelectedDoctor(doctor)}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedDoctor?._id === doctor._id 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                        : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="relative w-16 h-16 mr-3">
                        <Image 
                          src={doctor.image || "/placeholder.svg?height=64&width=64"} 
                          alt={doctor.name} 
                          fill
                          className="rounded-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 dark:text-white">{doctor.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{doctor.specialty}</p>
                        <div className="flex items-center mt-1">
                          {doctor.rating && (
                            <div className="flex items-center text-yellow-500 mr-2">
                              <span className="text-sm font-medium">{doctor.rating}</span>
                              <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                              </svg>
                            </div>
                          )}
                          {doctor.experience && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">{doctor.experience} yrs exp</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-right">
                      <span className="text-green-600 font-medium">₹{doctor.fees || 499}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Rest of the component remains the same */}
        {/* Selected Doctor Info */}
        {selectedDoctor && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="relative w-16 h-16 mr-4">
                  <Image 
                    src={selectedDoctor.image || "/placeholder.svg?height=64&width=64"} 
                    alt={selectedDoctor.name} 
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">{selectedDoctor.name}</h2>
                  <p className="text-gray-600 dark:text-gray-300">{selectedDoctor.specialty}</p>
                  <p className="text-green-600 font-medium mt-1">₹{selectedDoctor.fees || 499} per consultation</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Select Date & Time</h3>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        disabled={(date) => date < new Date() || date > addDays(new Date(), 30)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map((slot) => (
                      <Button
                        key={slot.id}
                        variant={selectedTime === slot.time ? "default" : "outline"}
                        onClick={() => setSelectedTime(slot.time)}
                        disabled={!slot.isAvailable}
                        className="justify-center"
                      >
                        {slot.time}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Patient Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="patientName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="patientName"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="patientEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="patientEmail"
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="patientPhone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="patientPhone"
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Symptoms *
                    </label>
                    <textarea
                      id="symptoms"
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      rows={3}
                      required
                    ></textarea>
                  </div>
                  
                  <div>
                    <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      id="additionalNotes"
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      rows={3}
                    ></textarea>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="mt-8 flex justify-center">
          <Button
            onClick={handleBooking}
            disabled={!selectedDate || !selectedTime || !patientName || !patientEmail || !patientPhone || !symptoms || !selectedDoctor || isLoading}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-md text-lg flex items-center"
            size="lg"
          >
            {isLoading ? (
              'Processing...'
            ) : (
              <>
                <Video className="mr-2 h-5 w-5" />
                Book Video Consultation
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center text-red-700">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}
      </div>
    </>
  )
}