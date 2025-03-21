"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { FileText, Download, Calendar, User, Pill, FlaskRoundIcon as Flask, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react'
import Image from "next/image"

interface Doctor {
  id: string
  name: string
  specialty: string
  image: string
}

interface MedicalRecord {
  id: string
  type: "prescription" | "lab-result" | "diagnosis" | "vaccination" | "surgery"
  title: string
  date: string
  doctor: Doctor
  description: string
  files?: Array<{
    id: string
    name: string
    url: string
    type: string
  }>
  details?: Record<string, any>
}

export default function MedicalRecordsPage() {
  const { data: session } = useSession()
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [expandedRecords, setExpandedRecords] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchMedicalRecords = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/medical-records")
        
        if (response.ok) {
          const data = await response.json()
          setRecords(data)
        } else {
          // If API fails, use mock data
          setRecords([
            {
              id: "rec1",
              type: "prescription",
              title: "Amoxicillin Prescription",
              date: "2023-05-15",
              doctor: {
                id: "doc1",
                name: "Dr. Sarah Johnson",
                specialty: "General Physician",
                image: "/placeholder.svg?height=48&width=48"
              },
              description: "Prescribed for bacterial infection",
              details: {
                medication: "Amoxicillin",
                dosage: "500mg",
                frequency: "3 times daily",
                duration: "7 days"
              },
              files: [
                {
                  id: "file1",
                  name: "Prescription_May2023.pdf",
                  url: "#",
                  type: "pdf"
                }
              ]
            },
            {
              id: "rec2",
              type: "lab-result",
              title: "Complete Blood Count (CBC)",
              date: "2023-04-20",
              doctor: {
                id: "doc2",
                name: "Dr. Michael Chen",
                specialty: "Hematologist",
                image: "/placeholder.svg?height=48&width=48"
              },
              description: "Routine blood work",
              details: {
                hemoglobin: "14.2 g/dL",
                whiteBloodCells: "7.5 x 10^9/L",
                platelets: "250 x 10^9/L",
                result: "Normal"
              },
              files: [
                {
                  id: "file2",
                  name: "CBC_Results_Apr2023.pdf",
                  url: "#",
                  type: "pdf"
                }
              ]
            },
            {
              id: "rec3",
              type: "diagnosis",
              title: "Seasonal Allergies",
              date: "2023-03-10",
              doctor: {
                id: "doc3",
                name: "Dr. Emily Rodriguez",
                specialty: "Allergist",
                image: "/placeholder.svg?height=48&width=48"
              },
              description: "Diagnosed with seasonal pollen allergies",
              details: {
                symptoms: "Sneezing, itchy eyes, congestion",
                severity: "Mild to moderate",
                triggers: "Tree pollen, grass pollen"
              }
            },
            {
              id: "rec4",
              type: "vaccination",
              title: "COVID-19 Vaccination",
              date: "2023-02-05",
              doctor: {
                id: "doc4",
                name: "Dr. James Wilson",
                specialty: "Immunologist",
                image: "/placeholder.svg?height=48&width=48"
              },
              description: "COVID-19 booster shot",
              details: {
                vaccine: "Pfizer-BioNTech",
                doseNumber: "3 (Booster)",
                lotNumber: "FC3809",
                site: "Left arm"
              }
            },
            {
              id: "rec5",
              type: "surgery",
              title: "Appendectomy",
              date: "2022-11-12",
              doctor: {
                id: "doc5",
                name: "Dr. Lisa Patel",
                specialty: "Surgeon",
                image: "/placeholder.svg?height=48&width=48"
              },
              description: "Emergency appendix removal",
              details: {
                procedure: "Laparoscopic appendectomy",
                anesthesia: "General",
                duration: "45 minutes",
                complications: "None"
              },
              files: [
                {
                  id: "file3",
                  name: "Surgical_Report_Nov2022.pdf",
                  url: "#",
                  type: "pdf"
                },
                {
                  id: "file4",
                  name: "Post_Op_Instructions.pdf",
                  url: "#",
                  type: "pdf"
                }
              ]
            }
          ])
        }
      } catch (error) {
        console.error("Error fetching medical records:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchMedicalRecords()
    }
  }, [session])

  const toggleRecordExpansion = (recordId: string) => {
    setExpandedRecords(prev => ({
      ...prev,
      [recordId]: !prev[recordId]
    }))
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('en-US', options)
  }

  const getRecordTypeIcon = (type: string) => {
    switch (type) {
      case "prescription":
        return <Pill className="w-5 h-5" />
      case "lab-result":
        return <Flask className="w-5 h-5" />
      case "diagnosis":
        return <FileText className="w-5 h-5" />
      case "vaccination":
        return <User className="w-5 h-5" />
      case "surgery":
        return <User className="w-5 h-5" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  const getRecordTypeLabel = (type: string) => {
    switch (type) {
      case "prescription":
        return "Prescription"
      case "lab-result":
        return "Lab Result"
      case "diagnosis":
        return "Diagnosis"
      case "vaccination":
        return "Vaccination"
      case "surgery":
        return "Surgery"
      default:
        return type.charAt(0).toUpperCase() + type.slice(1)
    }
  }

  const getRecordTypeBadgeClass = (type: string) => {
    switch (type) {
      case "prescription":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "lab-result":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
      case "diagnosis":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "vaccination":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "surgery":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    }
  }

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          record.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          record.doctor.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = selectedType ? record.type === selectedType : true
    
    return matchesSearch && matchesType
  })

  const recordTypes = Array.from(new Set(records.map(record => record.type)))

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Medical Records</h1>
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
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
        <h1 className="text-3xl font-bold mb-8">Medical Records</h1>
        
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
          
          <div className="w-full md:w-auto">
            <div className="relative">
              <select
                value={selectedType || ""}
                onChange={(e) => setSelectedType(e.target.value || null)}
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-green-500 focus:border-green-500 appearance-none"
              >
                <option value="">All Record Types</option>
                {recordTypes.map(type => (
                  <option key={type} value={type}>
                    {getRecordTypeLabel(type)}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
        
        {filteredRecords.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Records Found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || selectedType 
                ? "No records match your search criteria. Try adjusting your filters."
                : "You don't have any medical records yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((record) => (
              <div key={record.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <div 
                  className="p-6 cursor-pointer"
                  onClick={() => toggleRecordExpansion(record.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${getRecordTypeBadgeClass(record.type)}`}>
                          {getRecordTypeIcon(record.type)}
                          <span className="ml-1">{getRecordTypeLabel(record.type)}</span>
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(record.date)}
                        </span>
                      </div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{record.title}</h2>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">{record.description}</p>
                      
                      <div className="flex items-center mt-3">
                        <Image
                          src={record.doctor.image || "/placeholder.svg"}
                          alt={record.doctor.name}
                          width={24}
                          height={24}
                          className="rounded-full mr-2"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {record.doctor.name} ({record.doctor.specialty})
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      {expandedRecords[record.id] ? (
                        <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
                
                {expandedRecords[record.id] && (
                  <div className="px-6 pb-6 pt-2 border-t border-gray-200 dark:border-gray-700">
                    {record.details && (
                      <div className="mb-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Details</h3>
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4">
                          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                            {Object.entries(record.details).map(([key, value]) => (
                              <div key={key} className="flex flex-col">
                                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                  {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                                </dt>
                                <dd className="text-sm text-gray-900 dark:text-white">{value}</dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      </div>
                    )}
                    
                    {record.files && record.files.length > 0 && (
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Files</h3>
                        <div className="space-y-2">
                          {record.files.map((file) => (
                            <div key={file.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-md p-3">
                              <div className="flex items-center">
                                <FileText className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
                                <span className="text-sm text-gray-900 dark:text-white">{file.name}</span>
                              </div>
                              <button className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800">
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}