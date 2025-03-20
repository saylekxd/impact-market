import { motion } from "framer-motion"
import { useState } from "react"

export const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle login logic here
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <motion.div
            className="w-2 h-2 rounded-full bg-[rgb(255,160,79)] mx-auto"
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
          <h2 className="mt-6 text-3xl font-bold text-white">Sign in</h2>
          <p className="mt-2 text-sm text-gray-400">Welcome back</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-3 py-2 border border-gray-700 rounded-md bg-[#2a2a2a] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[rgb(255,160,79)] focus:border-transparent"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-3 py-2 border border-gray-700 rounded-md bg-[#2a2a2a] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[rgb(255,160,79)] focus:border-transparent"
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[rgb(255,160,79)] hover:bg-[rgb(255,140,59)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(255,160,79)]"
            >
              Sign in
            </motion.button>
          </div>
        </form>

        <p className="mt-2 text-center text-sm text-gray-400">
          Don't have an account?{" "}
          <motion.a
            whileHover={{ color: "#fff" }}
            href="/register"
            className="font-medium text-[rgb(255,160,79)] hover:text-[rgb(255,140,59)]"
          >
            Register
          </motion.a>
        </p>
      </div>
    </div>
  )
} 