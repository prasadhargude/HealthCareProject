"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { ShoppingBag, Calendar, Package, Truck, CheckCircle, AlertCircle, ChevronDown, ChevronUp, Search, Filter } from 'lucide-react'
import Link from "next/link"
import Image from "next/image"

// Updated interface to match MongoDB schema
interface OrderItem {
  medicineId: {
    $oid: string
  }
  name: string
  price: number
  quantity: number
  _id: {
    $oid: string
  }
  image?: string
}

interface Order {
  _id: {
    $oid: string
  }
  userId: string
  items: OrderItem[]
  totalAmount: number
  shippingAddress: {
    name: string
    street: string
    city: string
    state: string
    zipCode: string
  }
  paymentStatus: string
  orderStatus: string
  prescriptionImage?: string
  createdAt: {
    $date: string
  }
}

export default function OrdersPage() {
  const { data: session } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({})
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/orders")
        
        if (response.ok) {
          const data = await response.json()
          setOrders(data)
        } else {
          throw new Error("Failed to fetch orders")
        }
      } catch (error) {
        console.error("Error fetching orders:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchOrders()
    }
  }, [session])

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }))
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('en-US', options)
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "processing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
      case "shipped":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processing":
        return <Package className="w-4 h-4 mr-1" />
      case "shipped":
        return <Truck className="w-4 h-4 mr-1" />
      case "delivered":
        return <CheckCircle className="w-4 h-4 mr-1" />
      case "cancelled":
        return <AlertCircle className="w-4 h-4 mr-1" />
      default:
        return null
    }
  }

  // Fixed the filtering function to safely handle properties
  const filteredOrders = orders.filter(order => {
    // Generate an order number from the ID if it doesn't exist
    const orderNumber = `ORD-${order._id.$oid.substring(0, 8)}`;

    
    const matchesSearch = 
      // Search by generated order number
      orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
      // Search by item names
      order.items.some(item => 
        item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesStatus = statusFilter ? order.orderStatus === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Your Orders</h1>
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            {[...Array(3)].map((_, i) => (
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
        <h1 className="text-3xl font-bold mb-8">Your Orders</h1>
        
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
          
          <div className="w-full md:w-auto">
            <div className="relative">
              <select
                value={statusFilter || ""}
                onChange={(e) => setStatusFilter(e.target.value || null)}
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white focus:outline-none focus:ring-green-500 focus:border-green-500 appearance-none"
              >
                <option value="">All Statuses</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
        
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
            <ShoppingBag className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Orders Found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchTerm || statusFilter 
                ? "No orders match your search criteria. Try adjusting your filters."
                : "You haven't placed any orders yet."}
            </p>
            {!searchTerm && !statusFilter && (
              <Link
                href="/medicines"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                Browse Medicines
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              // Generate an order number from the ID
              const orderNumber = `ORD-${order._id.$oid.substring(0, 8)}`;
              const orderDate = new Date(order.createdAt.$date).toISOString().split('T')[0];
              
              return (
                <div key={order._id.$oid} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                  <div 
                    className="p-6 cursor-pointer"
                    onClick={() => toggleOrderExpansion(order._id.$oid)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center mb-2 gap-2">
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Order #{orderNumber}
                          </h2>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(order.orderStatus)}`}>
                            {getStatusIcon(order.orderStatus)}
                            {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                          </span>
                        </div>
                        
                        <div className="flex flex-col md:flex-row md:items-center text-sm text-gray-500 dark:text-gray-400 gap-2 md:gap-4">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Ordered on {formatDate(orderDate)}
                          </span>
                          <span>₹{order.totalAmount.toFixed(2)}</span>
                          <span className="flex items-center">
                            <Package className="w-4 h-4 mr-1" />
                            Payment: {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        {expandedOrders[order._id.$oid] ? (
                          <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {expandedOrders[order._id.$oid] && (
                    <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="pt-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Order Items</h3>
                        <div className="space-y-4">
                          {order.items.map((item) => (
                            <div key={item._id.$oid} className="flex items-start">
                              <div className="flex-shrink-0">
                                <Image
                                  src={item.image || `/placeholder.svg?height=80&width=80&text=${item.name.charAt(0)}`}
                                  alt={item.name}
                                  width={80}
                                  height={80}
                                  className="rounded-md"
                                />
                              </div>
                              <div className="ml-4 flex-1">
                                <h4 className="text-md font-medium text-gray-900 dark:text-white">{item.name}</h4>
                                <div className="mt-1 flex justify-between">
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Qty: {item.quantity}
                                  </div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    ₹{(item.price * item.quantity).toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Shipping Address</h3>
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4">
                            <p className="font-medium text-gray-800 dark:text-white">{order.shippingAddress.name}</p>
                            <p className="text-gray-600 dark:text-gray-300 mt-1">
                              {order.shippingAddress.street}<br />
                              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Order Summary</h3>
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-4">
                            <div className="flex justify-between mb-2">
                              <span className="text-gray-600 dark:text-gray-300">Payment Status</span>
                              <span className="text-gray-800 dark:text-white">{order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                              <span className="text-gray-600 dark:text-gray-300">Order Date</span>
                              <span className="text-gray-800 dark:text-white">{formatDate(orderDate)}</span>
                            </div>
                            <div className="flex justify-between font-medium pt-2 border-t border-gray-200 dark:border-gray-600">
                              <span className="text-gray-800 dark:text-white">Total</span>
                              <span className="text-gray-800 dark:text-white">₹{order.totalAmount.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex flex-wrap gap-2">
                        <Link
                          href={`/orders/${order._id.$oid}`}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                        >
                          View Order Details
                        </Link>
                        {order.orderStatus === "delivered" && (
                          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600">
                            Download Invoice
                          </button>
                        )}
                        {order.orderStatus === "processing" && (
                          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-red-300 dark:border-gray-600 dark:hover:bg-gray-600">
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  )
}