"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, Package, Truck, Home, ArrowLeft } from "lucide-react"

interface OrderItem {
  medicineId: string
  name: string
  price: number
  quantity: number
}

interface Order {
  _id: string
  items: OrderItem[]
  totalAmount: number
  shippingAddress: {
    name: string
    street: string
    city: string
    state: string
    zipCode: string
  }
  paymentId: string
  paymentOrderId: string
  paymentStatus: string
  orderStatus: string
  createdAt: string
}

export default function OrderConfirmationPage() {
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const router = useRouter()
  const searchParams = useSearchParams()

  const orderId = searchParams.get("orderId")

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        router.push("/medicines")
        return
      }

      try {
        setIsLoading(true)
        const response = await fetch(`/api/orders/${orderId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch order")
        }

        const orderData = await response.json()
        setOrder(orderData)
      } catch (error) {
        console.error("Error fetching order:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
  }, [orderId, router])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">Order Not Found</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            We couldn't find the order you're looking for. It may have been removed or the link is invalid.
          </p>
          <button
            onClick={() => router.push("/medicines")}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">Order Confirmed!</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Thank you for your order. Your order has been received and is being processed.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Order Details</h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Order Number</p>
              <p className="font-medium">{order._id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
              <p className="font-medium">{formatDate(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Payment Status</p>
              <p className="font-medium">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    order.paymentStatus === "completed"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                  }`}
                >
                  {order.paymentStatus === "completed" ? "Paid" : "Pending"}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Order Status</p>
              <p className="font-medium">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                </span>
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-6">
            <p className="font-medium mb-2">Items</p>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-500 dark:text-gray-400"> × {item.quantity}</span>
                  </div>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>₹{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Shipping Address</h2>
          <div className="flex items-start">
            <Home className="w-5 h-5 text-gray-400 mr-2 mt-0.5" />
            <div>
              <p className="font-medium">{order.shippingAddress.name}</p>
              <p className="text-gray-600 dark:text-gray-300">
                {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.zipCode}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Delivery Information</h2>
          <div className="space-y-6">
            <div className="flex">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div className="ml-4">
                <p className="font-medium">Order Confirmed</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(order.createdAt)}</p>
              </div>
            </div>

            <div className="flex">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400">
                <Package className="w-5 h-5" />
              </div>
              <div className="ml-4">
                <p className="font-medium">Processing Order</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Your order is being prepared</p>
              </div>
            </div>

            <div className="flex">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400">
                <Truck className="w-5 h-5" />
              </div>
              <div className="ml-4">
                <p className="font-medium">Out for Delivery</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Estimated delivery in 2-3 days</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => router.push("/medicines")}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  )
}

