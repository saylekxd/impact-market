import { motion } from "framer-motion"

export const MinimalFooter = () => {
  return (
    <footer className="relative w-full bg-[#1a1a1a] text-white py-16">
      <div className="max-w-5xl mx-auto px-8 flex flex-col items-center">
        <div className="flex items-center space-x-8 mb-12">
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
          <nav className="flex items-center space-x-8 text-sm text-gray-400">
            <motion.a
              href="#"
              whileHover={{ color: "#fff" }}
              className="hover:text-white transition-colors"
            >
              Twitter
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ color: "#fff" }}
              className="hover:text-white transition-colors"
            >
              GitHub
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ color: "#fff" }}
              className="hover:text-white transition-colors"
            >
              Email
            </motion.a>
          </nav>
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
        <p className="text-xs text-gray-500 pb-12">
          © 2024 Your Company. All rights reserved.
        </p>
      </div>
    </footer>
  )
} 