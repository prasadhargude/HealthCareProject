'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle, Truck, Calendar } from 'lucide-react'

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  total: number;
  items: OrderItem[];
  shippingAddress: string;
  estimatedDelivery: string;
}

// This would typically come from a database or API
const getOrderDetails = async (): Promise<Order> => {
  // Simulating an API call
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return {
    id: '1234567890',
    total: 34.96,
    items: [
      { name: 'Paracetamol', quantity: 2, price: 5.99 },
      { name: 'Amoxicillin', quantity: 1, price: 12.99 },
    ],
    shippingAddress: '123 Main St, Anytown, CA 12345',
    estimatedDelivery: 'June 15, 2023',
  }
}

export default function OrderConfirmationPage() {
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    const fetchOrderDetails = async () => {
      const orderDetails = await getOrderDetails()
      setOrder(orderDetails)
    }
    fetchOrderDetails()
  }, [])

  if (!order) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <div className="flex items-center mb-6">
          <CheckCircle className="w-12 h-12 text-green-600 mr-4" />
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Order Placed Successfully!</h1>
        </div>
        <p className="text-xl mb-8 text-gray-600 dark:text-gray-300">Thank you for your purchase.</p>
        
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Order Details</h2>
          <p className="text-gray-600 dark:text-gray-300">Order Number: {order.id}</p>
          <p className="text-gray-600 dark:text-gray-300">Order Total: ${order.total.toFixed(2)}</p>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">Items Ordered</h3>
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-300">{item.name} x {item.quantity}</span>
              <span className="text-gray-600 dark:text-gray-300">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">Shipping Information</h3>
          <div className="flex items-center mb-2">
            <Truck className="w-5 h-5 text-green-600 mr-2" />
            <p className="text-gray-600 dark:text-gray-300">{order.shippingAddress}</p>
          </div>
          <div className="flex items-center">
            <Calendar className="w-5 h-5 text-green-600 mr-2" />
            <p className="text-gray-600 dark:text-gray-300">Estimated Delivery: {order.estimatedDelivery}</p>
          </div>
        </div>

        <div className="flex space-x-4">
          <Link href="/order-history" className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors duration-300">
            View Order History
          </Link>
          <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors duration-300">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}