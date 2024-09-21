'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Address {
  id: number;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

// This would typically come from a database or API
const getAddresses = async (): Promise<Address[]> => {
  // Simulating an API call
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return [
    { id: 1, name: 'Home', street: '123 Main St', city: 'Anytown', state: 'CA', zipCode: '12345' },
    { id: 2, name: 'Work', street: '456 Office Blvd', city: 'Workville', state: 'NY', zipCode: '67890' },
  ]
}

const getOrderTotal = async (): Promise<number> => {
  // Simulating an API call to get the order total
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return 34.96
}

export default function CheckoutPage() {
  const router = useRouter()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [total, setTotal] = useState(0)
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null)
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const fetchedAddresses = await getAddresses()
      const fetchedTotal = await getOrderTotal()
      setAddresses(fetchedAddresses)
      setTotal(fetchedTotal)
    }
    fetchData()
  }, [])

  const handleAddressSelect = (id: number) => {
    setSelectedAddress(id)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setPrescriptionFile(e.target.files[0])
    }
  }

  const handlePayment = () => {
    const options = {
      key: 'YOUR_RAZORPAY_KEY', // Replace with your actual Razorpay key
      amount: total * 100, // Razorpay expects amount in paise
      currency: 'INR',
      name: 'HealthConnect',
      description: 'Purchase of Medicines',
      handler: function(response: any) {
        console.log(response);
        router.push('/order-confirmation');
      },
      prefill: {
        name: 'John Doe',
        email: 'john@example.com',
        contact: '9999999999'
      },
      theme: {
        color: '#10B981' // This matches the green-600 color from Tailwind
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Checkout</h1>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Shipping Address</h2>
          {addresses.map(address => (
            <div key={address.id} className="mb-4">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="address"
                  value={address.id}
                  checked={selectedAddress === address.id}
                  onChange={() => handleAddressSelect(address.id)}
                  className="form-radio text-green-600"
                />
                <span className="text-gray-700 dark:text-gray-300">
                  {address.name}: {address.street}, {address.city}, {address.state} {address.zipCode}
                </span>
              </label>
            </div>
          ))}
          <button type="button" className="text-green-600 hover:underline">Add a new address</button>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Prescription</h2>
          <div className="mb-4">
            <label htmlFor="prescription" className="block text-gray-700 dark:text-gray-300 mb-2">
              Upload Prescription (if applicable)
            </label>
            <input
              type="file"
              id="prescription"
              onChange={handleFileChange}
              className="block w-full text-gray-700 dark:text-gray-300"
            />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Order Summary</h2>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-300">Subtotal:</span>
            <span className="text-gray-800 dark:text-white">${(total - 5.99).toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600 dark:text-gray-300">Shipping & handling:</span>
            <span className="text-gray-800 dark:text-white">$5.99</span>
          </div>
          <div className="flex justify-between font-bold">
            <span className="text-gray-800 dark:text-white">Total:</span>
            <span className="text-gray-800 dark:text-white">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <button
        onClick={handlePayment}
        className="w-full bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors duration-300 mt-4"
      >
        Proceed to Payment
      </button>
    </div>
  )
}