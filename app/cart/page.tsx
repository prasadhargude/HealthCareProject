'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Plus, Minus } from 'lucide-react'

interface CartItem {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  quantity: number;
}

// This would typically come from a database or API
const getCartItems = async (): Promise<CartItem[]> => {
  // Simulating an API call
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return [
    { id: 1, name: 'Paracetamol', price: 5.99, description: 'Pain reliever', image: '/placeholder.svg?height=100&width=100', quantity: 2 },
    { id: 2, name: 'Amoxicillin', price: 12.99, description: 'Antibiotic', image: '/placeholder.svg?height=100&width=100', quantity: 1 },
  ]
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchCartItems = async () => {
      const fetchedItems = await getCartItems()
      setCart(fetchedItems)
    }
    fetchCartItems()
  }, [])

  const updateQuantity = (id: number, newQuantity: number) => {
    setCart(cart.map(item => 
      item.id === id ? { ...item, quantity: Math.max(1, newQuantity) } : item
    ))
  }

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id))
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = 5.99
  const total = subtotal + shipping

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Your Cart</h1>
      {cart.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-300">Your cart is empty.</p>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            {cart.map(item => (
              <div key={item.id} className="flex items-center bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-4 transition-transform duration-300 hover:scale-102">
                <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded mr-4" />
                <div className="flex-grow">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{item.name}</h2>
                  <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
                  <p className="text-lg font-bold text-gray-800 dark:text-white">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 bg-gray-200 rounded-full">
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="mx-2 text-gray-800 dark:text-white">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 bg-gray-200 rounded-full">
                    <Plus className="w-5 h-5" />
                  </button>
                  <button onClick={() => removeFromCart(item.id)} className="ml-4 text-red-500 hover:text-red-700 transition-colors duration-300">
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
                <span className="text-gray-800 dark:text-white">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-300">Shipping:</span>
                <span className="text-gray-800 dark:text-white">${shipping.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
              <div className="flex justify-between mb-4">
                <span className="text-xl font-bold text-gray-800 dark:text-white">Total:</span>
                <span className="text-xl font-bold text-gray-800 dark:text-white">${total.toFixed(2)}</span>
              </div>
              <button
                onClick={() => router.push('/checkout')}
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