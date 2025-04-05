import { motion } from "framer-motion"

export const MinimalFooter = () => {
  return (
    <footer className="relative w-full bg-[#1a1a1a] text-white py-8">
      <div className="max-w-5xl mx-auto px-8 flex flex-col items-center">
        <div className="flex items-center space-x-8 mb-6">
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
              Facebook
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ color: "#fff" }}
              className="hover:text-white transition-colors"
            >
              Regulamin
            </motion.a>
            <motion.a
              href="#"
              whileHover={{ color: "#fff" }}
              className="hover:text-white transition-colors"
            >
              Polityka prywatności
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
        <div className="flex items-center gap-2 mb-4 text-gray-400 text-sm">
          <span>Developed by</span>
          <motion.a
            href="https://www.swtlabs.pl"
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-70 hover:opacity-100 transition-opacity"
            whileHover={{ scale: 1.05 }}
          >
            <img
              src="/swtlabs-logo.png"
              alt="SWTLabs"
              className="h-6 w-auto"
            />
          </motion.a>
        </div>
        <p className="text-xs text-gray-500 pb-6">
          © 2025 Impactmartket.pl. Wszystkie prawa zastrzeżone.
        </p>
      </div>
    </footer>
  )
} 