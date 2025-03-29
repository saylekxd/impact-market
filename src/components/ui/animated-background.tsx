import { motion } from "framer-motion"
import { useEffect, useState } from "react"
// Import all unique icons found in the project
import {
  Heart, Star, Coffee, Code, Sun, Moon, Zap, Wind, Cloud, ArrowLeft, ArrowRight, Loader2, CheckCircle, Building,
  User, Paintbrush, Pencil, Wallet, CreditCard, Clock, ImageOff, Globe, Instagram, Twitter, Facebook, Youtube,
  ChevronUp, ChevronDown, ArrowUpRight, ArrowDownRight, BarChart3, TrendingUp, Users, Calendar, FileText,
  Download, Eye, AlertCircle, UserCircle, Settings, LogOut, Image, Menu, X, AlertTriangle, XCircle,
  CircleDollarSign, Bell, ExternalLink, Info, BarChart4, ArrowUp, Hourglass, DollarSign, Target, Plus, Edit2,
  Trash2, SmartphoneIcon, ComputerIcon, Trophy, UserIcon, EyeOff, Check, ChevronRight, BadgeCheck, Award, Filter,
  Link, Copy, Camera, UploadCloud, Search, Layout, Shield, Mail, Lock, Phone
  // Note: CloseIcon (aliased from X) is intentionally omitted as X is already included.
  // Note: Some icons might appear multiple times in imports but are only listed once here.
} from "lucide-react"

// Array of all icon components
const icons = [
  Heart, Star, Coffee, Code, Sun, Moon, Zap, Wind, Cloud, ArrowLeft, ArrowRight, Loader2, CheckCircle, Building,
  User, Paintbrush, Pencil, Wallet, CreditCard, Clock, ImageOff, Globe, Instagram, Twitter, Facebook, Youtube,
  ChevronUp, ChevronDown, ArrowUpRight, ArrowDownRight, BarChart3, TrendingUp, Users, Calendar, FileText,
  Download, Eye, AlertCircle, UserCircle, Settings, LogOut, Image, Menu, X, AlertTriangle, XCircle,
  CircleDollarSign, Bell, ExternalLink, Info, BarChart4, ArrowUp, Hourglass, DollarSign, Target, Plus, Edit2,
  Trash2, SmartphoneIcon, ComputerIcon, Trophy, UserIcon, EyeOff, Check, ChevronRight, BadgeCheck, Award, Filter,
  Link, Copy, Camera, UploadCloud, Search, Layout, Shield, Mail, Lock, Phone
]

interface AnimatedBackgroundProps {
  className?: string
}

// Function to get a random icon component
const getRandomIcon = () => {
  const randomIndex = Math.floor(Math.random() * icons.length);
  return icons[randomIndex];
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ className }) => {
  const [dots, setDots] = useState<{ x: number; y: number; delay: number; IconComponent: React.ElementType }[]>([])

  useEffect(() => {
    const newDots = []
    // Get window dimensions
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight; // Use innerHeight for vertical coverage too

    // Define spacing
    const spacing = { x: 150, y: 150 };

    // Calculate grid size based on screen dimensions and spacing
    // Add +1 to ensure coverage even if screen size isn't a perfect multiple of spacing
    // Add extra columns/rows for better edge coverage, considering random offsets
    const gridSize = {
      x: Math.ceil(screenWidth / spacing.x) + 2, // +2 for extra coverage
      y: Math.ceil(screenHeight / spacing.y) + 2, // +2 for extra coverage
    };

    // Adjust starting position slightly negative to account for random offset and ensure edge coverage
    const startOffset = { x: -spacing.x / 2, y: -spacing.y / 2 };

    for (let i = 0; i < gridSize.x; i++) {
      for (let j = 0; j < gridSize.y; j++) {
        newDots.push({
          x: startOffset.x + (i * spacing.x) + (Math.random() * 50 - 25),
          y: startOffset.y + (j * spacing.y) + (Math.random() * 50 - 25),
          delay: Math.random() * 4,
          IconComponent: getRandomIcon()
        })
      }
    }
    setDots(newDots)
    // Add screenWidth and screenHeight to dependency array? No, usually run once on mount.
  }, [])

  return (
    <div className={className}>
      {dots.map((dot, index) => {
        const Icon = dot.IconComponent;
        return (
          <motion.div
            key={index}
            className="absolute w-8 h-8 md:w-12 md:h-12 rounded-full bg-[rgb(255,160,79)] flex items-center justify-center"
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
          >
            <Icon className="w-4 h-4 md:w-6 md:h-6 text-white opacity-70" />
          </motion.div>
        );
      })}
    </div>
  )
}

export { AnimatedBackground } 