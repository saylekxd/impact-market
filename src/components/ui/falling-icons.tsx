import React, { useEffect, useState } from "react"
import { motion, usePresence, AnimatePresence } from "framer-motion"
import { v4 as uuidv4 } from "uuid"
import { cn } from "@/lib/utils"

// Import all the icons we're using elsewhere
import {
  Heart, Star, Coffee, Code, Sun, Moon, Zap, Wind, Cloud, ArrowLeft, ArrowRight, 
  Loader2, CheckCircle, Building, User, Paintbrush, Pencil, Wallet, CreditCard, 
  Clock, ImageOff, Globe, Instagram, Twitter, Facebook, Youtube, ChevronUp, 
  ChevronDown, ArrowUpRight, ArrowDownRight, BarChart3, TrendingUp, Users, Calendar, 
  FileText, Download, Eye, AlertCircle, UserCircle, Settings, LogOut, Image, Menu, 
  X, AlertTriangle, XCircle, CircleDollarSign, Bell, ExternalLink, Info, BarChart4, 
  ArrowUp, Hourglass, DollarSign, Target, Plus, Edit2, Trash2, SmartphoneIcon, 
  ComputerIcon, Trophy, UserIcon, EyeOff, Check, ChevronRight, BadgeCheck, Award, 
  Filter, Link, Copy, Camera, UploadCloud, Search, Layout, Shield, Mail, Lock, Phone
} from "lucide-react"

// Array of all icon components
const icons = [
  Heart, Star, Coffee, Code, Sun, Moon, Zap, Wind, Cloud, ArrowLeft, ArrowRight, 
  Loader2, CheckCircle, Building, User, Paintbrush, Pencil, Wallet, CreditCard, 
  Clock, ImageOff, Globe, Instagram, Twitter, Facebook, Youtube, ChevronUp, 
  ChevronDown, ArrowUpRight, ArrowDownRight, BarChart3, TrendingUp, Users, Calendar, 
  FileText, Download, Eye, AlertCircle, UserCircle, Settings, LogOut, Image, Menu, 
  X, AlertTriangle, XCircle, CircleDollarSign, Bell, ExternalLink, Info, BarChart4, 
  ArrowUp, Hourglass, DollarSign, Target, Plus, Edit2, Trash2, SmartphoneIcon, 
  ComputerIcon, Trophy, UserIcon, EyeOff, Check, ChevronRight, BadgeCheck, Award, 
  Filter, Link, Copy, Camera, UploadCloud, Search, Layout, Shield, Mail, Lock, Phone
]

// Function to get a random icon component
const getRandomIcon = () => icons[Math.floor(Math.random() * icons.length)]

// Utility function to get a random number in a range
const getRandomInRange = (min: number, max: number) => Math.random() * (max - min) + min

interface FallingIconProps {
  id: string
  x: number
  size: number
  removeIcon: (id: string) => void
}

// Individual falling icon component
const FallingIcon: React.FC<FallingIconProps> = ({ id, x, size, removeIcon }) => {
  const [isPresent, safeToRemove] = usePresence()
  const IconComponent = getRandomIcon()
  
  // Calculate icon size (60% of the dot size)
  const iconSize = Math.floor(size * 0.6)

  useEffect(() => {
    if (!isPresent) {
      setTimeout(safeToRemove, 1000)
    }
  }, [isPresent, safeToRemove])

  // Extremely gentle horizontal movement
  const xVariance = getRandomInRange(-5, 5)
  
  return (
    <motion.div
      key={id}
      className="absolute flex items-center justify-center rounded-full bg-[rgb(255,160,79)]"
      style={{
        left: x,
        top: -size,
        width: size,
        height: size,
        zIndex: 5,
      }}
      initial={{ 
        opacity: 0.7,
        y: -size,
        x: 0,
        rotate: 0
      }}
      animate={{ 
        opacity: 0.7,
        y: window.innerHeight + size,
        x: [0, xVariance, -xVariance, 0],
        rotate: getRandomInRange(-45, 45)
      }}
      transition={{
        opacity: {
          duration: 0.1
        },
        y: {
          duration: 45,
          ease: [0.1, 0.1, 0.1, 0.1],
        },
        x: {
          duration: 15,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        },
        rotate: {
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut"
        }
      }}
    >
      {/* The icon inside the dot */}
      <IconComponent
        className="text-white opacity-90 pointer-events-none"
        strokeWidth={1.5}
        style={{
          width: iconSize,
          height: iconSize,
        }}
      />
    </motion.div>
  )
}

interface FallingIconsProps {
  frequency?: number // How often icons appear (ms)
  minSize?: number // Minimum size of icons
  maxSize?: number // Maximum size of icons
  maxIcons?: number // Maximum number of icons on screen at once
  className?: string
}

export const FallingIcons: React.FC<FallingIconsProps> = ({
  frequency = 2500, // Default: new icon every 2.5 seconds
  minSize = 48,
  maxSize = 96,
  maxIcons = 20, // Default max 20 icons on screen at once
  className
}) => {
  const [icons, setIcons] = useState<Array<{
    id: string
    x: number
    size: number
  }>>([])
  
  const [windowWidth, setWindowWidth] = useState(0)
  
  // Set window width on first render and when resized
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }
    
    handleResize() // Set initial width
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])
  
  // Setup interval to add new icons
  useEffect(() => {
    if (!windowWidth) return
    
    const interval = setInterval(() => {
      if (icons.length < maxIcons) {
        const newIcon = {
          id: uuidv4(),
          x: getRandomInRange(10, windowWidth - 60),
          size: getRandomInRange(minSize, maxSize),
        }
        
        setIcons(prev => [...prev, newIcon])
        
        // Remove icon after it has completed its fall (45 seconds + 1 second buffer)
        setTimeout(() => {
          removeIcon(newIcon.id)
        }, 46000)
      }
    }, frequency)
    
    return () => clearInterval(interval)
  }, [icons.length, frequency, maxIcons, minSize, maxSize, windowWidth])
  
  // Function to remove an icon once its animation completes
  const removeIcon = (id: string) => {
    setIcons(prev => prev.filter(icon => icon.id !== id))
  }
  
  return (
    <div className={cn("fixed inset-0 w-full h-full pointer-events-none overflow-hidden", className)}>
      <AnimatePresence>
        {icons.map(icon => (
          <FallingIcon
            key={icon.id}
            id={icon.id}
            x={icon.x}
            size={icon.size}
            removeIcon={removeIcon}
          />
        ))}
      </AnimatePresence>
    </div>
  )
} 