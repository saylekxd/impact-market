import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface AnimatedBackgroundProps {
  className?: string
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ className }) => {
  const [dots, setDots] = useState<{ x: number; y: number; delay: number }[]>([])

  useEffect(() => {
    // Create a grid of dots
    const newDots = []
    const gridSize = { x: 12, y: 8 }
    const spacing = { x: 100, y: 100 }

    for (let i = 0; i < gridSize.x; i++) {
      for (let j = 0; j < gridSize.y; j++) {
        newDots.push({
          x: (i * spacing.x) + (Math.random() * 20 - 10),
          y: (j * spacing.y) + (Math.random() * 20 - 10),
          delay: Math.random() * 2
        })
      }
    }
    setDots(newDots)
  }, [])

  return (
    <div className={className}>
      {dots.map((dot, index) => (
        <motion.div
          key={index}
          className="absolute w-8 h-8 md:w-12 md:h-12 rounded-full bg-[rgb(255,160,79)]"
          style={{
            left: dot.x,
            top: dot.y,
          }}
          initial={{ opacity: 0.2, scale: 0.8 }}
          animate={{
            opacity: [0.2, 0.8, 0.2],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 4,
            delay: dot.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

export { AnimatedBackground } 