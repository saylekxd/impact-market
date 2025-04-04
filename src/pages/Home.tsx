import { useScreenSize } from "@/components/hooks/use-screen-size"
import { PixelTrail } from "@/components/ui/pixel-trail"
import { AnimatedBackground } from "@/components/ui/animated-background"
import { MinimalFooter } from "@/components/ui/minimal-footer"
import { useRef, useEffect, useState } from "react"
import { motion, AnimatePresence, LayoutGroup } from "framer-motion"
import { UsernameAvailabilityChecker } from "@/components/feature/username-availability-checker"
import { Safari } from "@/components/ui/safari"
import { TextRotate } from "@/components/ui/text-rotate"
import Floating, { FloatingElement } from "@/components/ui/parallax-floating"

const Home: React.FC = () => {
  const screenSize = useScreenSize()
  const secondSectionRef = useRef<HTMLDivElement>(null)
  const thirdSectionRef = useRef<HTMLDivElement>(null)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  const photos = [
    "https://images.unsplash.com/photo-1682687982501-1e58ab814714",
    "https://images.unsplash.com/photo-1682687218147-9806132dc697",
    "https://images.unsplash.com/photo-1682695796497-31a44224d6d6"
  ]

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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhotoIndex((prev) => (prev + 1) % photos.length)
    }, 5000)

    return () => clearInterval(interval)
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

          <Floating sensitivity={-0.5} className="absolute inset-0 z-10">
            <FloatingElement
              depth={0.5}
              className="top-[15%] left-[2%] md:top-[25%] md:left-[5%]"
            >
              <motion.img
                src={photos[0]}
                alt="Floating image 1"
                className="w-16 h-12 sm:w-24 sm:h-16 md:w-28 md:h-20 lg:w-32 lg:h-24 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform -rotate-[3deg] shadow-2xl rounded-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              />
            </FloatingElement>

            <FloatingElement
              depth={1}
              className="top-[0%] left-[8%] md:top-[6%] md:left-[11%]"
            >
              <motion.img
                src={photos[1]}
                alt="Floating image 2"
                className="w-40 h-28 sm:w-48 sm:h-36 md:w-56 md:h-44 lg:w-60 lg:h-48 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform -rotate-12 shadow-2xl rounded-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              />
            </FloatingElement>

            <FloatingElement
              depth={2}
              className="top-[78%] left-[83%] md:top-[68%] md:left-[83%]"
            >
              <motion.img
                src={photos[2]}
                alt="Floating image 3"
                className="w-44 h-44 sm:w-64 sm:h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform shadow-2xl rotate-[19deg] rounded-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
              />
            </FloatingElement>
          </Floating>

          <div className="justify-center items-center flex flex-col w-full h-full z-20 pointer-events-none space-y-2 md:space-y-8">
            <motion.h1
              className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl text-center w-full justify-center items-center flex-col flex whitespace-pre leading-tight tracking-tight space-y-1 md:space-y-4"
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut", delay: 0.3 }}
            >
              <span>Make your </span>
              <LayoutGroup>
                <motion.span layout className="flex whitespace-pre">
                  <motion.span
                    layout
                    className="flex whitespace-pre"
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  >
                    website{" "}
                  </motion.span>
                  <TextRotate
                    texts={[
                      "fancy",
                      "fun",
                      "lovely ♥",
                      "weird",
                      "🪩 funky",
                      "💃🕺",
                      "sexy",
                      "🕶️ cool",
                      "go 🚀",
                      "🔥🔥🔥",
                      "over-animated?",
                      "pop ✨",
                      "rock 🤘",
                    ]}
                    mainClassName="overflow-hidden pr-3 text-[#0015ff] py-0 pb-2 md:pb-4 rounded-xl"
                    staggerDuration={0.03}
                    staggerFrom="last"
                    rotationInterval={3000}
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  />
                </motion.span>
              </LayoutGroup>
            </motion.h1>
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
          className="relative w-full min-h-screen bg-[#1a1a1a] text-white flex flex-col snap-start transition-all duration-1000 opacity-0 translate-y-10"
        >
          <motion.div
            className="absolute top-20 sm:top-24 md:top-24 right-4 sm:right-6 md:right-8 w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 rounded-full bg-[rgb(255,160,79)]"
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

          <div className="flex flex-col items-center justify-center w-full min-h-screen px-4 sm:px-6 md:px-8">
            <div className="w-full flex flex-col items-center justify-center gap-8 sm:gap-12 md:gap-16">
              <div className="w-full sm:w-[90%] md:w-[80%] lg:w-[75%] xl:w-[75%] 2xl:w-[50%] max-w-[1400px]">
                <motion.div
                  className="relative w-full mx-auto"
                  animate={{ opacity: 1 }}
                  initial={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Safari
                    url="fancy-components.dev"
                    src={photos[currentPhotoIndex]}
                    className="w-full h-auto transform scale-[0.85] sm:scale-90 md:scale-95 lg:scale-100"
                  />
                </motion.div>
              </div>

              <div className="w-full flex flex-col items-center justify-center gap-4">
                <p className="text-sm md:text-xl text-gray-400 text-center">
                  Minimalistic design with a subtle accent.
                </p>
                
                <div className="w-full max-w-[400px] sm:max-w-[480px] md:max-w-[560px] px-4 sm:px-6 md:px-8">
                  <UsernameAvailabilityChecker />
                </div>
              </div>
            </div>
          </div>

          <motion.button
            onClick={scrollToThird}
            className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 text-white cursor-pointer z-20 pointer-events-auto"
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
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8"
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