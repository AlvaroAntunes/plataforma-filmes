"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Plus, Info, Star, Clock, Calendar, Sparkles, ShoppingBag, X, Pause, Volume2, VolumeX }from "lucide-react"
import { useMoviesTranslation, useTranslation } from "@/hooks/useTranslation"
import type { Film } from "@/lib/types"
import { getCurrentUser } from "@/lib/auth"
import Image from "next/image"

interface ModernHeroSectionProps {
  film: Film
  onPlayClick: () => void
  onAdminClick?: () => void
}

export default function ModernHeroSection({ film, onPlayClick, onAdminClick }: ModernHeroSectionProps) {
  const movies = useMoviesTranslation()
  const { t, locale } = useTranslation()
  const [showVideo, setShowVideo] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const desktopVideoRef = useRef<HTMLVideoElement>(null)

  const getLocalizedTitle = (film: Film, locale: string) => {
    if (locale === "pt-BR") return film.title_pt || film.title
    if (locale === "es") return film.title_es || film.title
    if (locale === "zh") return film.title_zh || film.title
    return film.title
  }
  
  const getLocalizedSynopsis = (film: Film, locale: string) => {
    if (locale === "pt-BR") return film.synopsis_pt || film.synopsis
    if (locale === "es") return film.synopsis_es || film.synopsis
    if (locale === "zh") return film.synopsis_zh || film.synopsis
    return film.synopsis
  }

  useEffect(() => {
    // Check if device is mobile
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)

    // Check if user is admin
    const user = getCurrentUser()
    setIsAdmin(user?.role === 'ADMIN')

    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => {
      clearInterval(timer)
      window.removeEventListener('resize', checkIsMobile)
    }
  }, [isMobile])

  useEffect(() => {
    if (isExpanded && showVideo && videoRef.current && isMobile) {
      videoRef.current.play().catch(() => {
        setIsPlaying(false)
      })
    }
  }, [isExpanded, showVideo, isMobile])

  const handleAdminAction = () => {
    if (onAdminClick) {
      onAdminClick()
    }
  }

  const handlePosterClick = () => {
    if (isMobile) {
      if (!isExpanded) {
        setIsExpanded(true)
        if (film.trailerUrl) {
          setShowVideo(true)
          setIsPlaying(true) // Auto-play when opening
        }
      } else {
        // Close on second click
        setIsExpanded(false)
        setShowVideo(false)
        setIsPlaying(false)
        if (videoRef.current) {
          videoRef.current.pause()
          videoRef.current.currentTime = 0
        }
      }
    }
  }

  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsExpanded(true)
      if (film.trailerUrl) {
        // Pequeno delay para suavizar a transição
        setTimeout(() => {
          setShowVideo(true)
        }, 200)
      }
    }
  }

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsExpanded(false)
      setShowVideo(false)
      // Reset desktop video to beginning when mouse leaves
      if (desktopVideoRef.current) {
        desktopVideoRef.current.pause()
        desktopVideoRef.current.currentTime = 0
      }
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background with enhanced visuals - Mobile optimized */}
      <div className="absolute inset-0">
        {showVideo && film.trailerUrl ? (
          <div className="relative w-full h-full">
            <video 
              autoPlay 
              muted 
              className="w-full h-full object-cover" 
              onEnded={() => {
                if (!isMobile) {
                  setShowVideo(false)
                }
                // On mobile, video continues or loops until user clicks
              }}
            >
              <source src={film.trailerUrl} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50 md:hidden" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/50 hidden md:block" />
          </div>
        ) : (
          <div className="relative w-full h-full">
            <Image 
              src={film.posterUrl || "/placeholder.svg"} 
              alt={getLocalizedTitle(film, locale)}
              fill 
              className="object-cover" 
              priority 
            />
            {/* Enhanced gradient for mobile - stronger black overlay for text visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/40 md:hidden" />
            {/* Desktop gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent hidden md:block" />
          </div>
        )}
      </div>

      {/* Animated overlay elements - reduced on mobile */}
      <div className="absolute inset-0 hidden md:block">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-red-500/10 rounded-full blur-xl animate-bounce" />
      </div>

      {/* Gradient Overlays - Enhanced for mobile */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-black/60 md:from-black/90 md:via-transparent md:to-black/50" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent md:from-black/80 md:via-transparent" />

      {/* Content */}
      <div className="relative z-10 flex items-center min-h-screen">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            
            {/* Left side - Film Info */}
            <div className="space-y-6 md:space-y-8">
              {/* Featured Badge */}
              <div className="flex items-center space-x-3 pt-4 md:pt-0">
                <div className="flex items-center space-x-2 bg-gradient-to-r from-pink-500/30 to-purple-500/30 md:from-pink-500/20 md:to-purple-500/20 backdrop-blur-sm border border-pink-500/30 rounded-full px-3 md:px-4 py-1.5 md:py-2">
                  <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-pink-400" />
                  <span className="text-pink-400 font-semibold text-xs md:text-sm">{t('movies.featured')}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-400 fill-current" />
                  <span className="text-yellow-400 font-bold text-sm md:text-base">{film.rating}</span>
                </div>
              </div>

              {/* Title - Enhanced contrast for mobile */}
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-3 md:mb-4 leading-tight">
                  {/* Mobile: White text with shadow for better visibility */}
                  <span className="md:hidden block text-white drop-shadow-2xl" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.9)' }}>
                    {getLocalizedTitle(film, locale)}
                  </span>
                  {/* Desktop: Gradient text */}
                  <span className="hidden md:block bg-gradient-to-r from-pink-400 via-purple-400 to-red-400 bg-clip-text text-transparent">
                    {getLocalizedTitle(film, locale)}
                  </span>
                </h1>
                
                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-3 md:gap-4 lg:gap-6 text-gray-200 md:text-gray-300 mb-4 md:mb-6 text-xs md:text-sm lg:text-base">
                  <div className="flex items-center space-x-1.5 md:space-x-2">
                    <Calendar className="w-3 h-3 md:w-4 md:h-4 text-purple-400" />
                    <span>{film.releaseYear}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 md:space-x-2">
                    <Clock className="w-3 h-3 md:w-4 md:h-4 text-pink-400" />
                    <span>{film.duration} {t('movies.minutes')}</span>
                  </div>
                  <div className="bg-gradient-to-r from-purple-500/30 to-pink-500/30 md:from-purple-500/20 md:to-pink-500/20 px-2 md:px-3 py-0.5 md:py-1 rounded-full border border-purple-500/30">
                    <span className="text-purple-300 font-medium text-xs md:text-sm">{t(`genre.${film.genre}`)}</span>
                  </div>
                </div>
              </div>

              {/* Synopsis - Better contrast on mobile */}
              <div className="max-w-2xl">
                <p className="text-sm md:text-base lg:text-lg text-gray-200 md:text-gray-300 leading-relaxed mb-4 md:mb-6 lg:mb-8 text-justify">
                  {getLocalizedSynopsis(film, locale)}
                </p>
                
                {/* Price */}
                <div className="flex items-center space-x-3 md:space-x-4 mb-4 md:mb-6 lg:mb-8">
                  <span className="text-gray-300 md:text-gray-400 text-xs md:text-sm lg:text-base">{t('movies.startingFrom')}</span>
                  <span className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    USD {film.price.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Action Buttons - Mobile optimized */}
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 md:gap-4">
                <button
                  style={{ cursor: 'pointer' }}
                  onClick={onPlayClick}
                  className="group flex items-center justify-center space-x-2 md:space-x-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 md:px-6 lg:px-8 py-2.5 md:py-3 lg:py-4 rounded-lg md:rounded-xl font-bold hover:from-pink-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-pink-500/25 w-full sm:w-auto"
                >
                  <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 group-hover:scale-110 transition-transform" />
                  <span className="text-sm md:text-base">{movies.buy}</span>
                </button>

                {/* Admin Button */}
                {isAdmin && (
                  <button 
                    onClick={handleAdminAction}
                    className="group flex items-center justify-center space-x-2 md:space-x-3 bg-gradient-to-r from-red-500/80 to-orange-500/80 backdrop-blur-sm text-white px-4 md:px-6 lg:px-8 py-2.5 md:py-3 lg:py-4 rounded-lg md:rounded-xl font-bold hover:from-red-600 hover:to-orange-600 transition-all duration-300 transform hover:scale-105 border border-red-500/30 w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6 group-hover:rotate-45 transition-transform" />
                    <span className="text-sm md:text-base">{movies.addNewMovie}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Right side - Enhanced Visual Elements */}
            <div className="relative">
              {/* Mobile: Poster section with better trailer control */}
              <div className="lg:hidden">
                <div 
                  className={`relative transition-all duration-500 ${isExpanded ? 'scale-105' : 'scale-100'}`}
                >
                </div>
              </div>

              {/* Desktop: Original poster section with hover effects */}
              <div className="relative lg:block hidden">
                  {/* Main poster with enhanced effects */}
                  <div className="relative w-96 aspect-[2/3] mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl blur-xl animate-pulse" />
                    <div 
                      className={`relative w-full h-full rounded-2xl overflow-hidden border-2 border-pink-500/30 shadow-2xl transition-all duration-500 ${isExpanded ? 'rotate-0 scale-105' : 'rotate-3'}`}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      {/* Show video on hover if available */}
                      {isExpanded && showVideo && film.trailerUrl ? (
                        <video 
                          ref={desktopVideoRef}
                          autoPlay 
                          muted={isMuted}
                          loop
                          className="w-full h-full object-cover"
                          onEnded={() => setShowVideo(false)}
                        >
                          <source src={film.trailerUrl} type="video/mp4" />
                        </video>
                      ) : (
                        <Image
                          src={film.posterUrl || "/placeholder.svg"}
                          alt={getLocalizedTitle(film, locale)}
                          fill
                          className="bg-black object-contains"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                  </div>

                  {/* Floating elements */}
                  <div className="absolute -top-8 -right-8 w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-bounce">
                    <Star className="w-8 h-8 text-white fill-current" />
                  </div>

                  <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-pink-500/90 to-purple-500/90 backdrop-blur-sm rounded-xl p-4 border border-pink-500/30">
                    <div className="text-white text-center">
                      <div className="text-2xl font-bold">{film.rating}</div>
                      <div className="text-xs text-gray-200">{t('movies.evaluation')}</div>
                    </div>
                  </div>

                  {/* Time display */}
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-gray-600/30">
                    <div className="text-white text-sm font-medium">
                      {currentTime.toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>

                {/* Background decorative elements */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] -z-10">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-red-500/5 rounded-full blur-3xl animate-spin-slow" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-5 h-8 md:w-6 md:h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-0.5 h-2 md:w-1 md:h-3 bg-white rounded-full mt-1.5 md:mt-2 animate-pulse" />
          </div>
          <span className="text-white/70 text-xs md:text-sm font-medium">{t('movies.scrollToExplore')}</span>
        </div>
      </div>
    </div>
  )
}