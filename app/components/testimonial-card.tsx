import Image from "next/image"
import { Star } from "lucide-react"

interface TestimonialCardProps {
  name: string
  image: string
  rating: number
  text: string
}

export default function TestimonialCard({ name, image, rating, text }: TestimonialCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center mb-4">
        <div className="relative w-14 h-14 rounded-full overflow-hidden mr-4">
          <Image src={image || "/placeholder.svg"} alt={name} fill className="object-cover" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-800 dark:text-white">{name}</h4>
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={16}
                className={`${i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} mr-1`}
              />
            ))}
          </div>
        </div>
      </div>
      <p className="text-gray-600 dark:text-gray-300 italic">{text}</p>
    </div>
  )
}

