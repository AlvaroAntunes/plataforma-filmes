"use client"

import { useState, useRef, useEffect } from "react"
import { X, Volume2, VolumeX, Play, Pause } from "lucide-react"

interface IntroVideoModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function IntroVideoModal({ isOpen, onClose }: IntroVideoModalProps) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.play()
      setIsPlaying(false)
    }
  }, [isOpen])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleVideoEnd = () => {
    setIsPlaying(false)
    // Auto close after video ends
    setTimeout(() => {
      onClose()
    }, 2000)
  }

  const showControlsWithTimeout = () => {
    setShowControls(true)
    
    // Clear existing timeout
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    
    // Set new timeout to hide controls after 2 seconds
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false)
    }, 2000)
  }

  const handleMouseMove = () => {
    showControlsWithTimeout()
  }

  const handleMouseEnter = () => {
    showControlsWithTimeout()
  }

  const handleMouseLeave = () => {
    // Clear timeout when mouse leaves
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    setShowControls(false)
  }

  // Clean up timeout on component unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/70 transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Video container */}
      <div 
        className="relative w-full max-w-6xl aspect-video rounded-xl overflow-hidden shadow-2xl"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          onEnded={handleVideoEnd}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onLoadStart={() => {
            const loadingEl = document.getElementById('video-loading')
            if (loadingEl) loadingEl.style.display = 'flex'
          }}
          onCanPlay={() => {
            const loadingEl = document.getElementById('video-loading')
            if (loadingEl) loadingEl.style.display = 'none'
          }}
        >
          <source src="https://eros-movies-cdn.b-cdn.net/Eros-Opening-2025.mp4" type="video/mp4" />
          Seu navegador não suporta vídeo HTML5.
        </video>

        {/* Video controls overlay */}
        <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}>
          {/* Play/Pause button */}
          <button
            onClick={togglePlay}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/50 backdrop-blur-sm text-white p-4 rounded-full hover:bg-black/70 transition-all duration-300 hover:scale-110"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8 ml-1" />
            )}
          </button>

          {/* Bottom controls */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Mute button */}
              <button
                onClick={toggleMute}
                className="bg-black/50 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Brand */}
            <div className="bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-white text-sm font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                EROS UNLIMITED
              </span>
            </div>
          </div>
        </div>

        {/* Loading indicator */}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center" id="video-loading">
          <div className="w-12 h-12 border-4 border-pink-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>

      {/* Skip button */}
      <button
        onClick={onClose}
        className="absolute bottom-8 right-8 bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-full hover:bg-white/20 transition-all duration-300 border border-white/20"
      >
        Pular Apresentação
      </button>
    </div>
  )
}
