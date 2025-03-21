"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, ArrowRight } from "lucide-react"
import LocationAutocomplete from "./location-autocomplete"

export default function SearchDoctors() {
  const [location, setLocation] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("doctors")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    if (activeTab === "doctors") {
      router.push(`/find-doctors?location=${encodeURIComponent(location)}&query=${encodeURIComponent(searchQuery)}`)
    } else {
      router.push(`/video-consult?location=${encodeURIComponent(location)}&query=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          className={`flex-1 py-4 px-6 text-center font-medium transition-colors duration-200 ${
            activeTab === "doctors"
              ? "text-green-600 dark:text-green-400 border-b-2 border-green-500"
              : "text-gray-600 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400"
          }`}
          onClick={() => setActiveTab("doctors")}
        >
          Find Doctors
        </button>
        <button
          className={`flex-1 py-4 px-6 text-center font-medium transition-colors duration-200 ${
            activeTab === "video"
              ? "text-green-600 dark:text-green-400 border-b-2 border-green-500"
              : "text-gray-600 dark:text-gray-300 hover:text-green-500 dark:hover:text-green-400"
          }`}
          onClick={() => setActiveTab("video")}
        >
          Video Consult
        </button>
      </div>

      <form onSubmit={handleSearch} className="p-6">
        <div className="space-y-4">
          <LocationAutocomplete onLocationSelect={setLocation} value={location} />

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500" size={18} />
            <input
              type="text"
              placeholder={
                activeTab === "doctors"
                  ? "Search doctors, specialties..."
                  : "Search specialists for video consultation..."
              }
              className="pl-10 p-4 border-0 rounded-lg w-full dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-green-400 shadow-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 flex items-center justify-center group"
          >
            <span className="mr-2">{activeTab === "doctors" ? "Find Doctors" : "Book Video Consult"}</span>
            <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </form>
    </div>
  )
}

