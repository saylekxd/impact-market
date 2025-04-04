import { cn } from "@/lib/utils"
import { ExternalLink } from "lucide-react"

export interface TestimonialAuthor {
  name: string
  handle: string
  avatar: string
}

interface TestimonialCardProps {
  author: TestimonialAuthor
  text: string
  href?: string
}

export function TestimonialCard({ 
  author,
  text,
  href 
}: TestimonialCardProps) {
  return (
    <div className="group relative flex w-[320px] shrink-0 flex-col gap-4 rounded-xl bg-[#1a1a1a] bg-opacity-95 backdrop-blur-sm p-6 shadow-lg border border-white/5">
      <p className="flex-1 text-sm text-gray-400">
        {text}
      </p>
      
      <div className="flex items-center gap-4">
        <img
          src={author.avatar}
          alt={author.name}
          className="h-10 w-10 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <span className="text-sm font-medium leading-none text-white">
            {author.name}
          </span>
          <span className="text-sm text-gray-400">
            {author.handle}
          </span>
        </div>
      </div>

      {href && (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 flex items-center justify-end p-4 opacity-0 transition-opacity group-hover:opacity-100"
        >
          <ExternalLink className="h-4 w-4 text-gray-400" />
        </a>
      )}
    </div>
  )
} 