'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'react-hot-toast'

// Define your form schema
const signUpFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  birthDate: z.string(),
  gender: z.enum(['Male', 'Female', 'Other']),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  emergencyContactName: z.string().min(2, 'Emergency contact name must be at least 2 characters'),
  emergencyContactNumber: z.string().min(10, 'Emergency contact number must be at least 10 digits'),
  allergies: z.string().optional(),
  currentMedication: z.string().optional(),
  pastMedicalHistory: z.string().optional(),
  treatmentConsent: z.boolean().refine(val => val === true, 'You must consent to treatment'),
  privacyConsent: z.boolean().refine(val => val === true, 'You must agree to the privacy policy'),
})

type SignUpFormValues = z.infer<typeof signUpFormSchema>

export default function SignUp() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { register, handleSubmit, formState: { errors } } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: {
      gender: 'Other',
      treatmentConsent: false,
      privacyConsent: false,
    },
  })
  
  const onSubmit = async (values: SignUpFormValues) => {
    setIsLoading(true);
    try {
      console.log("📌 Sending data:", values);
  
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
  
      console.log("📌 Response status:", response.status);
      
      const data = await response.json();
      console.log("📌 Server Response:", data);
  
      if (!response.ok) {
        throw new Error(data.error || "Signup failed. Please try again.");
      }
  
      toast.success("Account created successfully! Redirecting...");
  
      setTimeout(() => {
        router.push("/"); // Redirect to home page
      }, 2000); // Delay 2 seconds for UX
  
    } catch (error) {
      console.error("❌ Signup Error:", error);
      toast.error(error instanceof Error ? error.message : "Unexpected error.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-md rounded-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-white">Create Your HealthConnect Account</h2>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
          Enter your details below to create your patient account and start your healthcare journey with us.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Personal Information Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Personal Information</h3>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
              <input
                type="text"
                id="name"
                {...register('name')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input
                  type="email"
                  id="email"
                  {...register('email')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <input
                  type="password"
                  id="password"
                  {...register('password')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  {...register('phone')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                />
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
              </div>

              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date of Birth</label>
                <input
                  type="date"
                  id="birthDate"
                  {...register('birthDate')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                />
                {errors.birthDate && <p className="mt-1 text-sm text-red-600">{errors.birthDate.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Gender</label>
              <div className="mt-1 space-x-4">
                {['Male', 'Female', 'Other'].map((option) => (
                  <label key={option} className="inline-flex items-center">
                    <input
                      type="radio"
                      {...register('gender')}
                      value={option}
                      className="form-radio text-green-600"
                    />
                    <span className="ml-2">{option}</span>
                  </label>
                ))}
              </div>
              {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>}
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
              <input
                type="text"
                id="address"
                {...register('address')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
              />
              {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
            </div>
          </div>

          {/* Emergency Contact Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Emergency Contact</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="emergencyContactName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Emergency Contact Name</label>
                <input
                  type="text"
                  id="emergencyContactName"
                  {...register('emergencyContactName')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                />
                {errors.emergencyContactName && <p className="mt-1 text-sm text-red-600">{errors.emergencyContactName.message}</p>}
              </div>

              <div>
                <label htmlFor="emergencyContactNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Emergency Contact Number</label>
                <input
                  type="tel"
                  id="emergencyContactNumber"
                  {...register('emergencyContactNumber')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                />
                {errors.emergencyContactNumber && <p className="mt-1 text-sm text-red-600">{errors.emergencyContactNumber.message}</p>}
              </div>
            </div>
          </div>

          {/* Medical Information Section */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Medical Information</h3>
            
            <div>
              <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Allergies (Optional)</label>
              <textarea
                id="allergies"
                {...register('allergies')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                rows={3}
              ></textarea>
            </div>

            <div>
              <label htmlFor="currentMedication" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Medications (Optional)</label>
              <textarea
                id="currentMedication"
                {...register('currentMedication')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                rows={3}
              ></textarea>
            </div>

            <div>
              <label htmlFor="pastMedicalHistory" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Past Medical History (Optional)</label>
              <textarea
                id="pastMedicalHistory"
                {...register('pastMedicalHistory')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-300 focus:ring focus:ring-green-200 focus:ring-opacity-50"
                rows={3}
              ></textarea>
            </div>
          </div>

          {/* Consent Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Consent and Privacy</h3>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="treatmentConsent"
                  type="checkbox"
                  {...register('treatmentConsent')}
                  className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="treatmentConsent" className="font-medium text-gray-700 dark:text-gray-300">I consent to receive treatment for my health condition.</label>
              </div>
            </div>
            {errors.treatmentConsent && <p className="mt-1 text-sm text-red-600">{errors.treatmentConsent.message}</p>}

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="privacyConsent"
                  type="checkbox"
                  {...register('privacyConsent')}
                  className="focus:ring-green-500 h-4 w-4 text-green-600 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="privacyConsent" className="font-medium text-gray-700 dark:text-gray-300">I acknowledge that I have reviewed and agree to the privacy policy.</label>
              </div>
            </div>
            {errors.privacyConsent && <p className="mt-1 text-sm text-red-600">{errors.privacyConsent.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6">
          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link href="/signin" className="font-medium text-green-600 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}