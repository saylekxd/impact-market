import { useState, useEffect } from "react"

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
}

type Breakpoint = keyof typeof breakpoints

export function useScreenSize() {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  )

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const lessThan = (breakpoint: Breakpoint) => windowWidth < breakpoints[breakpoint]
  const greaterThan = (breakpoint: Breakpoint) =>
    windowWidth >= breakpoints[breakpoint]

  return {
    width: windowWidth,
    lessThan,
    greaterThan,
  }
} 