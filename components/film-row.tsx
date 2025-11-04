"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Film } from "@/lib/types"
import FilmCard from "./film-card"
import { useRef } from "react"

interface FilmRowProps {
  title: string
  films: Film[]
  purchasedFilmIds: string[]
  onFilmClick: (film: Film) => void
}

export default function FilmRow({ title, films, purchasedFilmIds, onFilmClick }: FilmRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 400
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white text-xl font-semibold">{title}</h2>
        <span className="text-blue-400 text-sm cursor-pointer hover:underline">Ver mais</span>
      </div>

      <div className="relative group">
        {/* Left Arrow */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/70"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Films Container */}
        <div
          ref={scrollRef}
          className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {films.map((film) => (
            <FilmCard
              key={film.id}
              film={film}
              isPurchased={purchasedFilmIds.includes(film.id)}
              onFilmClick={onFilmClick}
            />
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-black/70"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}
