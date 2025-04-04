"use client"

import { useRef, useEffect, ReactNode } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"
import { cn } from "@/lib/utils"

interface FloatingProps {
  children: ReactNode
  sensitivity?: number
  className?: string
}

interface FloatingElementProps {
  children: ReactNode
  depth?: number
  className?: string
}

const Floating = ({
  children,
  sensitivity = 1,
  className,
}: FloatingProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springConfig = { damping: 20, stiffness: 200 }
  const mouseX = useSpring(x, springConfig)
  const mouseY = useSpring(y, springConfig)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return

      const rect = ref.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const moveX = (e.clientX - centerX) * sensitivity
      const moveY = (e.clientY - centerY) * sensitivity

      x.set(moveX)
      y.set(moveY)
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [sensitivity])

  return (
    <motion.div
      ref={ref}
      className={cn("relative", className)}
      style={{
        x: mouseX,
        y: mouseY,
      }}
    >
      {children}
    </motion.div>
  )
}

export const FloatingElement = ({
  children,
  depth = 1,
  className,
}: FloatingElementProps) => {
  return (
    <motion.div
      className={cn("absolute", className)}
      style={{
        x: depth,
        y: depth,
      }}
    >
      {children}
    </motion.div>
  )
}

export default Floating 