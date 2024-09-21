'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ShoppingCart, Star } from 'lucide-react'

interface Medicine {
  id: number;
  name: string;
  price: number;
  description: string;
  rating: number;
  reviews: number;
  image: string;
}

// This would typically come from a database or API
const getMedicines = async (): Promise<Medicine[]> => {
  // Simulating an API call
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return [
    { id: 1, name: 'Paracetamol', price: 5.99, description: 'Pain reliever and fever reducer', rating: 4.5, reviews: 2345, image: '/placeholder.svg?height=200&width=200' },
    { id: 2, name: 'Amoxicillin', price: 12.99, description: 'Antibiotic', rating: 4.2, reviews: 1876, image: '/placeholder.svg?height=200&width=200' },
    { id: 3, name: 'Lisinopril', price: 15.99, description: 'ACE inhibitor for high blood pressure', rating: 4.7, reviews: 3210, image: '/placeholder.svg?height=200&width=200' },
    { id: 4, name: 'Metformin', price: 8.99, description: 'Oral diabetes medicine', rating: 4.4, reviews: 2789, image: '/placeholder.svg?height=200&width=200' },
    { id: 5, name: 'Omeprazole', price: 10.99, description: 'Proton pump inhibitor for acid reflux', rating: 4.6, reviews: 1987, image: '/placeholder.svg?height=200&width=200' },
    { id: 6, name: 'Levothyroxine', price: 14.99, description: 'Thyroid hormone', rating: 4.3, reviews: 2456, image: '/placeholder.svg?height=200&width=200' },
  ]
}

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState<Medicine[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchMedicines = async () => {
      const fetchedMedicines = await getMedicines()
      setMedicines(fetchedMedicines)
    }
    fetchMedicines()
  }, [])

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const addToCart = (medicine: Medicine) => {
    setCart([...cart, medicine])
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Medicines</h1>
      <div className="mb-8 flex justify-between items-center">
        <div className="flex-grow mr-4">
          <div className="flex">
            <input
              type="text"
              placeholder="Search medicines"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-2 border border-gray-300 rounded-l-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <button className="bg-green-600 text-white p-2 rounded-r-md hover:bg-green-700">
              <Search className="w-6 h-6" />
            </button>
          </div>
        </div>
        <button
          onClick={() => router.push('/cart')}
          className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-300"
        >
          <ShoppingCart className="w-6 h-6 mr-2" />
          <span>Cart ({cart.length})</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMedicines.map(medicine => (
          <div key={medicine.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-transform duration-300 hover:scale-105">
            <img src={medicine.image} alt={medicine.name} className="w-full h-48 object-cover mb-4 rounded" />
            <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">{medicine.name}</h2>
            <div className="flex items-center mb-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className={`w-5 h-5 ${index < Math.floor(medicine.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
              ))}
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">({medicine.reviews})</span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-2">{medicine.description}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white mb-4">${medicine.price.toFixed(2)}</p>
            <button 
              onClick={() => addToCart(medicine)}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-300"
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}