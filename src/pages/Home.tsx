import { useScreenSize } from "@/components/hooks/use-screen-size"
import { PixelTrail } from "@/components/ui/pixel-trail"
import { AnimatedBackground } from "@/components/ui/animated-background"
import { MinimalFooter } from "@/components/ui/minimal-footer"
import { useRef, useEffect } from "react"
import { motion } from "framer-motion"

const Home: React.FC = () => {
  const screenSize = useScreenSize()
  const secondSectionRef = useRef<HTMLDivElement>(null)
  const thirdSectionRef = useRef<HTMLDivElement>(null)

  const scrollToSecond = () => {
    secondSectionRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const scrollToThird = () => {
    thirdSectionRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100")
            entry.target.classList.remove("opacity-0", "translate-y-10")
          }
        })
      },
      { threshold: 0.1 }
    )

    if (secondSectionRef.current) {
      observer.observe(secondSectionRef.current)
    }
    if (thirdSectionRef.current) {
      observer.observe(thirdSectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <>
      <div className="snap-y snap-mandatory h-screen overflow-y-auto">
        <div className="relative w-full h-screen bg-[#dcddd7] text-black flex flex-col snap-start">
          <div className="absolute inset-0 z-0">
            <PixelTrail
              pixelSize={screenSize.lessThan("md") ? 48 : 80}
              fadeDuration={0}
              delay={1200}
              pixelClassName="rounded-full bg-[#ffa04f]"
            />
          </div>

          <div className="justify-center items-center flex flex-col w-full h-full z-10 pointer-events-none space-y-2 md:space-y-8">
            <h2 className="text-3xl cursor-pointer sm:text-5xl md:text-7xl tracking-tight">
              fancy ✽ components{" "}
            </h2>
            <p className="text-xs md:text-2xl">
              with react, motion, and typescript.
            </p>
          </div>

          <motion.button
            onClick={scrollToSecond}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-black cursor-pointer z-20 pointer-events-auto"
            animate={{
              y: [0, 10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </motion.button>

          <p className="absolute text-xs md:text-base bottom-4 right-4 pointer-events-none">
            make the web fun again.
          </p>
        </div>

        <div
          ref={secondSectionRef}
          className="relative w-full h-screen bg-[#1a1a1a] text-white flex flex-col snap-start transition-all duration-1000 opacity-0 translate-y-10"
        >
          <motion.div
            className="absolute top-8 right-8 w-3 h-3 md:w-4 md:h-4 rounded-full bg-[rgb(255,160,79)]"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <div className="justify-center items-center flex flex-col w-full h-full z-10 pointer-events-none space-y-4 md:space-y-12">
            <h2 className="text-4xl sm:text-6xl md:text-8xl font-bold tracking-tighter">
              Second Screen
            </h2>
            <p className="text-sm md:text-xl text-gray-400 max-w-md text-center px-4">
              Minimalistic design with a subtle accent.
            </p>
          </div>

          <motion.button
            onClick={scrollToThird}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white cursor-pointer z-20 pointer-events-auto"
            animate={{
              y: [0, 10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M19 12l-7 7-7-7" />
            </svg>
          </motion.button>
        </div>

        <div
          ref={thirdSectionRef}
          className="relative w-full min-h-[250vh] bg-[#dcddd7] text-black flex flex-col snap-start transition-all duration-1000 opacity-0 translate-y-10 overflow-hidden"
        >
          <AnimatedBackground className="absolute inset-0 z-0 opacity-50" />

          <div className="sticky top-0 justify-center items-center flex flex-col w-full h-screen z-10 pointer-events-none space-y-4 md:space-y-12 pt-16">
            <h2 className="text-4xl sm:text-6xl md:text-8xl font-bold tracking-tight">
              Third Screen
            </h2>
            <p className="text-sm md:text-xl max-w-md text-center px-4">
              Featuring an automatically animated background pattern.
            </p>
          </div>

          <div className="relative w-full flex-1 flex flex-col justify-end">
            <div className="relative w-full h-[100vh] bg-gradient-to-b from-[#dcddd7] via-[#dcddd7] to-[#1a1a1a]" />
            <MinimalFooter />
          </div>
        </div>
      </div>
    </>
  )
}

export default Home