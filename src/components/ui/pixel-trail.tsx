import React, { useCallback, useMemo, useRef } from "react"
import { motion, useAnimationControls } from "framer-motion"
import { v4 as uuidv4 } from "uuid"

import { cn } from "@/lib/utils"
import { useDimensions } from "@/components/hooks/use-debounced-dimensions"

// Import all unique icons found in the project (copied from AnimatedBackground)
import {
  Heart, Star, Coffee, Code, Sun, Moon, Zap, Wind, Cloud, ArrowLeft, ArrowRight, Loader2, CheckCircle, Building,
  User, Paintbrush, Pencil, Wallet, CreditCard, Clock, ImageOff, Globe, Instagram, Twitter, Facebook, Youtube,
  ChevronUp, ChevronDown, ArrowUpRight, ArrowDownRight, BarChart3, TrendingUp, Users, Calendar, FileText,
  Download, Eye, AlertCircle, UserCircle, Settings, LogOut, Image, Menu, X, AlertTriangle, XCircle,
  CircleDollarSign, Bell, ExternalLink, Info, BarChart4, ArrowUp, Hourglass, DollarSign, Target, Plus, Edit2,
  Trash2, SmartphoneIcon, ComputerIcon, Trophy, UserIcon, EyeOff, Check, ChevronRight, BadgeCheck, Award, Filter,
  Link, Copy, Camera, UploadCloud, Search, Layout, Shield, Mail, Lock, Phone
} from "lucide-react"

// Array of all icon components (copied from AnimatedBackground)
const icons = [
  Heart, Star, Coffee, Code, Sun, Moon, Zap, Wind, Cloud, ArrowLeft, ArrowRight, Loader2, CheckCircle, Building,
  User, Paintbrush, Pencil, Wallet, CreditCard, Clock, ImageOff, Globe, Instagram, Twitter, Facebook, Youtube,
  ChevronUp, ChevronDown, ArrowUpRight, ArrowDownRight, BarChart3, TrendingUp, Users, Calendar, FileText,
  Download, Eye, AlertCircle, UserCircle, Settings, LogOut, Image, Menu, X, AlertTriangle, XCircle,
  CircleDollarSign, Bell, ExternalLink, Info, BarChart4, ArrowUp, Hourglass, DollarSign, Target, Plus, Edit2,
  Trash2, SmartphoneIcon, ComputerIcon, Trophy, UserIcon, EyeOff, Check, ChevronRight, BadgeCheck, Award, Filter,
  Link, Copy, Camera, UploadCloud, Search, Layout, Shield, Mail, Lock, Phone
]

// Function to get a random icon component (copied from AnimatedBackground)
const getRandomIcon = () => {
  const randomIndex = Math.floor(Math.random() * icons.length);
  return icons[randomIndex];
}

interface PixelTrailProps {
  pixelSize: number // px
  fadeDuration?: number // ms
  delay?: number // ms
  className?: string
  pixelClassName?: string
}

const PixelTrail: React.FC<PixelTrailProps> = ({
  pixelSize = 20,
  fadeDuration = 500,
  delay = 0,
  className,
  pixelClassName,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const dimensions = useDimensions(containerRef)
  const trailId = useRef(uuidv4())

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const x = Math.floor((e.clientX - rect.left) / pixelSize)
      const y = Math.floor((e.clientY - rect.top) / pixelSize)

      const pixelElement = document.getElementById(
        `${trailId.current}-pixel-${x}-${y}`
      )
      if (pixelElement) {
        const animatePixel = (pixelElement as any).__animatePixel
        if (animatePixel) animatePixel()
      }
    },
    [pixelSize]
  )

  const columns = useMemo(
    () => Math.ceil(dimensions.width / pixelSize),
    [dimensions.width, pixelSize]
  )
  const rows = useMemo(
    () => Math.ceil(dimensions.height / pixelSize),
    [dimensions.height, pixelSize]
  )

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 w-full h-full pointer-events-auto",
        className
      )}
      onMouseMove={handleMouseMove}
    >
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex">
          {Array.from({ length: columns }).map((_, colIndex) => {
            // Determine if this dot should have an icon (e.g., 70% chance)
            const shouldHaveIcon = Math.random() < 0.7;
            const IconComponent = shouldHaveIcon ? getRandomIcon() : null;
            return (
              <PixelDot
                key={`${colIndex}-${rowIndex}`}
                id={`${trailId.current}-pixel-${colIndex}-${rowIndex}`}
                size={pixelSize}
                fadeDuration={fadeDuration}
                delay={delay}
                className={pixelClassName}
                IconComponent={IconComponent} // Pass the icon component (or null) as a prop
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}

interface PixelDotProps {
  id: string
  size: number
  fadeDuration: number
  delay: number
  className?: string
  IconComponent: React.ElementType | null // Allow IconComponent to be null
}

const PixelDot: React.FC<PixelDotProps> = React.memo(
  ({ id, size, fadeDuration, delay, className, IconComponent }) => { // Destructure IconComponent
    const controls = useAnimationControls()

    const animatePixel = useCallback(() => {
      controls.start({
        opacity: [1, 0],
        transition: { duration: fadeDuration / 1000, delay: delay / 1000 },
      })
    }, [controls, fadeDuration, delay]) // Include dependencies

    // Attach the animatePixel function to the DOM element
    const ref = useCallback(
      (node: HTMLDivElement | null) => {
        if (node) {
          ;(node as any).__animatePixel = animatePixel
        }
      },
      [animatePixel]
    )

    // Calculate icon size based on pixel size (e.g., 50%)
    const iconSize = Math.max(4, Math.floor(size * 0.4)); // Reduced from 0.6

    return (
      <motion.div
        id={id}
        ref={ref}
        // Add flexbox classes to center the icon
        className={cn("cursor-pointer-none flex items-center justify-center", className)}
        style={{
          width: `${size}px`,
          height: `${size}px`,
        }}
        initial={{ opacity: 0 }}
        animate={controls}
        exit={{ opacity: 0 }}
      >
        {/* Render the icon inside the dot ONLY if IconComponent is provided */}
        {IconComponent && (
          <IconComponent
            className="text-white opacity-70 pointer-events-none" // Keep icon white, slightly transparent
            style={{
              width: `${iconSize}px`,
              height: `${iconSize}px`,
            }}
            // Prevent icon from interfering with mouse events
            // Adjust strokeWidth condition for smaller icons
            strokeWidth={iconSize < 8 ? 1.5 : 2} // Adjusted threshold from 10 to 8
          />
        )}
      </motion.div>
    )
  }
)

PixelDot.displayName = "PixelDot"
export { PixelTrail } 