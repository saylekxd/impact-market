import { motion } from "framer-motion"
import { useState } from "react"

export const MinimalHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a1a] bg-opacity-95 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <motion.div
            className="w-2 h-2 rounded-full bg-[rgb(255,160,79)]"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.a
            href="/"
            className="text-white"
            whileHover={{ scale: 1.05 }}
          >
            <img
              src="/Impact-logo.svg"
              alt="Impact Logo"
              className="w-[100px] sm:w-[120px] h-6 sm:h-8"
            />
          </motion.a>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <div className="space-y-1.5">
            <span className={`block w-6 h-0.5 bg-white transition-transform ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-white transition-opacity ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-white transition-transform ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </div>
        </button>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <div className="flex items-center space-x-4">
            <motion.a
              href="/login"
              className="text-sm text-gray-400 hover:text-white transition-colors"
              whileHover={{ color: "#fff" }}
            >
              Zaloguj
            </motion.a>
            <motion.a
              href="/register"
              className="text-sm px-3 py-1 rounded-md bg-[rgb(255,160,79)] text-white hover:bg-[rgb(255,140,59)] transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Zarejestruj
            </motion.a>
            <motion.div
              className="w-2 h-2 rounded-full bg-[rgb(255,160,79)]"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.5,
              }}
            />
          </div>
        </nav>

        {/* Mobile menu */}
        <motion.div
          className={`absolute top-16 left-0 right-0 bg-[#1a1a1a] md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: isMobileMenuOpen ? 1 : 0, y: isMobileMenuOpen ? 0 : -10 }}
          transition={{ duration: 0.2 }}
        >
          <div className="px-4 py-4 space-y-4">
            <motion.a
              href="/login"
              className="block text-sm text-gray-400 hover:text-white transition-colors py-2"
              whileHover={{ color: "#fff" }}
            >
              Zaloguj
            </motion.a>
            <motion.a
              href="/register"
              className="block text-sm text-center px-3 py-2 rounded-md bg-[rgb(255,160,79)] text-white hover:bg-[rgb(255,140,59)] transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Zarejestruj
            </motion.a>
          </div>
        </motion.div>
      </div>
    </header>
  )
} 