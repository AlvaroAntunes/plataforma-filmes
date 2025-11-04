"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Plus, Star, Calendar, Heart, Users, Camera, Film, Award, Pause, Volume2, VolumeX, ArrowRight, Globe } from "lucide-react"
import { useTranslation } from "@/hooks/useTranslation"
import { getCurrentUser } from "@/lib/auth"
import Image from "next/image"

interface OpeningHeroSectionProps {
  onAdminClick?: () => void
  onExploreClick?: () => void
}

export default function OpeningHeroSection({ onAdminClick, onExploreClick }: OpeningHeroSectionProps) {
  const { t, locale } = useTranslation()
  const [showVideo, setShowVideo] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null) // Mobile poster video
  const backgroundVideoRef = useRef<HTMLVideoElement>(null) // Background video
  const desktopVideoRef = useRef<HTMLVideoElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const currentYear = new Date().getFullYear()

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

    // Handle scroll to close video on mobile - only when reaching featured movie area
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      const windowHeight = window.innerHeight
      const heroSectionHeight = windowHeight * 0.8 // Approximate hero section height
      
      if (isMobile && isExpanded && showVideo) {
        // Only close video when scrolling down and approaching the featured movie section
        // This happens when we've scrolled past most of the hero section
        if (currentScrollY > lastScrollY && currentScrollY > heroSectionHeight) {
          setIsExpanded(false)
          setShowVideo(false)
          setIsPlaying(false)
          // Stop both videos
          if (videoRef.current) {
            videoRef.current.pause()
            videoRef.current.currentTime = 0
          }
          if (backgroundVideoRef.current) {
            backgroundVideoRef.current.pause()
            backgroundVideoRef.current.currentTime = 0
          }
        }
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      clearInterval(timer)
      window.removeEventListener('resize', checkIsMobile)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isMobile, isExpanded, showVideo, lastScrollY])



  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsExpanded(true)
      setShowControls(false) // Don't show controls initially
      setShowVideo(true)
      // Auto-play video on hover without showing controls
      setTimeout(() => {
        if (desktopVideoRef.current) {
          desktopVideoRef.current.play()
          setIsPlaying(true)
        }
      }, 100)
    }
  }

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsExpanded(false)
      setShowVideo(false)
      setIsPlaying(false)
      setShowControls(false)
      if (desktopVideoRef.current) {
        desktopVideoRef.current.pause()
        desktopVideoRef.current.currentTime = 0
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }

  const togglePlay = () => {
    const video = isMobile ? videoRef.current : desktopVideoRef.current
    if (video) {
      if (isPlaying) {
        video.pause()
        setIsPlaying(false)
        setShowControls(true)
        if (controlsTimeoutRef.current) {
          clearTimeout(controlsTimeoutRef.current)
        }
      } else {
        video.play()
        setIsPlaying(true)
        setShowControls(true)
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false)
        }, 2000)
      }
    }
  }

  const toggleMute = () => {
    const video = isMobile ? videoRef.current : desktopVideoRef.current
    if (video) {
      video.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleVideoEnd = () => {
    setIsPlaying(false)
    setShowControls(true)
  }

  const handlePosterClick = () => {
    if (isMobile) {
      setIsExpanded(!isExpanded)
      if (!isExpanded) {
        setShowVideo(true)
        setTimeout(() => {
          // Start both poster video and background video
          if (videoRef.current) {
            videoRef.current.play()
          }
          if (backgroundVideoRef.current) {
            backgroundVideoRef.current.play()
            setIsPlaying(true)
          }
        }, 100)
      } else {
        setShowVideo(false)
        setIsPlaying(false)
        // Stop both videos
        if (videoRef.current) {
          videoRef.current.pause()
          videoRef.current.currentTime = 0
        }
        if (backgroundVideoRef.current) {
          backgroundVideoRef.current.pause()
          backgroundVideoRef.current.currentTime = 0
        }
      }
    }
  }

  const handleExploreAction = () => {
    if (onExploreClick) {
      onExploreClick()
    } else {
      // Default action - scroll to releases section or navigate
      const releasesSection = document.getElementById('releases')
      if (releasesSection) {
        releasesSection.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  const handleAdminAction = () => {
    if (onAdminClick) {
      onAdminClick()
    }
  }

  const showControlsWithTimeout = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 2000)
  }

  // Clean up timeout on component unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background with enhanced visuals */}
      <div className="absolute inset-0">
        {showVideo ? (
          <div className="relative w-full h-full">
            <video 
              ref={backgroundVideoRef}
              autoPlay 
              muted={isMuted}
              loop
              className="w-full h-full object-cover" 
              onEnded={handleVideoEnd}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            >
              <source src="https://eros-movies-cdn.b-cdn.net/Eros-Opening-2025.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </div>
        ) : (
          <div className="relative w-full h-full">
            {/* Desktop: Imagens com efeito blur - only for lg+ screens where rotated poster appears */}
            <div className="hidden lg:block">
              {/* Imagem de fundo com blur */}
              <Image 
                src="https://drive.usercontent.google.com/download?id=1J8DeUb6HxvUzF3eRL_Eb490cOmBgC916" 
                alt="Background"
                fill 
                className="object-cover blur-sm" 
              />
              
              {/* Imagem principal */}
              <Image 
                src="https://drive.usercontent.google.com/download?id=1J8DeUb6HxvUzF3eRL_Eb490cOmBgC916" 
                alt="Eros Unlimited"
                fill 
                className="object-contain relative z-10" 
                style={{ 
                  objectPosition: '98% center'
                }}
                priority 
              />
            </div>

            {/* Mobile & Medium: Apenas uma imagem de fundo nítida - for screens up to lg */}
            <div className="block lg:hidden">
              <Image 
                src="https://drive.usercontent.google.com/download?id=1RwRRNWJ6Z_NpPZvjvrL6WysWQEPM1HF0" 
                alt="Eros Unlimited"
                fill 
                className="object-cover" 
                priority 
              />
              {/* Much darker overlay for mobile & medium - maximum contrast for text visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-black/70" />
            </div>
          </div>
        )}
      </div>

      {/* Animated overlay elements */}
      <div className="absolute inset-0 hidden md:block">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-purple-500/10 rounded-full blur-2xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-red-500/10 rounded-full blur-xl animate-bounce" />
      </div>



      {/* Content */}
      <div className="relative z-10 flex items-start pt-16 md:pt-20 min-h-screen">
        {/* Mobile: Click outside video to close */}
        {isMobile && isExpanded && showVideo && (
          <div 
            className="fixed inset-0 z-0 lg:hidden"
            onClick={() => {
              setIsExpanded(false)
              setShowVideo(false)
              setIsPlaying(false)
              // Stop both videos
              if (videoRef.current) {
                videoRef.current.pause()
                videoRef.current.currentTime = 0
              }
              if (backgroundVideoRef.current) {
                backgroundVideoRef.current.pause()
                backgroundVideoRef.current.currentTime = 0
              }
            }}
          />
        )}
        
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-start lg:items-center">
            
            {/* Left side - Logo/Video Section */}
            <div className="relative order-2 lg:order-1 lg:mt-12 xl:mt-16">
              {/* Mobile: Logo section with video control */}
              <div className="lg:hidden mt-8 relative z-10">
                <div 
                  className={`relative transition-all duration-500 ${isExpanded ? 'scale-105' : 'scale-100'}`}
                  onClick={handlePosterClick}
                >
                  {/* Mobile video or logo */}
                  {isExpanded && showVideo ? (
                    <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-pink-500/30 shadow-2xl">
                      <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        autoPlay
                        muted
                        loop
                        onEnded={handleVideoEnd}
                      >
                        <source src="https://eros-movies-cdn.b-cdn.net/Eros-Opening-2025.mp4" type="video/mp4" />
                      </video>
                    </div>
                  ) : (
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border-2 border-pink-500/30 shadow-2xl">
                      <Image
                        src="https://drive.usercontent.google.com/download?id=1J8DeUb6HxvUzF3eRL_Eb490cOmBgC916" 
                        alt="Eros Unlimited Logo"
                        fill
                        className="object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Desktop: Logo section with hover effects */}
              <div className="relative lg:block hidden mt-12 xl:mt-16">
                  {/* Main logo/video with enhanced effects */}
                  <div className="relative w-76 h-98 mx-auto lg:ml-auto lg:mr-16 xl:mr-20">
                    <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-2xl blur-xl animate-pulse" />
                    <div 
                      className={`relative w-full h-full rounded-2xl overflow-hidden border-2 border-pink-500/30 shadow-2xl transition-all duration-500 ${isExpanded ? 'rotate-0 scale-105' : '-rotate-10'}`}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      {/* Show video on hover if available */}
                      {isExpanded && showVideo ? (
                        <video 
                          ref={desktopVideoRef}
                          autoPlay 
                          muted
                          loop
                          className="w-full h-full object-cover"
                          onEnded={handleVideoEnd}
                          onMouseMove={showControlsWithTimeout}
                        >
                          <source src="https://eros-movies-cdn.b-cdn.net/Eros-Opening-2025.mp4" type="video/mp4" />
                        </video>
                      ) : (
                        <div className="relative w-full h-full">
                          <Image
                            src="https://drive.usercontent.google.com/download?id=1RwRRNWJ6Z_NpPZvjvrL6WysWQEPM1HF0"
                            alt="Eros Unlimited Logo"
                            fill
                            className="object-contain"
                          />
                        </div>
                      )}
                      
                      {/* Desktop video controls - only show on mouse move */}
                      {isExpanded && showVideo && showControls && (
                        <div className="absolute inset-0 transition-opacity duration-300 opacity-100">
                          <button
                            onClick={togglePlay}
                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-3 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                          >
                            {isPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white" />}
                          </button>
                          
                          <button
                            onClick={toggleMute}
                            className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                          >
                            {isMuted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
                          </button>
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    </div>
                  </div>

                {/* Background decorative elements */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] -z-10">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-red-500/5 rounded-full blur-3xl animate-spin-slow" />
                </div>
              </div>
            </div>

            {/* Right side - Site Presentation Info */}
            <div className="space-y-6 md:space-y-8 order-1 lg:order-2 lg:pl-8 xl:pl-16 lg:-mt-30 xl:-mt-34">

              {/* About Description */}
              <div className="max-w-2xl lg:ml-8 xl:ml-12">
                <p className="text-2xl md:text-2xl lg:text-2xl leading-relaxed mb-4 md:mb-6 lg:mb-8 text-justify" style={{ fontFamily: 'Creative Agency, serif' }}>
                  {/* Mobile: White text with red shadow */}
                  <span className="md:hidden text-white" style={{ textShadow: '2px 2px 1px rgba(38, 0, 77, 1), 1px 1px 2px rgba(0,0,0,0.7)' }}>
                    {t('aboutEros.textDescription')}
                  </span>
                  {/* Desktop: Gray text with red shadow */}
                  <span className="hidden md:block text-gray-200" style={{ textShadow: '2px 2px 1px rgba(38, 0, 77, 1), 1px 1px 2px rgba(0,0,0,0.5)' }}>
                    {t('aboutEros.textDescription')}
                  </span>
                </p>
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
