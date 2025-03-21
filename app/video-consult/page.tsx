"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Calendar, RefreshCw, Send, X, MessageSquare, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Specialty {
  _id: string
  name: string
  icon: string
}

interface Symptom {
  ID: number
  Name: string
}

interface Message {
  text: string
  isUser: boolean
}

interface Diagnosis {
  Issue: {
    ID: number
    Name: string
    Accuracy: number
    IcdName: string
    ProfName: string
  }
  Specialisation: {
    ID: number
    Name: string
    SpecialistID: number
  }[]
}

const commonConcerns = [
  {
    name: "Cough & Cold",
    image: "/placeholder.svg?height=200&width=300",
    symptoms: ["Cough", "Runny nose", "Sore throat"],
  },
  { name: "Skin Problems", image: "/placeholder.svg?height=200&width=300", symptoms: ["Rash", "Itching", "Dry skin"] },
  {
    name: "Stomach Issues",
    image: "/placeholder.svg?height=200&width=300",
    symptoms: ["Abdominal pain", "Nausea", "Diarrhea"],
  },
  {
    name: "Depression",
    image: "/placeholder.svg?height=200&width=300",
    symptoms: ["Sadness", "Fatigue", "Loss of interest"],
  },
]

export default function VideoConsult() {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null)
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Symptom checker states
  const [symptoms, setSymptoms] = useState<Symptom[]>([])
  const [filteredSymptoms, setFilteredSymptoms] = useState<Symptom[]>([])
  const [input, setInput] = useState("")
  const [selectedSymptoms, setSelectedSymptoms] = useState<Symptom[]>([])
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hello! I'm your healthcare assistant. Please describe your symptoms one by one, and I'll help you find the right specialist.",
      isUser: false,
    },
  ])
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isProcessingDiagnosis, setIsProcessingDiagnosis] = useState(false)
  const [diagnosisResults, setDiagnosisResults] = useState<Diagnosis[]>([])

  
  const fetchSpecialties = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/specialties")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setSpecialties(data)
    } catch (err) {
      console.error("Error fetching specialties:", err)
      setError("Failed to load specialties. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSymptoms = async () => {
    try {
      const response = await fetch("/api/symptoms")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setSymptoms(data)
    } catch (err) {
      console.error("Error fetching symptoms:", err)
      setMessages((prev) => [
        ...prev,
        {
          text: "I'm having trouble loading the symptom database. Please try again later.",
          isUser: false,
        },
      ])
    }
  }

  useEffect(() => {
    fetchSpecialties()
    fetchSymptoms()
  }, [])

  useEffect(() => {
    // Scroll to bottom of chat when messages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    // Filter symptoms based on input
    if (input.trim().length > 0) {
      const filtered = symptoms.filter((symptom) => symptom.Name.toLowerCase().includes(input.toLowerCase()))
      setFilteredSymptoms(filtered.slice(0, 5)) // Limit to 5 suggestions
    } else {
      setFilteredSymptoms([])
    }
  }, [input, symptoms])

  const handleSchedule = () => {
    if (selectedSpecialty) {
      router.push(`/video-consult/book?specialty=${encodeURIComponent(selectedSpecialty)}`)
    }
  }

  const handleSymptomInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value)
  }

  const selectSymptom = (symptom: Symptom) => {
    if (!selectedSymptoms.some((s) => s.ID === symptom.ID)) {
      setSelectedSymptoms((prev) => [...prev, symptom])
      setMessages((prev) => [
        ...prev,
        { text: symptom.Name, isUser: true },
        {
          text: `I've added "${symptom.Name}" to your symptoms. Any other symptoms you're experiencing?`,
          isUser: false,
        },
      ])
      setInput("")
      setFilteredSymptoms([])
    }
  }

  const handleAddSymptom = () => {
    if (input.trim()) {
      // First check if the input matches any symptom exactly
      const exactMatch = symptoms.find((symptom) => symptom.Name.toLowerCase() === input.toLowerCase())

      if (exactMatch) {
        selectSymptom(exactMatch)
      } else if (filteredSymptoms.length > 0) {
        // If no exact match but we have suggestions, use the first suggestion
        selectSymptom(filteredSymptoms[0])
      } else {
        // No matches at all
        setMessages((prev) => [
          ...prev,
          { text: input, isUser: true },
          {
            text: "I couldn't find that symptom in our database. Can you try describing it differently?",
            isUser: false,
          },
        ])
        setInput("")
      }
    }
  }

  const removeSymptom = (symptomId: number) => {
    setSelectedSymptoms((prev) => prev.filter((s) => s.ID !== symptomId))
    setMessages((prev) => [...prev, { text: "I've removed that symptom from your list.", isUser: false }])
  }

  const handleGetDiagnosis = async () => {
    if (selectedSymptoms.length === 0) {
      setMessages((prev) => [
        ...prev,
        { text: "Please add at least one symptom before I can suggest a specialist.", isUser: false },
      ])
      return
    }

    setIsProcessingDiagnosis(true)
    setMessages((prev) => [
      ...prev,
      { text: "Analyzing your symptoms to find the right specialist for you...", isUser: false },
    ])

    try {
      const response = await fetch("/api/diagnosis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symptoms: selectedSymptoms.map((s) => s.ID),
          gender: "male", // In a real app, you'd get this from user input
          yearOfBirth: 1990, // In a real app, you'd get this from user input
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const diagnosisResult = await response.json()
      setDiagnosisResults(diagnosisResult)

      if (diagnosisResult && diagnosisResult.length > 0) {
        const topDiagnosis = diagnosisResult[0]
        const topSpecialization = topDiagnosis.Specialisation[0].Name

        setSelectedSpecialty(topSpecialization)

        setMessages((prev) => [
          ...prev,
          {
            text: `Based on your symptoms, I suggest consulting a ${topSpecialization} specialist. The most likely condition could be related to ${topDiagnosis.Issue.Name} (${Math.round(topDiagnosis.Issue.Accuracy)}% match).

Would you like to schedule a consultation with a ${topSpecialization}?`,
            isUser: false,
          },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            text: "I couldn't determine a specific specialist based on your symptoms. You might want to consult a General Practitioner first.",
            isUser: false,
          },
        ])
        setSelectedSpecialty("General Practitioner")
      }
    } catch (error) {
      console.error("Error getting diagnosis:", error)
      setMessages((prev) => [
        ...prev,
        {
          text: "I'm sorry, I couldn't analyze your symptoms at the moment. Please try again later or select a specialist directly.",
          isUser: false,
        },
      ])
    } finally {
      setIsProcessingDiagnosis(false)
    }
  }

  const handleProceed = () => {
    // Get specialization from diagnosis results if available
    let specialization = selectedSpecialty
    
    // Try to extract specialization from the last bot message if available
    const lastBotMessage = messages.filter(msg => !msg.isUser).pop()
    if (lastBotMessage) {
      const match = lastBotMessage.text.match(/consulting a (.*?) specialist/i)
      if (match && match[1]) {
        specialization = match[1]
      }
    }
    
    // If we have diagnosis results, use the first one's specialization
    if (diagnosisResults && diagnosisResults.length > 0 && diagnosisResults[0].Specialisation.length > 0) {
      specialization = diagnosisResults[0].Specialisation[0].Name
    }
    
    // Default to General Practitioner if no specialization is found
    specialization = specialization || "General Practitioner"
    
    // Navigate to the booking page with the specialization
    router.push(`/video-consult/book?specialty=${encodeURIComponent(specialization)}`)
  }

  const handleConcernClick = (concern: (typeof commonConcerns)[0]) => {
    setIsChatOpen(true)
    setMessages((prev) => [
      ...prev,
      { text: `I'm interested in a consultation about ${concern.name}`, isUser: true },
      {
        text: `I can help you with ${concern.name}. Common symptoms include: ${concern.symptoms.join(", ")}. Are you experiencing any of these symptoms?`,
        isUser: false,
      },
    ])
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddSymptom()
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="bg-green-50 dark:bg-green-900 rounded-lg p-8 mb-12">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-6 md:mb-0">
            <h1 className="text-4xl font-bold text-green-800 dark:text-green-100 mb-4">Skip the travel!</h1>
            <h2 className="text-2xl font-semibold text-green-700 dark:text-green-200 mb-4">
              Take Online Doctor Consultation
            </h2>
            <p className="text-green-600 dark:text-green-300 mb-6">Private consultation • Starts at Rs.199</p>
            <Button
              size="lg"
              onClick={() => setIsChatOpen(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              Start Symptom Check
            </Button>
          </div>
          <div className="md:w-1/2">
            <Image
              src="https://res.cloudinary.com/dcnvcfc2a/image/upload/v1742320103/Dr._sunita_Reddy_rcogwv.jpg"
              alt="Online Doctor Consultation"
              width={500}
              height={300}
              className="rounded-lg shadow-md"
            />
          </div>
        </div>
      </section>

      {/* Chat Interface */}
      {isChatOpen && (
        <Card className="mb-12 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-green-800 dark:text-green-200">Symptom Checker</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsChatOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Selected Symptoms */}
            {selectedSymptoms.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Your symptoms:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedSymptoms.map((symptom) => (
                    <Badge
                      key={symptom.ID}
                      variant="secondary"
                      className="flex items-center gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                    >
                      {symptom.Name}
                      <button
                        onClick={() => removeSymptom(symptom.ID)}
                        className="ml-1 rounded-full hover:bg-green-200 dark:hover:bg-green-800 p-0.5"
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove {symptom.Name}</span>
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Messages */}
            <div
              ref={chatContainerRef}
              className="mb-4 h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-md p-4"
            >
              {messages.map((message, index) => (
                <div key={index} className={`mb-3 ${message.isUser ? "text-right" : "text-left"}`}>
                  <div
                    className={`inline-block p-3 rounded-lg max-w-[80%] ${
                      message.isUser
                        ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              {isProcessingDiagnosis && (
                <div className="flex items-center justify-center my-4">
                  <Loader2 className="h-5 w-5 animate-spin text-green-600 dark:text-green-400 mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Analyzing symptoms...</span>
                </div>
              )}
            </div>

            {/* Symptom Input */}
            <div className="relative">
              <div className="flex">
                <Input
                  type="text"
                  value={input}
                  onChange={handleSymptomInput}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter a symptom (e.g., headache, cough)"
                  className="flex-grow rounded-r-none border-r-0 focus-visible:ring-green-500"
                  disabled={isProcessingDiagnosis}
                />
                <Button
                  onClick={handleAddSymptom}
                  className="rounded-l-none bg-green-600 hover:bg-green-700"
                  disabled={isProcessingDiagnosis}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* Symptom Suggestions */}
              {filteredSymptoms.length > 0 && (
                <ul className="absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md mt-1 shadow-lg max-h-60 overflow-auto">
                  {filteredSymptoms.map((symptom) => (
                    <li
                      key={symptom.ID}
                      className="px-4 py-2 hover:bg-green-50 dark:hover:bg-green-900 cursor-pointer"
                      onClick={() => selectSymptom(symptom)}
                    >
                      {symptom.Name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Get Diagnosis Button */}
            <Button
              onClick={handleGetDiagnosis}
              className="w-full mt-4 bg-green-600 hover:bg-green-700"
              disabled={selectedSymptoms.length === 0 || isProcessingDiagnosis}
            >
              {isProcessingDiagnosis ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Symptoms
                </>
              ) : (
                "Get Specialist Recommendation"
              )}
            </Button>

            {/* Diagnosis Results */}
            {diagnosisResults.length > 0 && selectedSpecialty && (
              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                <h4 className="font-semibold text-green-800 dark:text-green-100 mb-2">
                  Recommended Specialist: {selectedSpecialty}
                </h4>
                <Button onClick={handleProceed} className="w-full mt-2 bg-green-600 hover:bg-green-700">
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Consultation
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Specialties Section */}
      <section id="specialties" className="mb-12">
        <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-6">Choose a Specialty</h2>
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-green-600 dark:text-green-400 mr-2" />
            <p className="text-gray-600 dark:text-gray-400">Loading specialties...</p>
          </div>
        ) : error ? (
          <div className="text-red-500 flex items-center justify-center p-8">
            <span>{error}</span>
            <button
              onClick={fetchSpecialties}
              className="ml-4 p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
              aria-label="Retry loading specialties"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        ) : specialties.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center p-8">No specialties available at the moment.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {specialties.map((specialty) => (
              <TooltipProvider key={specialty._id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setSelectedSpecialty(specialty.name)}
                      className={`p-4 rounded-md text-center transition-colors ${
                        selectedSpecialty === specialty.name
                          ? "bg-green-600 text-white dark:bg-green-700"
                          : "bg-white dark:bg-gray-800 text-gray-800 dark:text-white hover:bg-green-100 dark:hover:bg-green-900"
                      }`}
                    >
                      <div className="text-4xl mb-2">{specialty.icon}</div>
                      <h3 className="font-semibold">{specialty.name}</h3>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Consult with a {specialty.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        )}
      </section>

      {/* Booking Section */}
      {selectedSpecialty && (
        <Card className="mb-12 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4 text-green-800 dark:text-green-200">
              Book a Video Consultation with a {selectedSpecialty}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Get expert medical advice from the comfort of your home.
            </p>
            <Button onClick={handleProceed} className="flex items-center bg-green-600 hover:bg-green-700">
              <Calendar className="mr-2 h-5 w-5" />
              Schedule Now
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Common Health Concerns Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-6">Common Health Concerns</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {commonConcerns.map((concern, index) => (
            <Card key={index} className="overflow-hidden border-green-200 dark:border-green-800">
              <div className="relative h-40">
                <Image src={concern.image || "/placeholder.svg"} alt={concern.name} fill className="object-cover" />
              </div>
              <CardContent className="p-4">
                <h3 className="text-green-700 dark:text-green-300 font-semibold mb-2">{concern.name}</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleConcernClick(concern)}
                  className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 border-green-600 hover:border-green-700 dark:border-green-400 dark:hover:border-green-300"
                >
                  Consult Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Offers Section */}
      <section className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-green-800 dark:text-green-100 mb-4">
                Download the App & get $200 HealthCash
              </h3>
              <Button className="bg-green-600 hover:bg-green-700">Download App</Button>
            </CardContent>
          </Card>
          <Card className="bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-green-800 dark:text-green-100 mb-4">
                Consult with specialists at just $199
              </h3>
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsChatOpen(true)}>
                Consult Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it works Section */}
      <section>
        <h2 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-6">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="bg-green-100 dark:bg-green-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-green-800 dark:text-green-200">1</span>
              </div>
              <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">Check Your Symptoms</h3>
              <p className="text-green-600 dark:text-green-400">
                Use our symptom checker to get a specialist recommendation
              </p>
            </CardContent>
          </Card>
          <Card className="text-center border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="bg-green-100 dark:bg-green-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-green-800 dark:text-green-200">2</span>
              </div>
              <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">Book a Consultation</h3>
              <p className="text-green-600 dark:text-green-400">Select a convenient time slot for your consultation</p>
            </CardContent>
          </Card>
          <Card className="text-center border-green-200 dark:border-green-800">
            <CardContent className="p-6">
              <div className="bg-green-100 dark:bg-green-900 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-green-800 dark:text-green-200">3</span>
              </div>
              <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">Consult with Doctor</h3>
              <p className="text-green-600 dark:text-green-400">
                Connect with the doctor via video call at the scheduled time
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}