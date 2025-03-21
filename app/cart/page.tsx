"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useSession } from "next-auth/react"
import { toast } from "react-hot-toast"

interface CartItem {
  _id: string
  medicineId: string
  quantity: number
  medicine: {
    _id: string
    name: string
    price: number
    description: string
    image: string
    requiresPrescription: boolean
  }
}

interface CartSummary {
  items: CartItem[]
  subtotal: number
  shipping: number
  total: number
}

export default function CartPage() {
  const [cart, setCart] = useState<CartSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { data: session, status } = useSession()
  const isAuthenticated = status === "authenticated"

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setIsLoading(true)
        
        if (!isAuthenticated) {
          // Handle unauthenticated users with local storage
          const localCart = localStorage.getItem('cart')
          if (localCart) {
            const items = JSON.parse(localCart)
            const cartItems = items.map((medicine: any) => ({
              _id: medicine._id,
              medicineId: medicine._id,
              quantity: 1,
              medicine
            }))
            
            const subtotal = cartItems.reduce((sum: number, item: CartItem) => {
              return sum + item.medicine.price * item.quantity
            }, 0)
            
            const shipping = cartItems.length > 0 ? 5.99 : 0
            const total = subtotal + shipping
            
            setCart({
              items: cartItems,
              subtotal,
              shipping,
              total
            })
          } else {
            setCart({
              items: [],
              subtotal: 0,
              shipping: 0,
              total: 0
            })
          }
          setIsLoading(false)
          return
        }
        
        // For authenticated users, fetch from API
        const response = await fetch("/api/cart")

        if (response.ok) {
          const data = await response.json()
          setCart(data)
        } else if (response.status === 401) {
          // If unauthorized, redirect to sign in
          toast.error("Please sign in to view your cart")
          router.push('/signin')
        } else {
          throw new Error("Failed to fetch cart")
        }
      } catch (error) {
        console.error("Error fetching cart:", error)
        toast.error("Failed to load cart")
      } finally {
        setIsLoading(false)
      }
    }

    fetchCart()
  }, [isAuthenticated, router])

  const updateQuantity = async (id: string, newQuantity: number) => {
    if (!isAuthenticated) {
      // Handle local storage cart
      const localCart = localStorage.getItem('cart')
      if (localCart) {
        const items = JSON.parse(localCart)
        const updatedItems = items.map((medicine: any) => {
          if (medicine._id === id) {
            return { ...medicine, quantity: newQuantity }
          }
          return medicine
        })
        
        localStorage.setItem('cart', JSON.stringify(updatedItems))
        
        // Update cart state
        if (cart) {
          const updatedCartItems = cart.items.map(item => {
            if (item.medicineId === id) {
              return { ...item, quantity: newQuantity }
            }
            return item
          })
          
          const subtotal = updatedCartItems.reduce((sum, item) => {
            return sum + item.medicine.price * item.quantity
          }, 0)
          
          const shipping = updatedCartItems.length > 0 ? 5.99 : 0
          const total = subtotal + shipping
          
          setCart({
            items: updatedCartItems,
            subtotal,
            shipping,
            total
          })
        }
        return
      }
    }
    
    try {
      const response = await fetch(`/api/cart/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: newQuantity }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Please sign in to update your cart")
          router.push('/signin')
          return
        }
        throw new Error("Failed to update quantity")
      }

      // Refresh cart data
      const cartResponse = await fetch("/api/cart")
      const cartData = await cartResponse.json()
      setCart(cartData)
    } catch (error) {
      console.error("Error updating quantity:", error)
      toast.error("Failed to update quantity")
    }
  }

  const removeFromCart = async (id: string) => {
    if (!isAuthenticated) {
      // Handle local storage cart
      const localCart = localStorage.getItem('cart')
      if (localCart) {
        const items = JSON.parse(localCart)
        const updatedItems = items.filter((medicine: any) => medicine._id !== id)
        
        localStorage.setItem('cart', JSON.stringify(updatedItems))
        
        // Update cart state
        if (cart) {
          const updatedCartItems = cart.items.filter(item => item.medicineId !== id)
          
          const subtotal = updatedCartItems.reduce((sum, item) => {
            return sum + item.medicine.price * item.quantity
          }, 0)
          
          const shipping = updatedCartItems.length > 0 ? 5.99 : 0
          const total = subtotal + shipping
          
          setCart({
            items: updatedCartItems,
            subtotal,
            shipping,
            total
          })
        }
        return
      }
    }
    
    try {
      const response = await fetch(`/api/cart/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Please sign in to remove items from your cart")
          router.push('/signin')
          return
        }
        throw new Error("Failed to remove item")
      }

      // Refresh cart data
      const cartResponse = await fetch("/api/cart")
      const cartData = await cartResponse.json()
      setCart(cartData)
    } catch (error) {
      console.error("Error removing item:", error)
      toast.error("Failed to remove item")
    }
  }

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to checkout")
      router.push('/signin')
      return
    }
    
    router.push("/checkout")
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Your Cart</h1>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3 space-y-4">
            {[...Array(2)].map((_, index) => (
              <div
                key={index}
                className="bg-gray-200 dark:bg-gray-700 p-4 rounded-lg shadow-md animate-pulse h-32"
              ></div>
            ))}
          </div>
          <div className="lg:w-1/3">
            <div className="bg-gray-200 dark:bg-gray-700 p-6 rounded-lg shadow-md animate-pulse h-64"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Your Cart</h1>
      {!cart || cart.items.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-300 mb-6">Your cart is empty.</p>
          <button
            onClick={() => router.push("/medicines")}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
          >
            Browse Medicines
          </button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            {cart.items.map((item) => (
              <div
                key={item._id}
                className="flex items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-4 transition-transform duration-300 hover:scale-102"
              >
                <img
                  src={item.medicine.image || `/placeholder.svg?height=100&width=100`}
                  alt={item.medicine.name}
                  className="w-24 h-24 object-cover rounded mr-4"
                />
                <div className="flex-grow">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{item.medicine.name}</h2>
                  <p className="text-gray-600 dark:text-gray-300">{item.medicine.description}</p>
                  <p className="text-lg font-bold text-gray-800 dark:text-white">₹{item.medicine.price.toFixed(2)}</p>
                  {item.medicine.requiresPrescription && (
                    <span className="inline-block px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      Prescription Required
                    </span>
                  )}
                </div>
                <div className="flex items-center">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="p-1 bg-gray-200 rounded-full"
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="mx-2 text-gray-800 dark:text-white">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="p-1 bg-gray-200 rounded-full"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="ml-4 text-red-500 hover:text-red-700 transition-colors duration-300"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:w-1/3">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Order Summary</h2>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-300">Subtotal:</span>
                <span className="text-gray-800 dark:text-white">₹{cart.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-300">Shipping:</span>
                <span className="text-gray-800 dark:text-white">₹{cart.shipping.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
              <div className="flex justify-between mb-4">
                <span className="text-xl font-bold text-gray-800 dark:text-white">Total:</span>
                <span className="text-xl font-bold text-gray-800 dark:text-white">₹{cart.total.toFixed(2)}</span>
              </div>
              
              {!isAuthenticated && (
                <div className="bg-yellow-50 dark:bg-yellow-900/30 p-3 rounded-md mb-4">
                  <p className="text-yellow-800 dark:text-yellow-400 text-sm">
                    Please sign in to complete your purchase
                  </p>
                </div>
              )}
              
              <button
                onClick={handleCheckout}
                className="w-full bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors duration-300"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}