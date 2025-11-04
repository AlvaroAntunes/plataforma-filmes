"use client"

import { useState } from "react"
import Image from "next/image"
import { Play, Plus, Info } from "lucide-react"
import type { Film } from "@/lib/types"

interface FilmCardProps {
  film: Film
  isPurchased: boolean
  onFilmClick: (film: Film) => void
}

export default function FilmCard({ film, isPurchased, onFilmClick }: FilmCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className="relative group cursor-pointer transition-transform duration-300 hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onFilmClick(film)}
    >
      <div className="relative aspect-[2/3] w-48 rounded-lg overflow-hidden">
        <Image src={film.posterUrl || "/placeholder.svg"} alt={film.title} fill className="object-cover" />

        {/* Hover Overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/60 flex flex-col justify-end p-4 transition-opacity duration-300">
            <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2">{film.title}</h3>

            <div className="flex items-center space-x-2">
              <button className="p-2 bg-white rounded-full hover:bg-white/90 transition-colors">
                <Play className="w-4 h-4 text-black" />
              </button>
              <button className="p-2 bg-gray-600/80 rounded-full hover:bg-gray-600 transition-colors">
                <Plus className="w-4 h-4 text-white" />
              </button>
              <button className="p-2 bg-gray-600/80 rounded-full hover:bg-gray-600 transition-colors">
                <Info className="w-4 h-4 text-white" />
              </button>
            </div>

            {!isPurchased && (
              <div className="mt-2">
                <span className="text-green-400 text-xs font-semibold">USD {film.price.toFixed(2)}</span>
              </div>
            )}

            {isPurchased && (
              <div className="mt-2">
                <span className="text-blue-400 text-xs font-semibold">✓ Comprado</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
