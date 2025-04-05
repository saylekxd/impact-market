import { AnimatedBackground } from "@/components/ui/animated-background"
import { MinimalFooter } from "@/components/ui/minimal-footer"
import { useRef, useEffect, useState } from "react"
import { motion, LayoutGroup } from "framer-motion"
import { UsernameAvailabilityChecker } from "@/components/feature/username-availability-checker"
import { Safari } from "@/components/ui/safari"
import { TextRotate } from "@/components/ui/text-rotate"
import Floating, { FloatingElement } from "@/components/ui/parallax-floating"
import { TestimonialsSection } from "@/components/ui/testimonials-section"

const testimonials = [
  {
    author: {
      name: "Anna Kowalska",
      handle: "@annahelps",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face"
    },
    text: "Impact Market pomógł nam zebrać fundusze na nowy sprzęt rehabilitacyjny. Platforma jest intuicyjna i profesjonalna.",
    href: "https://twitter.com/annahelps"
  },
  {
    author: {
      name: "Marek Nowak",
      handle: "@mareknowak",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    text: "Dzięki systemowi subskrypcji możemy regularnie wspierać wybrane organizacje. To rewolucja w crowdfundingu!",
    href: "https://twitter.com/mareknowak"
  },
  {
    author: {
      name: "Karolina Wiśniewska",
      handle: "@karolinaw",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"
    },
    text: "Bezpieczne płatności i przejrzyste raporty to dokładnie to, czego potrzebowaliśmy do naszych zbiórek charytatywnych."
  }
]

const Home: React.FC = () => {
  
  const secondSectionRef = useRef<HTMLDivElement>(null)
  const thirdSectionRef = useRef<HTMLDivElement>(null)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [currentSafariPhotoIndex, setCurrentSafariPhotoIndex] = useState(0)

  const photos = [
    "https://qmuemjlayfrescgmigcg.supabase.co/storage/v1/object/public/landing-photos//MAIN1.webp",
    "https://qmuemjlayfrescgmigcg.supabase.co/storage/v1/object/public/landing-photos//MAIN2.webp",
    "https://qmuemjlayfrescgmigcg.supabase.co/storage/v1/object/public/landing-photos//MAIN3.webp"
  ]

  const safariPreviewPhotos = [
    "https://qmuemjlayfrescgmigcg.supabase.co/storage/v1/object/public/landing-photos//FIRSTIMG1.webp",
    "https://qmuemjlayfrescgmigcg.supabase.co/storage/v1/object/public/landing-photos//imgmain4.webp",
    "https://qmuemjlayfrescgmigcg.supabase.co/storage/v1/object/public/landing-photos//imgmain2.webp",
    "https://qmuemjlayfrescgmigcg.supabase.co/storage/v1/object/public/landing-photos//imgmain3.webp"
    
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSafariPhotoIndex((prev) => (prev + 1) % safariPreviewPhotos.length)
    }, 7000)

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <div className="snap-y snap-mandatory h-screen overflow-y-auto overflow-x-hidden">
        <div className="relative w-full h-screen bg-[#dcddd7] text-black flex flex-col snap-start">
          {/* Animated background */}
          <AnimatedBackground className="absolute inset-0 z-0 opacity-50" />

          <Floating sensitivity={-0.5} className="absolute inset-0 z-10">
            <FloatingElement
              depth={0.5}
              className="top-[25%] left-[5%] sm:top-[25%] sm:left-[5%] md:top-[25%] md:left-[5%]"
            >
              <motion.img
                src={photos[0]}
                alt="Floating image 1"
                className="w-20 h-16 sm:w-24 sm:h-20 md:w-32 md:h-24 lg:w-48 lg:h-36 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform -rotate-[3deg] shadow-2xl rounded-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                loading="lazy"
              />
            </FloatingElement>

            <FloatingElement
              depth={1}
              className="top-[8%] right-[5%] sm:top-[10%] sm:right-[8%] md:top-[12%] md:right-[10%]"
            >
              <motion.img
                src={photos[1]}
                alt="Floating image 2"
                className="w-32 h-24 sm:w-40 sm:h-32 md:w-48 md:h-40 lg:w-96 lg:h-72 object-cover hover:scale-105 duration-200 cursor-pointer transition-transform rotate-6 shadow-2xl rounded-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                loading="lazy"
              />
            </FloatingElement>

            <FloatingElement
              depth={2}
              className="bottom-[15%] right-[8%] sm:bottom-[20%] sm:right-[10%] md:bottom-[25%] md:right-[15%]"
            >
              <motion.img
                src={photos[2]}
                alt="Floating image 3"
                className="w-36 h-36 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-[30rem] lg:h-[30rem] object-cover hover:scale-105 duration-200 cursor-pointer transition-transform shadow-2xl rotate-[12deg] rounded-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.3 }}
                loading="lazy"
              />
            </FloatingElement>
          </Floating>

          <div className="justify-between items-center flex flex-col w-full h-full z-20 pointer-events-none">
            <div className="flex-1 min-h-[15vh]" /> {/* Adjusted spacer */}
            <motion.h1
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-center w-full justify-center items-center flex-col flex whitespace-pre leading-tight tracking-tight space-y-1 md:space-y-4 mb-12 md:mb-16" /* Added margin bottom */
              animate={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut", delay: 0.3 }}
            >
              <span>Wspieraj </span>
              <LayoutGroup>
                <motion.span layout className="flex whitespace-pre">
                  <motion.span
                    layout
                    className="flex whitespace-pre"
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  >
                    dobro{" "}
                  </motion.span>
                  <TextRotate
                    texts={[
                      "skutecznie",
                      "bezpiecznie",
                      "z sercem ♥",
                      "regularnie",
                      "🤝 razem",
                      "💝",
                      "świadomie",
                      "🌟 mądrze",
                      "teraz 🚀",
                      "❤️",
                      "z pasją",
                      "dla innych ✨",
                      "z nami 🤗",
                    ]}
                    mainClassName="overflow-hidden pr-3 text-[rgb(255,160,79)] py-0 pb-2 md:pb-4 rounded-xl"
                    staggerDuration={0.03}
                    staggerFrom="last"
                    rotationInterval={3000}
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  />
                </motion.span>
              </LayoutGroup>
            </motion.h1>

            <motion.div
              className="w-full pointer-events-auto mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut", delay: 0.8 }}
            >
              <TestimonialsSection
                testimonials={testimonials}
                className="bg-transparent"
              />
            </motion.div>
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

          <p className="absolute text-xs md:text-base bottom-4 right-4 pointer-events-none hidden md:block">
            Nowoczesne darowizny dla dobra innych.
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
                    url="impactmarket.pl"
                    src={safariPreviewPhotos[currentSafariPhotoIndex]}
                    className="w-full h-auto transform scale-[0.85] sm:scale-90 md:scale-95 lg:scale-100"
                  />
                </motion.div>
              </div>

              <div className="w-full flex flex-col items-center justify-center gap-4">
                <p className="text-sm md:text-xl text-gray-400 text-center">
                Masz pomysł? Zobacz, czy Twoja nazwa jest dostępna!
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
              Jak to działa?
            </h2>
            <p className="text-sm md:text-xl max-w-md text-center px-4">
              Poznaj innowacyjny system wsparcia organizacji non-profit.
            </p>
          </div>

          {/* Grid Section */}
          <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24 space-y-24 md:space-y-48">
            {/* First Grid Item */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-black/5 order-1">
                <img
                  src="src/images/GRID1.webp"
                  alt="Profile System"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-4 order-2">
                <h3 className="text-2xl md:text-3xl font-medium tracking-tight">System wsparcia twórców</h3>
                <p className="text-base md:text-lg text-black/80 leading-relaxed">
                  Twórz profile, przyjmuj wpłaty i buduj społeczność wokół swoich działań charytatywnych. Nasz system umożliwia śledzenie historii transakcji i zarządzanie subskrypcjami cyklicznymi.
                </p>
              </div>
            </motion.div>

            {/* Second Grid Item */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-black/5 order-1 md:order-2">
                <img
                  src="src/images/GRID2.webp"
                  alt="Payment System"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-4 order-2 md:order-1">
                <h3 className="text-2xl md:text-3xl font-medium tracking-tight">Bezpieczne płatności</h3>
                <p className="text-base md:text-lg text-black/80 leading-relaxed">
                  Zintegrowany system płatności obsługujący BLIK, karty płatnicze i przelewy tradycyjne. Automatyczne generowanie potwierdzeń i pełna transparentność transakcji.
                </p>
              </div>
            </motion.div>

            {/* Third Grid Item */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-black/5 order-1">
                <img
                  src="src/images/GRID3.webp"
                  alt="Admin Panel"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-4 order-2">
                <h3 className="text-2xl md:text-3xl font-medium tracking-tight">Panel administracyjny</h3>
                <p className="text-base md:text-lg text-black/80 leading-relaxed">
                  Zaawansowane narzędzia do zarządzania profilem, analizy statystyk wsparcia i komunikacji z darczyńcami. Wszystko, czego potrzebujesz w jednym miejscu.
                </p>
              </div>
            </motion.div>
          </div>

          <div className="relative w-full flex-1 flex flex-col justify-end">
            <div className="relative w-full bg-gradient-to-b from-[#dcddd7] via-[#dcddd7] to-[#1a1a1a] py-12" />
            <MinimalFooter />
          </div>
        </div>
      </div>
    </>
  )
}

export default Home