"use client"

import { useState, useEffect, useRef } from "react"

interface AnimatedNumberProps {
  value: number
  suffix?: string
  duration?: number
}

export default function AnimatedNumber({ value, suffix = "", duration = 2000 }: AnimatedNumberProps) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const countRef = useRef(0)
  const startTimeRef = useRef<number | null>(null)
  const elementRef = useRef<HTMLDivElement>(null)

  // Custom implementation of intersection observer without the external package
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp
      }

      const progress = timestamp - startTimeRef.current
      const percentage = Math.min(progress / duration, 1)

      // Easing function for smoother animation
      const easeOutQuad = (t: number) => t * (2 - t)
      const easedProgress = easeOutQuad(percentage)

      const currentCount = Math.floor(easedProgress * value)

      if (currentCount !== countRef.current) {
        countRef.current = currentCount
        setCount(currentCount)
      }

      if (percentage < 1) {
        requestAnimationFrame(animate)
      } else {
        setCount(value)
      }
    }

    requestAnimationFrame(animate)

    return () => {
      startTimeRef.current = null
    }
  }, [isVisible, value, duration])

  return (
    <div ref={elementRef} className="text-4xl font-bold text-green-600 dark:text-green-400">
      {count}
      {suffix}
    </div>
  )
}

