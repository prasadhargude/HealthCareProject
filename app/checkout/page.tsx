"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Upload, Check } from "lucide-react"
import Script from "next/script"

declare global {
  interface Window {
    Razorpay: any
  }
}

interface CartSummary {
  items: Array<{
    _id: string
    medicineId: string
    quantity: number
    medicine: {
      _id: string
      name: string
      price: number
      description: string
      requiresPrescription: boolean
    }
  }>
  subtotal: number
  shipping: number
  total: number
}

interface Address {
  id: string
  name: string
  street: string
  city: string
  state: string
  zipCode: string
  isDefault: boolean
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartSummary | null>(null)
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [isAddingAddress, setIsAddingAddress] = useState(false)
  const [newAddress, setNewAddress] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    isDefault: false,
  })
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)

  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch cart data
        const cartResponse = await fetch("/api/cart")
        if (!cartResponse.ok) {
          throw new Error("Failed to fetch cart")
        }
        const cartData = await cartResponse.json()
        setCart(cartData)

        // Fetch addresses
        const addressResponse = await fetch("/api/user/addresses")
        if (addressResponse.ok) {
          const addressData = await addressResponse.json()
          setAddresses(addressData)

          // Set default address if available
          const defaultAddress = addressData.find((addr: Address) => addr.isDefault)
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id)
          } else if (addressData.length > 0) {
            setSelectedAddressId(addressData[0].id)
          }
        }
      } catch (error) {
        console.error("Error fetching checkout data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleAddressSelect = (id: string) => {
    setSelectedAddressId(id)
  }

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewAddress((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/user/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAddress),
      })

      if (!response.ok) {
        throw new Error("Failed to add address")
      }

      const address = await response.json()

      setAddresses((prev) => [...prev, address])
      setSelectedAddressId(address.id)
      setIsAddingAddress(false)
      setNewAddress({
        name: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        isDefault: false,
      })

      alert("Address added successfully!")
    } catch (error) {
      console.error("Error adding address:", error)
      alert("Failed to add address. Please try again.")
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setPrescriptionFile(e.target.files[0])
    }
  }

  const createOrder = async () => {
    try {
      // Validate required fields
      if (!selectedAddressId) {
        alert("Please select a shipping address")
        return null
      }

      // Check if prescription is required but not uploaded
      const requiresPrescription = cart?.items.some((item) => item.medicine.requiresPrescription) || false
      if (requiresPrescription && !prescriptionFile) {
        alert("Please upload a prescription for the prescription-only medicines in your cart")
        return null
      }

      // Get selected address
      const selectedAddress = addresses.find((addr) => addr.id === selectedAddressId)
      if (!selectedAddress) {
        throw new Error("Selected address not found")
      }

      // Prepare order items
      const orderItems =
        cart?.items.map((item) => ({
          medicineId: item.medicine._id,
          name: item.medicine.name,
          price: item.medicine.price,
          quantity: item.quantity,
        })) || []

      // Create order in database
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: orderItems,
          totalAmount: cart?.total || 0,
          shippingAddress: {
            name: selectedAddress.name,
            street: selectedAddress.street,
            city: selectedAddress.city,
            state: selectedAddress.state,
            zipCode: selectedAddress.zipCode,
          },
          prescriptionImage: prescriptionFile ? "prescription-uploaded" : undefined,
        }),
      })

      if (!orderResponse.ok) {
        throw new Error("Failed to create order")
      }

      const orderData = await orderResponse.json()
      return orderData._id
    } catch (error) {
      console.error("Error creating order:", error)
      alert("Failed to create order. Please try again.")
      return null
    }
  }

  const handlePayment = async () => {
    try {
      // Create order in database
      const orderId = await createOrder()
      if (!orderId) {
        return
      }

      // Create Razorpay order
      const response = await fetch("/api/orders/payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: cart?.total || 0,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create payment order")
      }

      const { id: razorpayOrderId } = await response.json()

      // Initialize Razorpay
      if (!razorpayLoaded) {
        alert("Payment gateway not loaded. Please refresh the page.")
        return
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: (cart?.total || 0) * 100, // in paise
        currency: "INR",
        name: "HealthConnect",
        description: "Purchase of Medicines",
        order_id: razorpayOrderId,
        handler: (response: any) => {
          // Verify payment
          verifyPayment(response, orderId)
        },
        prefill: {
          name: addresses.find((addr) => addr.id === selectedAddressId)?.name || "",
          email: "", // You would get this from user session
          contact: "", // You would get this from user session
        },
        theme: {
          color: "#10B981", // Green-600 from Tailwind
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error("Error processing payment:", error)
      alert("Failed to process payment. Please try again.")
    }
  }

  const verifyPayment = async (response: any, orderId: string) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = response

      const verifyResponse = await fetch("/api/orders/payment/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          orderId,
        }),
      })

      if (!verifyResponse.ok) {
        throw new Error("Payment verification failed")
      }

      alert("Payment successful! Your order has been placed.")

      // Redirect to order confirmation page
      router.push(`/order-confirmation?orderId=${orderId}`)
    } catch (error) {
      console.error("Error verifying payment:", error)
      alert("Payment verification failed. Please contact customer support with your order details.")
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Checkout</h1>
        <div className="animate-pulse space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-lg"></div>
            <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-lg"></div>
          </div>
          <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg"></div>
        </div>
      </div>
    )
  }

  const requiresPrescription = cart?.items.some((item) => item.medicine.requiresPrescription) || false

  return (
    <div className="container mx-auto px-4 py-8">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
        onError={() => console.error("Failed to load Razorpay script")}
      />

      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Shipping Address</h2>

          {addresses.length > 0 ? (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div key={address.id} className="flex items-start space-x-2">
                  <input
                    type="radio"
                    id={address.id}
                    name="address"
                    value={address.id}
                    checked={selectedAddressId === address.id}
                    onChange={() => handleAddressSelect(address.id)}
                    className="mt-1"
                  />
                  <label htmlFor={address.id} className="flex-1 cursor-pointer">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 transition-colors">
                      <div className="font-medium">{address.name}</div>
                      <div className="text-gray-600 dark:text-gray-300">
                        {address.street}, {address.city}, {address.state} {address.zipCode}
                      </div>
                      {address.isDefault && (
                        <div className="mt-1 inline-flex items-center text-xs text-green-600 dark:text-green-400">
                          <Check className="w-3 h-3 mr-1" />
                          Default address
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-300 mb-4">No saved addresses. Please add a new address.</p>
          )}

          {isAddingAddress ? (
            <div className="mt-4 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Add New Address</h3>
              <form onSubmit={handleAddressSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Address Name (e.g., Home, Work)
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newAddress.name}
                    onChange={handleAddressChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="street" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Street Address
                  </label>
                  <textarea
                    id="street"
                    name="street"
                    value={newAddress.street}
                    onChange={handleAddressChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={newAddress.city}
                      onChange={handleAddressChange}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      State
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={newAddress.state}
                      onChange={handleAddressChange}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    id="zipCode"
                    name="zipCode"
                    value={newAddress.zipCode}
                    onChange={handleAddressChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    name="isDefault"
                    checked={newAddress.isDefault}
                    onChange={(e) => setNewAddress((prev) => ({ ...prev, isDefault: e.target.checked }))}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <label htmlFor="isDefault" className="text-sm text-gray-700 dark:text-gray-300">
                    Set as default address
                  </label>
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingAddress(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    Save Address
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingAddress(true)}
              className="mt-4 text-green-600 hover:text-green-700 flex items-center"
            >
              <span className="mr-1">+</span> Add a new address
            </button>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Prescription</h2>

          {requiresPrescription ? (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="mb-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-md">
                  <p className="text-yellow-800 dark:text-yellow-300 font-medium">Prescription Required</p>
                  <p className="text-yellow-700 dark:text-yellow-400 text-sm mt-1">
                    Some items in your cart require a valid prescription. Please upload a clear image of your
                    prescription.
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <input
                  type="file"
                  id="prescription"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {prescriptionFile ? (
                  <div className="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
                    <div className="flex items-center">
                      <Check className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                      <div className="flex-1">
                        <p className="font-medium text-green-700 dark:text-green-300">Prescription uploaded</p>
                        <p className="text-sm text-green-600 dark:text-green-400">{prescriptionFile.name}</p>
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1 text-sm text-green-600 border border-green-200 rounded-md hover:bg-green-50 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/30"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center hover:border-green-500 dark:hover:border-green-500 transition-colors"
                  >
                    <Upload className="w-8 h-8 mb-2 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-300">Click to upload prescription</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">JPG, PNG or PDF up to 5MB</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-300">
                No prescription is required for the items in your cart. You can proceed with checkout.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Order Summary</h2>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="space-y-4">
            {cart?.items.map((item) => (
              <div key={item._id} className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="text-gray-800 dark:text-white font-medium">
                    {item.medicine.name} × {item.quantity}
                  </span>
                  {item.medicine.requiresPrescription && (
                    <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 px-2 py-0.5 rounded-full">
                      Rx
                    </span>
                  )}
                </div>
                <span className="text-gray-800 dark:text-white">
                  ₹{(item.medicine.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Subtotal:</span>
                <span className="text-gray-800 dark:text-white">₹{cart?.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Shipping & handling:</span>
                <span className="text-gray-800 dark:text-white">₹{cart?.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-2">
                <span className="text-gray-800 dark:text-white">Total:</span>
                <span className="text-gray-800 dark:text-white">₹{cart?.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handlePayment}
            disabled={!razorpayLoaded}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors duration-300 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!razorpayLoaded ? "Loading Payment Gateway..." : "Proceed to Payment"}
          </button>
        </div>
      </div>
    </div>
  )
}

