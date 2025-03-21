"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "react-hot-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { UserCircle, Upload, Loader2 } from "lucide-react"
import Image from "next/image"

// Define profile form schema
const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  birthDate: z.string(),
  gender: z.enum(["Male", "Female", "Other"]),
  address: z.string().min(5, "Address must be at least 5 characters"),
  emergencyContactName: z.string().min(2, "Emergency contact name must be at least 2 characters"),
  emergencyContactNumber: z.string().min(10, "Emergency contact number must be at least 10 digits"),
})

// Define medical info form schema
const medicalInfoFormSchema = z.object({
  allergies: z.string().optional(),
  currentMedication: z.string().optional(),
  pastMedicalHistory: z.string().optional(),
  bloodGroup: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>
type MedicalInfoFormValues = z.infer<typeof medicalInfoFormSchema>

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isMedicalInfoLoading, setIsMedicalInfoLoading] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
    setValue: setProfileValue,
    reset: resetProfile,
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      gender: "Other",
    },
  })

  // Medical info form
  const {
    register: registerMedical,
    handleSubmit: handleMedicalSubmit,
    formState: { errors: medicalErrors },
    setValue: setMedicalValue,
    reset: resetMedical,
  } = useForm<MedicalInfoFormValues>({
    resolver: zodResolver(medicalInfoFormSchema),
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin")
    }
  }, [status, router])

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch("/api/user/profile")
          if (response.ok) {
            const userData = await response.json()

            // Set profile form values
            if (userData.name) setProfileValue("name", userData.name)
            if (userData.email) setProfileValue("email", userData.email)
            if (userData.phone) setProfileValue("phone", userData.phone)
            if (userData.birthDate) setProfileValue("birthDate", userData.birthDate.split("T")[0])
            if (userData.gender) setProfileValue("gender", userData.gender)
            if (userData.address) setProfileValue("address", userData.address)
            if (userData.emergencyContactName) setProfileValue("emergencyContactName", userData.emergencyContactName)
            if (userData.emergencyContactNumber)
              setProfileValue("emergencyContactNumber", userData.emergencyContactNumber)

            // Set medical info form values
            if (userData.allergies) setMedicalValue("allergies", userData.allergies)
            if (userData.currentMedication) setMedicalValue("currentMedication", userData.currentMedication)
            if (userData.pastMedicalHistory) setMedicalValue("pastMedicalHistory", userData.pastMedicalHistory)
            if (userData.bloodGroup) setMedicalValue("bloodGroup", userData.bloodGroup)
            if (userData.height) setMedicalValue("height", userData.height)
            if (userData.weight) setMedicalValue("weight", userData.weight)

            // Set profile image
            if (userData.profileImage) setProfileImage(userData.profileImage)
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
          toast.error("Failed to load profile data")
        }
      }
    }

    fetchUserData()
  }, [session, setProfileValue, setMedicalValue])

  const onProfileSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      toast.success("Profile updated successfully")
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  const onMedicalInfoSubmit = async (data: MedicalInfoFormValues) => {
    setIsMedicalInfoLoading(true)
    try {
      const response = await fetch("/api/user/medical-info", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update medical information")
      }

      toast.success("Medical information updated successfully")
    } catch (error) {
      console.error("Error updating medical information:", error)
      toast.error("Failed to update medical information")
    } finally {
      setIsMedicalInfoLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    try {
      // Create a FormData object to send the file
      const formData = new FormData()
      formData.append("file", file)

      // Send the file to your API endpoint
      const response = await fetch("/api/user/profile-image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upload image")
      }

      const data = await response.json()
      setProfileImage(data.imageUrl)
      toast.success("Profile image updated successfully")
    } catch (error) {
      console.error("Error uploading image:", error)
      toast.error(error instanceof Error ? error.message : "Failed to upload image")
    } finally {
      setIsUploading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">Your Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Profile sidebar */}
        <div className="md:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  {profileImage ? (
                    <div className="h-32 w-32 rounded-full overflow-hidden">
                      <Image
                        src={profileImage || "/placeholder.svg"}
                        alt={session?.user?.name || "Profile"}
                        width={128}
                        height={128}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-32 w-32 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                      <UserCircle className="h-20 w-20 text-green-600 dark:text-green-400" />
                    </div>
                  )}
                  <label
                    htmlFor="profile-image"
                    className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full cursor-pointer hover:bg-green-700 transition-colors"
                  >
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    <input
                      type="file"
                      id="profile-image"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                  </label>
                </div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{session?.user?.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{session?.user?.email}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile content */}
        <div className="md:col-span-3">
          <Tabs defaultValue="personal">
            <TabsList className="mb-4">
              <TabsTrigger value="personal">Personal Information</TabsTrigger>
              <TabsTrigger value="medical">Medical Information</TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details and emergency contact information</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Full Name
                        </label>
                        <Input
                          id="name"
                          {...registerProfile("name")}
                          className={profileErrors.name ? "border-red-500" : ""}
                        />
                        {profileErrors.name && (
                          <p className="mt-1 text-sm text-red-600">{profileErrors.name.message}</p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Email (cannot be changed)
                        </label>
                        <Input
                          id="email"
                          {...registerProfile("email")}
                          disabled
                          className="bg-gray-100 dark:bg-gray-800"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Phone Number
                        </label>
                        <Input
                          id="phone"
                          {...registerProfile("phone")}
                          className={profileErrors.phone ? "border-red-500" : ""}
                        />
                        {profileErrors.phone && (
                          <p className="mt-1 text-sm text-red-600">{profileErrors.phone.message}</p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="birthDate"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Date of Birth
                        </label>
                        <Input
                          type="date"
                          id="birthDate"
                          {...registerProfile("birthDate")}
                          className={profileErrors.birthDate ? "border-red-500" : ""}
                        />
                        {profileErrors.birthDate && (
                          <p className="mt-1 text-sm text-red-600">{profileErrors.birthDate.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
                      <div className="mt-1 space-x-4">
                        {["Male", "Female", "Other"].map((option) => (
                          <label key={option} className="inline-flex items-center">
                            <input
                              type="radio"
                              {...registerProfile("gender")}
                              value={option}
                              className="form-radio text-green-600"
                            />
                            <span className="ml-2">{option}</span>
                          </label>
                        ))}
                      </div>
                      {profileErrors.gender && (
                        <p className="mt-1 text-sm text-red-600">{profileErrors.gender.message}</p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="address"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Address
                      </label>
                      <Textarea
                        id="address"
                        {...registerProfile("address")}
                        className={profileErrors.address ? "border-red-500" : ""}
                      />
                      {profileErrors.address && (
                        <p className="mt-1 text-sm text-red-600">{profileErrors.address.message}</p>
                      )}
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Emergency Contact</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label
                            htmlFor="emergencyContactName"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                          >
                            Emergency Contact Name
                          </label>
                          <Input
                            id="emergencyContactName"
                            {...registerProfile("emergencyContactName")}
                            className={profileErrors.emergencyContactName ? "border-red-500" : ""}
                          />
                          {profileErrors.emergencyContactName && (
                            <p className="mt-1 text-sm text-red-600">{profileErrors.emergencyContactName.message}</p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="emergencyContactNumber"
                            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                          >
                            Emergency Contact Number
                          </label>
                          <Input
                            id="emergencyContactNumber"
                            {...registerProfile("emergencyContactNumber")}
                            className={profileErrors.emergencyContactNumber ? "border-red-500" : ""}
                          />
                          {profileErrors.emergencyContactNumber && (
                            <p className="mt-1 text-sm text-red-600">{profileErrors.emergencyContactNumber.message}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="medical">
              <Card>
                <CardHeader>
                  <CardTitle>Medical Information</CardTitle>
                  <CardDescription>Update your medical details for better healthcare services</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleMedicalSubmit(onMedicalInfoSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label
                          htmlFor="bloodGroup"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Blood Group
                        </label>
                        <Input id="bloodGroup" {...registerMedical("bloodGroup")} />
                      </div>

                      <div>
                        <label
                          htmlFor="height"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Height (cm)
                        </label>
                        <Input id="height" type="number" {...registerMedical("height")} />
                      </div>

                      <div>
                        <label
                          htmlFor="weight"
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Weight (kg)
                        </label>
                        <Input id="weight" type="number" {...registerMedical("weight")} />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="allergies"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Allergies
                      </label>
                      <Textarea
                        id="allergies"
                        {...registerMedical("allergies")}
                        placeholder="List any allergies you have"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="currentMedication"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Current Medications
                      </label>
                      <Textarea
                        id="currentMedication"
                        {...registerMedical("currentMedication")}
                        placeholder="List any medications you are currently taking"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="pastMedicalHistory"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                      >
                        Past Medical History
                      </label>
                      <Textarea
                        id="pastMedicalHistory"
                        {...registerMedical("pastMedicalHistory")}
                        placeholder="Describe any significant past medical conditions or surgeries"
                        rows={4}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isMedicalInfoLoading}>
                        {isMedicalInfoLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Medical Information"
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

