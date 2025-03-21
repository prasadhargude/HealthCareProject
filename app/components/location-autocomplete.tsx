"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { MapPin } from "lucide-react"

// Common Indian cities for suggestions
const POPULAR_LOCATIONS = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "Chandigarh",
  "Kochi",
  "Indore",
  "Bhopal",
  "Surat",
]

interface LocationAutocompleteProps {
  onLocationSelect: (location: string) => void
  value: string
  className?: string
}

export default function LocationAutocomplete({ onLocationSelect, value, className = "" }: LocationAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value || "")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim() === "") {
      setSuggestions([])
      return
    }

    const filteredSuggestions = POPULAR_LOCATIONS.filter((location) =>
      location.toLowerCase().includes(inputValue.toLowerCase()),
    )
    setSuggestions(filteredSuggestions)
  }, [inputValue])

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [wrapperRef])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    onLocationSelect(e.target.value)
    setIsOpen(true)
  }

  const handleSelectLocation = (location: string) => {
    setInputValue(location)
    onLocationSelect(location)
    setIsOpen(false)
  }

  return (
    <div className={`relative w-full ${className}`} ref={wrapperRef}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500" size={18} />
        <input
          type="text"
          placeholder="Enter your location"
          className="pl-10 p-4 border-0 rounded-lg w-full dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-green-400 shadow-md"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
        />
      </div>

      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg max-h-60 overflow-auto">
          {suggestions.map((location, index) => (
            <li
              key={index}
              className="px-4 py-3 cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center transition-colors duration-150"
              onClick={() => handleSelectLocation(location)}
            >
              <MapPin className="mr-2 text-green-500" size={16} />
              {location}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

