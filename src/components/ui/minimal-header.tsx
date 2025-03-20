import { motion } from "framer-motion"

export const MinimalHeader = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a1a] bg-opacity-95 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
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
            className="text-white text-sm font-medium"
            whileHover={{ x: 2 }}
          >
            fancy
          </motion.a>
        </div>

        <nav className="flex items-center space-x-8">
          <motion.a
            href="#"
            className="text-sm text-gray-400 hover:text-white transition-colors"
            whileHover={{ color: "#fff" }}
          >
            Work
          </motion.a>
          <motion.a
            href="#"
            className="text-sm text-gray-400 hover:text-white transition-colors"
            whileHover={{ color: "#fff" }}
          >
            About
          </motion.a>
          <div className="flex items-center space-x-4">
            <motion.a
              href="/login"
              className="text-sm text-gray-400 hover:text-white transition-colors"
              whileHover={{ color: "#fff" }}
            >
              Login
            </motion.a>
            <motion.a
              href="/register"
              className="text-sm px-3 py-1 rounded-md bg-[rgb(255,160,79)] text-white hover:bg-[rgb(255,140,59)] transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Register
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
      </div>
    </header>
  )
} 