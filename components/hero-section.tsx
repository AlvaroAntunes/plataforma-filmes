"use client"

import { useState, useEffect } from "react"
import { Play, Plus, Info } from "lucide-react"
import type { Film } from "@/lib/types"
import AdminOnly from "@/components/admin-only"
import Image from "next/image"

interface HeroSectionProps {
  film: Film
  onPlayClick: () => void
  onAdminClick?: () => void // New prop for admin action
}

export default function HeroSection({ film, onPlayClick, onAdminClick }: HeroSectionProps) {
  const [showVideo, setShowVideo] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowVideo(true)
      // Auto hide video after 5 seconds
      setTimeout(() => setShowVideo(false), 5000)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const handleAdminAction = () => {
    if (onAdminClick) {
      onAdminClick()
    }
  }

  return (
    <div className="relative h-[70vh] w-full overflow-hidden">
      {/* Background Image/Video */}
      <div className="absolute inset-0">
        {showVideo ? (
          <video autoPlay muted className="w-full h-full object-cover" onEnded={() => setShowVideo(false)}>
            <source src={film.trailerUrl} type="video/mp4" />
          </video>
        ) : (
          <Image src={film.posterUrl || "/placeholder.svg"} alt={film.title} fill className="object-cover" priority />
        )}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 p-8 max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{film.title}</h1>
        <p className="text-lg text-white/90 mb-6 line-clamp-3">{film.synopsis}</p>

        <div className="flex items-center space-x-4">
          <button
            onClick={onPlayClick}
            className="flex items-center space-x-2 bg-white text-black px-6 py-3 rounded-md font-semibold hover:bg-white/90 transition-colors"
          >
            <Play className="w-5 h-5" />
            <span>Assistir</span>
          </button>

          <button className="flex items-center space-x-2 bg-gray-600/80 text-white px-6 py-3 rounded-md font-semibold hover:bg-gray-600 transition-colors">
            <Info className="w-5 h-5" />
            <span>Mais Informações</span>
          </button>

          <AdminOnly>
            <button 
              onClick={handleAdminAction}
              className="flex items-center space-x-2 bg-red-600/80 text-white px-6 py-3 rounded-md font-semibold hover:bg-red-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>ADMIN BUTTON</span>
            </button>
          </AdminOnly>
          
        </div>
      </div>
    </div>
  )
}
