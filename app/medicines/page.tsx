"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, ShoppingCart, Star, Info } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useSession } from "next-auth/react"
import { toast } from "react-hot-toast"
import { getMedicineImageUrl } from "@/lib/medicine-service"

interface Medicine {
  _id: string
  name: string
  price: number
  description: string
  category: string
  rating: number
  reviews: number
  image: string
  stock: number
  requiresPrescription: boolean
  dosage: string
  manufacturer: string
  sideEffects: string
}

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [cartItems, setCartItems] = useState<Medicine[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null)
  const router = useRouter()
  const { data: session, status } = useSession()
  const isAuthenticated = status === "authenticated"

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/medicines${searchQuery ? `?search=${searchQuery}` : ""}`)

        if (!response.ok) {
          throw new Error("Failed to fetch medicines")
        }

        const data = await response.json()
        setMedicines(data)
      } catch (error) {
        console.error("Error fetching medicines:", error)
        toast.error("Failed to load medicines")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMedicines()
  }, [searchQuery])

  useEffect(() => {
    const fetchCart = async () => {
      if (!isAuthenticated) {
        // If not authenticated, use local storage cart
        const localCart = localStorage.getItem('cart')
        if (localCart) {
          setCartItems(JSON.parse(localCart))
        }
        return
      }
      
      try {
        const response = await fetch("/api/cart")

        if (response.ok) {
          const data = await response.json()
          setCartItems(data.items.map((item: any) => item.medicine))
          // Also update local storage
          localStorage.setItem('cart', JSON.stringify(data.items.map((item: any) => item.medicine)))
        } else if (response.status === 401) {
          // If unauthorized, use local storage
          const localCart = localStorage.getItem('cart')
          if (localCart) {
            setCartItems(JSON.parse(localCart))
          }
        }
      } catch (error) {
        console.error("Error fetching cart:", error)
        // On error, try to use local storage
        const localCart = localStorage.getItem('cart')
        if (localCart) {
          setCartItems(JSON.parse(localCart))
        }
      }
    }

    fetchCart()
  }, [isAuthenticated])

  const addToCart = async (medicine: Medicine) => {
    if (!isAuthenticated) {
      // If not authenticated, store in local storage and prompt to sign in
      const localCart = localStorage.getItem('cart') 
      const cart = localCart ? JSON.parse(localCart) : []
      const updatedCart = [...cart, medicine]
      localStorage.setItem('cart', JSON.stringify(updatedCart))
      setCartItems(updatedCart)
      
      toast.success(`${medicine.name} added to cart!`)
      toast((t) => (
        <div>
          <p>Sign in to save your cart</p>
          <button 
            className="bg-green-600 text-white px-4 py-2 rounded-md mt-2"
            onClick={() => {
              toast.dismiss(t.id)
              router.push('/signin')
            }}
          >
            Sign In
          </button>
        </div>
      ), { duration: 5000 })
      return
    }
    
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          medicineId: medicine._id,
          quantity: 1,
        }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          // If unauthorized, store in local storage and redirect to sign in
          const localCart = localStorage.getItem('cart') 
          const cart = localCart ? JSON.parse(localCart) : []
          const updatedCart = [...cart, medicine]
          localStorage.setItem('cart', JSON.stringify(updatedCart))
          setCartItems(updatedCart)
          
          toast.success(`${medicine.name} added to cart!`)
          router.push('/signin')
          return
        }
        throw new Error("Failed to add to cart")
      }

      setCartItems([...cartItems, medicine])
      toast.success(`${medicine.name} added to cart!`)
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast.error("Failed to add to cart. Please try again.")
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // The search is already handled by the useEffect
  }

  const openMedicineDetails = (medicine: Medicine) => {
    setSelectedMedicine(medicine)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Medicines</h1>
      <div className="mb-8 flex justify-between items-center">
        <div className="flex-grow mr-4">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              placeholder="Search medicines"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-2 border border-gray-300 rounded-l-md w-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <button type="submit" className="bg-green-600 text-white p-2 rounded-r-md hover:bg-green-700">
              <Search className="w-6 h-6" />
            </button>
          </form>
        </div>
        <button
          onClick={() => router.push("/cart")}
          className="flex items-center bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-300"
        >
          <ShoppingCart className="w-6 h-6 mr-2" />
          <span>Cart ({cartItems.length})</span>
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-gray-200 dark:bg-gray-700 p-6 rounded-lg shadow-md animate-pulse h-96"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {medicines.length === 0 ? (
            <p className="col-span-full text-center text-gray-600 dark:text-gray-300">
              No medicines found. Try a different search term.
            </p>
          ) : (
            medicines.map((medicine) => (
              <div
                key={medicine._id}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md transition-transform duration-300 hover:scale-105"
              >
                <img
                  src={getMedicineImageUrl(medicine.image) || "/placeholder.svg"}
                  alt={medicine.name}
                  className="w-full h-48 object-cover mb-4 rounded"
                />
                <h2 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">{medicine.name}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">By {medicine.manufacturer}</p>
                <div className="flex items-center mb-2">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={`w-5 h-5 ${index < Math.floor(medicine.rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">({medicine.reviews})</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">{medicine.description}</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-white mb-4">₹{medicine.price.toFixed(2)}</p>

                <div className="flex space-x-2">
                  <button
                    onClick={() => addToCart(medicine)}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-300"
                    disabled={medicine.stock <= 0}
                  >
                    {medicine.stock > 0 ? "Add to Cart" : "Out of Stock"}
                  </button>

                  <Dialog>
                    <DialogTrigger asChild>
                      <button
                        className="p-2 border border-gray-300 rounded-md hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                        onClick={() => openMedicineDetails(medicine)}
                      >
                        <Info className="w-5 h-5" />
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{medicine.name}</DialogTitle>
                        <DialogDescription>By {medicine.manufacturer}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div className="flex items-center">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                              key={index}
                              className={`w-4 h-4 ${index < Math.floor(medicine.rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                            />
                          ))}
                          <span className="ml-2 text-sm">({medicine.reviews} reviews)</span>
                        </div>

                        <p>{medicine.description}</p>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="font-semibold">Category</p>
                            <p>{medicine.category}</p>
                          </div>
                          <div>
                            <p className="font-semibold">Dosage</p>
                            <p>{medicine.dosage}</p>
                          </div>
                          <div>
                            <p className="font-semibold">Price</p>
                            <p>₹{medicine.price.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="font-semibold">Availability</p>
                            <p>{medicine.stock > 0 ? `In Stock (${medicine.stock})` : "Out of Stock"}</p>
                          </div>
                        </div>

                        <div>
                          <p className="font-semibold">Side Effects</p>
                          <p>{medicine.sideEffects}</p>
                        </div>

                        {medicine.requiresPrescription && (
                          <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-md text-sm">
                            <p className="font-semibold text-yellow-800 dark:text-yellow-400">Prescription Required</p>
                            <p className="text-yellow-700 dark:text-yellow-300">
                              This medicine requires a valid prescription. You will need to upload your prescription
                              during checkout.
                            </p>
                          </div>
                        )}

                        <div className="flex justify-end space-x-2 mt-4">
                          <button
                            onClick={() => addToCart(medicine)}
                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-300"
                            disabled={medicine.stock <= 0}
                          >
                            {medicine.stock > 0 ? "Add to Cart" : "Out of Stock"}
                          </button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}