"use client"

import type React from "react"
import Link from "next/link"
import {
  Calendar,
  Video,
  Stethoscope,
  Pill,
  FlaskRoundIcon as Flask,
  FileText,
  Building,
  ArrowRight,
  CheckCircle,
  Heart,
} from "lucide-react"
import SearchDoctors from "@/components/search-doctors"
import TestimonialCard from "@/components/testimonial-card"
import AnimatedNumber from "@/components/animated-number"

// Define interfaces for component props
interface ServiceCardProps {
  icon: React.ReactNode
  title: string
  description: string
  link: string
  color: string
}

interface StepCardProps {
  number: string
  title: string
  description: string
  icon: React.ReactNode
}

interface AdditionalServiceCardProps {
  icon: React.ReactNode
  title: string
  description: string
  link: string
}

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-green-100 dark:bg-green-900/20 rounded-full filter blur-3xl opacity-60 transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-100 dark:bg-blue-900/20 rounded-full filter blur-3xl opacity-60 transform -translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 mb-12 lg:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-800 dark:text-white leading-tight">
                Your Journey to <span className="text-green-600 dark:text-green-400">Better Health</span> Starts Here
              </h1>
              <p className="text-xl mb-8 text-gray-600 dark:text-gray-300 max-w-lg">
                Connect with top healthcare providers for personalized care that puts you first. Experience healthcare
                reimagined.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center">
                  <CheckCircle className="text-green-500 mr-2" size={20} />
                  <span className="text-gray-700 dark:text-gray-300">Verified Doctors</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="text-green-500 mr-2" size={20} />
                  <span className="text-gray-700 dark:text-gray-300">Secure Consultations</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="text-green-500 mr-2" size={20} />
                  <span className="text-gray-700 dark:text-gray-300">24/7 Support</span>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 lg:pl-12">
              <SearchDoctors />
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-semibold text-gray-600 dark:text-gray-300">
              Trusted by thousands of patients across India
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center">
              <AnimatedNumber value={5000} suffix="+" />
              <p className="text-gray-600 dark:text-gray-400 mt-2">Doctors</p>
            </div>
            <div className="flex flex-col items-center">
              <AnimatedNumber value={100000} suffix="+" />
              <p className="text-gray-600 dark:text-gray-400 mt-2">Patients</p>
            </div>
            <div className="flex flex-col items-center">
              <AnimatedNumber value={500} suffix="+" />
              <p className="text-gray-600 dark:text-gray-400 mt-2">Clinics</p>
            </div>
            <div className="flex flex-col items-center">
              <AnimatedNumber value={50} suffix="+" />
              <p className="text-gray-600 dark:text-gray-400 mt-2">Cities</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 dark:text-white">Our Services</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Comprehensive healthcare solutions designed with care for your well-being
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ServiceCard
              icon={<Calendar className="w-10 h-10 text-white" />}
              title="Find Doctors Near You"
              description="Book appointments with top doctors in your area for in-person consultations."
              link="/find-doctors"
              color="from-green-400 to-green-600"
            />

            <ServiceCard
              icon={<Video className="w-10 h-10 text-white" />}
              title="Instant Video Consultation"
              description="Connect with doctors online for quick medical advice from the comfort of your home."
              link="/video-consult"
              color="from-blue-400 to-blue-600"
            />

            <ServiceCard
              icon={<Stethoscope className="w-10 h-10 text-white" />}
              title="Surgeries"
              description="Safe and trusted surgery centers for various procedures with experienced specialists."
              link="/surgeries"
              color="from-purple-400 to-purple-600"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 dark:text-white">How It Works</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Getting the care you need is simple and straightforward
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              title="Search Doctors"
              description="Find doctors by specialty, location, or health concern."
              icon={<Search />}
            />

            <StepCard
              number="2"
              title="Book Appointment"
              description="Select a convenient time slot and book instantly."
              icon={<Calendar />}
            />

            <StepCard
              number="3"
              title="Get Care"
              description="Visit the doctor in-person or consult online via video."
              icon={<Heart />}
            />
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 dark:text-white">
              More Healthcare Services
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Complete healthcare ecosystem for all your medical needs
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <AdditionalServiceCard
              icon={<Pill className="w-8 h-8" />}
              title="Medicines"
              description="Order medicines online with doorstep delivery"
              link="/medicines"
            />

            <AdditionalServiceCard
              icon={<Flask className="w-8 h-8" />}
              title="Lab Tests"
              description="Book tests with home sample collection"
              link="/lab-tests"
            />

            <AdditionalServiceCard
              icon={<FileText className="w-8 h-8" />}
              title="Health Articles"
              description="Expert health tips and information"
              link="/health-articles"
            />

            <AdditionalServiceCard
              icon={<Building className="w-8 h-8" />}
              title="For Hospitals"
              description="Partner with us to reach more patients"
              link="/for-hospitals"
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 dark:text-white">What Our Patients Say</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Real experiences from people who've used our services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              name="Priya Sharma"
              image="/placeholder.svg?height=100&width=100"
              rating={5}
              text="HealthConnect made finding a specialist so easy. The doctor was excellent and I got the treatment I needed quickly. Highly recommend!"
            />

            <TestimonialCard
              name="Rahul Patel"
              image="/placeholder.svg?height=100&width=100"
              rating={5}
              text="The video consultation feature saved me so much time. I got medical advice from a top doctor without leaving my home. Amazing service!"
            />

            <TestimonialCard
              name="Ananya Gupta"
              image="/placeholder.svg?height=100&width=100"
              rating={4}
              text="I've been using HealthConnect for my family's medical needs for over a year now. The quality of doctors and ease of booking appointments is outstanding."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Ready to prioritize your health?</h2>
          <p className="text-xl mb-8 text-white/90 max-w-3xl mx-auto">
            Join thousands of patients who've found the right healthcare provider for their needs.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/find-doctors"
              className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-300"
            >
              Find Doctors
            </Link>
            <Link
              href="/video-consult"
              className="bg-transparent text-white border-2 border-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors duration-300"
            >
              Video Consult
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

// Service Card Component
function ServiceCard({ icon, title, description, link, color }: ServiceCardProps) {
  return (
    <div className="rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:transform hover:scale-105 bg-white dark:bg-gray-800 group">
      <div className={`bg-gradient-to-r ${color} p-6`}>
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4">{icon}</div>
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-semibold mb-3 text-gray-800 dark:text-white">{title}</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6">{description}</p>
        <Link
          href={link}
          className="inline-flex items-center text-green-600 dark:text-green-400 font-semibold group-hover:underline"
        >
          Explore Now{" "}
          <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  )
}

// Step Card Component
function StepCard({ number, title, description, icon }: StepCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-xl text-center">
      <div className="relative mb-6 mx-auto">
        <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
          {icon}
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold text-lg">
          {number}
        </div>
      </div>
      <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  )
}

// Additional Service Card Component
function AdditionalServiceCard({ icon, title, description, link }: AdditionalServiceCardProps) {
  return (
    <Link href={link} className="block">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg text-center transition-all duration-300 hover:shadow-xl hover:transform hover:scale-105">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
      </div>
    </Link>
  )
}

// Search icon for the How It Works section
function Search() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-green-600 dark:text-green-400 w-10 h-10"
    >
      <circle cx="11" cy="11" r="8"></circle>
      <path d="m21 21-4.3-4.3"></path>
    </svg>
  )
}

