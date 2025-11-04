"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { X, Play, Pause, Volume2, VolumeX, Star, Clock, Calendar, Film, Heart, Crown, Sparkles, Maximize2, Minimize2, RotateCcw, RotateCw } from "lucide-react"
import { useMoviesTranslation, useTranslation } from "@/hooks/useTranslation"
import { getCurrentUser } from "@/lib/auth"
import { setPostLoginAction } from "@/lib/redirect-after-login"
import type { Film as FilmType } from "@/lib/types"
import Image from "next/image"

interface FilmModalProps {
  film: FilmType | null
  isOpen: boolean
  isPurchased: boolean
  onClose: () => void
  onPurchase: (filmId: string) => void
  onPlay: (film: FilmType) => void
}

export default function FilmModal({ film, isOpen, isPurchased, onClose, onPurchase, onPlay }: FilmModalProps) {
  const movies = useMoviesTranslation()
  const { t, locale } = useTranslation()
  const router = useRouter()
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [showControls, setShowControls] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isPortrait, setIsPortrait] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)

  // Detecta se é mobile e orientação
  useEffect(() => {
    const checkDeviceAndOrientation = () => {
      const isMobileDevice = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      const isPortraitMode = window.innerHeight > window.innerWidth
      setIsMobile(isMobileDevice)
      setIsPortrait(isPortraitMode)
    }

    checkDeviceAndOrientation()
    window.addEventListener('resize', checkDeviceAndOrientation)
    window.addEventListener('orientationchange', () => {
      setTimeout(checkDeviceAndOrientation, 100)
    })

    return () => {
      window.removeEventListener('resize', checkDeviceAndOrientation)
      window.removeEventListener('orientationchange', checkDeviceAndOrientation)
    }
  }, [])

  // Atualiza tempo e duração do trailer
  useEffect(() => {
    const video = videoRef.current
    if (!video || !film?.trailerUrl || !showVideo) return
    
    const updateTime = () => {
      if (video.currentTime && !isNaN(video.currentTime)) {
        setCurrentTime(video.currentTime)
      }
    }
    
    const updateDuration = () => {
      if (video.duration && !isNaN(video.duration) && video.duration > 0) {
        setDuration(video.duration)
      }
    }
    
    // Múltiplos event listeners para capturar a duração
    video.addEventListener('timeupdate', updateTime)
    video.addEventListener('loadedmetadata', updateDuration)
    video.addEventListener('loadeddata', updateDuration)
    video.addEventListener('canplay', updateDuration)
    video.addEventListener('canplaythrough', updateDuration)
    video.addEventListener('durationchange', updateDuration)
    video.addEventListener('progress', updateDuration)
    
    // Força atualização se já tem duração
    if (video.duration > 0 && !isNaN(video.duration)) {
      setDuration(video.duration)
    }
    
    // Polling fallback para casos difíceis
    const durationCheckInterval = setInterval(() => {
      if (video.duration > 0 && !isNaN(video.duration) && duration === 0) {
        setDuration(video.duration)
        clearInterval(durationCheckInterval)
      }
    }, 200)
    
    // Timeout para limpar o polling após 15 segundos e mostrar fallback
    const pollTimeout = setTimeout(() => {
      clearInterval(durationCheckInterval)
      // Se após 15 segundos ainda não temos duração, define como estimativa ou desabilita
      if (duration === 0 && video.duration <= 0) {
        console.warn('Duração do vídeo não pôde ser determinada após 15 segundos')
      }
    }, 15000)
    
    return () => {
      video.removeEventListener('timeupdate', updateTime)
      video.removeEventListener('loadedmetadata', updateDuration)
      video.removeEventListener('loadeddata', updateDuration)
      video.removeEventListener('canplay', updateDuration)
      video.removeEventListener('canplaythrough', updateDuration)
      video.removeEventListener('durationchange', updateDuration)
      video.removeEventListener('progress', updateDuration)
      clearInterval(durationCheckInterval)
      clearTimeout(pollTimeout)
    }
  }, [film?.trailerUrl, isOpen, showVideo, duration])

  // Efeito para reiniciar o trailer ao abrir a modal ou trocar de filme
  useEffect(() => {
    if (isOpen && film?.trailerUrl) {
      setCurrentTime(0);
      setIsPlayingTrailer(false);
      setShowVideo(false);
      setIsMuted(false);
      
      if (videoRef.current) {
        videoRef.current.currentTime = 0;
        videoRef.current.muted = true;
      }
    }
  }, [isOpen, film?.trailerUrl])

  const handleFullscreen = () => {
    const videoContainer = playerContainerRef.current
    if (!videoContainer) return
    if (!isFullscreen) {
      if (videoContainer.requestFullscreen) {
        videoContainer.requestFullscreen()
      }
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  const formatTime = (sec: number) => {
    if (isNaN(sec)) return '00:00'
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlayingTrailer) {
        videoRef.current.pause()
        setIsPlayingTrailer(false)
      } else {
        videoRef.current.play()
        setIsPlayingTrailer(true)
      }
    }
  }

  const handleStartVideo = () => {
    setShowVideo(true)
    setIsPlayingTrailer(true) // Marca como playing imediatamente
    
    // Aguarda o próximo frame para garantir que o vídeo foi renderizado
    requestAnimationFrame(() => {
      if (videoRef.current) {
        // Reset time tracking
        setCurrentTime(0)
        setDuration(0)
        
        const video = videoRef.current
        
        // Configura propriedades para mobile
        video.muted = true // Garante que está mudo para autoplay mobile
        video.playsInline = true
        
        // Força o carregamento do metadata
        video.load()
        
        // Função para tentar reproduzir
        const attemptPlay = () => {
          if (video && !video.paused) return // Já está reproduzindo
          
          const playPromise = video.play()
          if (playPromise !== undefined) {
            playPromise.then(() => {
              setIsPlayingTrailer(true)
              console.log('Vídeo iniciado com sucesso')
            }).catch(error => {
              console.warn('Tentativa de autoplay falhou:', error)
              setIsPlayingTrailer(false)
              
              // Tenta novamente após um pequeno delay
              setTimeout(() => {
                if (video && video.paused) {
                  video.play().catch(e => console.warn('Segunda tentativa falhou:', e))
                }
              }, 100)
            })
          }
        }
        
        // Múltiplas tentativas de reprodução
        attemptPlay() // Tentativa imediata
        
        // Tentativa após loadeddata
        video.addEventListener('loadeddata', attemptPlay, { once: true })
        
        // Tentativa após canplay
        video.addEventListener('canplay', attemptPlay, { once: true })
        
        // Tentativa final após um delay
        setTimeout(attemptPlay, 200)
      }
    })
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleVideoAreaInteraction = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault()
    const target = e.target as HTMLElement
    
    if (
      target.tagName === 'BUTTON' ||
      target.closest('button') ||
      target.tagName === 'INPUT' ||
      target.closest('input')
    ) return

    setShowControls(true)
    
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false)
    }, 2000)
  }

  const handleInteractionMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false)
    }, 2000)
  }

  const skipSeconds = (sec: number) => {
    if (videoRef.current) {
      let newTime = videoRef.current.currentTime + sec
      if (newTime < 0) newTime = 0
      if (newTime > duration) newTime = duration
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const handlePlay = () => {
    if (isPurchased && film) {
      onPlay(film)
    }
  }

  const handlePurchase = () => {
    // Verificar se o usuário está logado antes de proceder com a compra
    const user = getCurrentUser()
    if (!user) {
      // Armazenar a ação de compra para executar após o login
      if (film) {
        setPostLoginAction({
          type: 'purchase-film',
          filmId: film.id,
          filmData: film // Armazenar dados do filme para evitar re-buscar
        })
      }
      // Redirecionar para login
      router.push('/login')
      return
    }
    
    // Só procede com a compra se o usuário estiver logado
    if (film) {
      onPurchase(film.id)
    }
  }

  const getLocalizedTitle = (film: FilmType, locale: string) => {
    if (locale === "pt-BR") return film.title_pt || film.title
    if (locale === "es") return film.title_es || film.title
    if (locale === "zh") return film.title_zh || film.title
    return film.title
  }
  
  const getLocalizedSynopsis = (film: FilmType, locale: string) => {
    if (locale === "pt-BR") return film.synopsis_pt || film.synopsis
    if (locale === "es") return film.synopsis_es || film.synopsis
    if (locale === "zh") return film.synopsis_zh || film.synopsis
    return film.synopsis
  }

  // Define se deve mostrar botões de pular
  const showSkipButtons = !isMobile || !isPortrait
  const centerButtonSize = isMobile ? 'w-6 h-6' : 'w-8 h-8'
  const centerButtonPadding = isMobile ? 'p-3' : 'p-4'
  const centerButtonSpacing = isMobile ? 'mr-8 ml-8' : 'mr-16 ml-16'

  // Early return após todos os hooks
  if (!isOpen || !film) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm overflow-hidden">
      <div className="h-full overflow-y-auto">
        <div className="min-h-full flex items-start justify-center py-8">
          <div className="bg-gradient-to-br from-purple-900/95 to-pink-900/95 backdrop-blur-xl rounded-2xl max-w-6xl w-full mx-4 border border-white/20 shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-black/70 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/90 transition-all duration-300 transform hover:scale-110 border border-white/20"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Purchase Status Badge */}
        {isPurchased && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-2 rounded-full text-sm font-bold flex items-center space-x-2 backdrop-blur-sm border border-green-400/30">
            <Crown className="w-4 h-4" />
            <span>{t('movies.youOwnThisMovie')}</span>
          </div>
        )}

        <div className="p-8">

          {/* 1. TRAILER SECTION */}
          {film.trailerUrl && (
            <div className="mb-8">
              <h3 className="text-white text-xl font-semibold mb-4 flex items-center">
                <Play className="w-5 h-5 mr-2 text-pink-400" />
                {t('movies.trailer')}
              </h3>
              <div
                ref={playerContainerRef}
                className="relative w-full bg-black rounded-lg overflow-hidden shadow-2xl"
                style={{ aspectRatio: '16/9' }}
                onClick={!showVideo ? handleStartVideo : handleVideoAreaInteraction}
                onTouchStart={!showVideo ? handleStartVideo : handleVideoAreaInteraction}
                onMouseMove={showVideo ? handleInteractionMove : undefined}
                onTouchMove={showVideo ? handleInteractionMove : undefined}
                role="presentation"
                tabIndex={-1}
              >
                {!showVideo ? (
                  /* Mostrar imagem com botão de play */
                  <div className="relative w-full h-full flex items-center justify-center cursor-pointer">
                    {film.img_1 ? (
                      <Image
                        src={film.img_1}
                        alt={`${getLocalizedTitle(film, locale)} - Trailer Preview`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-600" />
                    )}
                    
                    {/* Botão de play sobreposto */}
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className={`${centerButtonPadding} bg-black/70 backdrop-blur-sm rounded-full hover:bg-black/80 transition-all duration-300 transform hover:scale-110`}>
                        <Play className={`${centerButtonSize} text-white ml-1`} />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Mostrar vídeo */
                  <>
                    <video 
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      muted={isMuted}
                      autoPlay
                      playsInline
                      webkit-playsinline="true"
                      poster={film.img_1 || "/placeholder.svg"}
                      onPlay={() => setIsPlayingTrailer(true)}
                      onPause={() => setIsPlayingTrailer(false)}
                      onEnded={() => setIsPlayingTrailer(false)}
                      onTimeUpdate={() => {
                        if (videoRef.current) {
                          setCurrentTime(videoRef.current.currentTime)
                        }
                      }}
                      onLoadedMetadata={() => {
                        if (videoRef.current) {
                          setDuration(videoRef.current.duration)
                        }
                      }}
                      onLoadedData={() => {
                        if (videoRef.current && videoRef.current.duration > 0) {
                          setDuration(videoRef.current.duration)
                          // Garante configurações para mobile
                          videoRef.current.muted = isMuted
                          videoRef.current.playsInline = true
                        }
                      }}
                      onCanPlay={() => {
                        if (videoRef.current && videoRef.current.duration > 0) {
                          setDuration(videoRef.current.duration)
                        }
                      }}
                      onDurationChange={() => {
                        if (videoRef.current && videoRef.current.duration > 0) {
                          setDuration(videoRef.current.duration)
                        }
                      }}
                    >
                      <source src={film.trailerUrl} type="video/mp4" />
                    </video>

                    <div className={`absolute inset-0 transition-opacity duration-300 ${
                      showControls ? 'opacity-100' : 'opacity-0'
                    }`}>
                      {/* Botões centrais */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center">
                        {showSkipButtons && (
                          <button
                            onClick={() => skipSeconds(-10)}
                            className={`${centerButtonPadding} bg-black/70 rounded-full backdrop-blur-sm hover:bg-black/80 transition-colors ${centerButtonSpacing.split(' ')[0]}`}
                            aria-label="Voltar 10 segundos"
                          >
                            <RotateCcw className={centerButtonSize + " text-white"} />
                          </button>
                        )}
                        
                        <button
                          onClick={togglePlayPause}
                          className={`${centerButtonPadding} bg-black/70 rounded-full backdrop-blur-sm hover:bg-black/80 transition-colors`}
                        >
                          {isPlayingTrailer ? (
                            <Pause className={centerButtonSize + " text-white"} />
                          ) : (
                            <Play className={centerButtonSize + " text-white ml-1"} />
                          )}
                        </button>
                        
                        {showSkipButtons && (
                          <button
                            onClick={() => skipSeconds(10)}
                            className={`${centerButtonPadding} bg-black/70 rounded-full backdrop-blur-sm hover:bg-black/80 transition-colors ${centerButtonSpacing.split(' ')[1]}`}
                            aria-label="Avançar 10 segundos"
                          >
                            <RotateCw className={centerButtonSize + " text-white"} />
                          </button>
                        )}
                      </div>

                      {/* Controles inferiores */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 md:p-6">
                        <div className="flex items-center justify-between w-full gap-2">
                          <div className="flex items-center space-x-1 md:space-x-4">
                            <button
                              onClick={togglePlayPause}
                              className="p-1.5 md:p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                              {isPlayingTrailer ? (
                                <Pause className="w-4 h-4 md:w-5 md:h-5 text-white" />
                              ) : (
                                <Play className="w-4 h-4 md:w-5 md:h-5 text-white ml-0.5" />
                              )}
                            </button>

                            <button
                              onClick={toggleMute}
                              className="p-1.5 md:p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                              {isMuted ? (
                                <VolumeX className="w-4 h-4 md:w-5 md:h-5 text-white" />
                              ) : (
                                <Volume2 className="w-4 h-4 md:w-5 md:h-5 text-white" />
                              )}
                            </button>
                          </div>

                          <div className="flex items-center space-x-1 md:space-x-4 flex-1 mx-2 md:mx-6">
                            <span className="text-white text-xs font-mono min-w-[32px] md:min-w-[40px] text-center">{formatTime(currentTime)}</span>
                            <div className="relative flex-1 group min-w-0">
                              <div className="relative w-full h-2 md:h-2 bg-gray-700 rounded-lg overflow-visible">
                                <div 
                                  className="absolute left-0 top-0 h-full bg-pink-500 rounded-lg transition-all duration-100"
                                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                                />
                                <div 
                                  className="absolute top-1/2 w-4 h-4 md:w-4 md:h-4 bg-pink-500 rounded-full shadow-lg transition-all duration-100 hover:scale-125 group-hover:scale-125"
                                  style={{ 
                                    left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                                    transform: 'translate(-50%, -50%)'
                                  }}
                                >
                                  <div className="absolute inset-1 bg-white rounded-full opacity-30" />
                                </div>
                              </div>
                              <input
                                type="range"
                                min={0}
                                max={duration || 0}
                                step={0.1}
                                value={currentTime}
                                onChange={e => {
                                  const time = Number(e.target.value)
                                  setCurrentTime(time)
                                  if (videoRef.current) {
                                    videoRef.current.currentTime = time
                                  }
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer touch-manipulation"
                                style={{
                                  background: 'transparent',
                                  WebkitAppearance: 'none',
                                  appearance: 'none',
                                }}
                              />
                            </div>
                            <span className="text-white text-xs font-mono min-w-[32px] md:min-w-[40px] text-center">
                              {duration > 0 ? formatTime(duration) : '--:--'}
                            </span>
                          </div>

                          <div className="flex items-center">
                            <button
                              onClick={handleFullscreen}
                              className="p-1.5 md:p-2 hover:bg-white/20 rounded-full transition-colors"
                              aria-label="Tela cheia"
                            >
                              {isFullscreen ? (
                                <Minimize2 className="w-4 h-4 md:w-5 md:h-5 text-white" />
                              ) : (
                                <Maximize2 className="w-4 h-4 md:w-5 md:h-5 text-white" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Title and Meta Info */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-8">
            <div className="flex-1">
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  {getLocalizedTitle(film, locale)}
                </span>
              </h1>
              
              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-300 font-medium">{film.releaseYear}</span>
                </div>
                
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                  <Clock className="w-4 h-4 text-green-400" />
                  <span className="text-green-300 font-medium">{film.duration} {t('movies.minutes')}</span>
                </div>
                
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-yellow-300 font-bold">{film.rating}</span>
                </div>
                
                <div className="bg-gradient-to-r from-purple-500/30 to-pink-500/30 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-400/30">
                  <span className="text-purple-300 font-medium">{t(`genre.${film.genre}`)}</span>
                </div>
              </div>
            </div>

            {/* Price Section */}
            {!isPurchased && (
              <div className="lg:ml-8 mt-4 lg:mt-0">
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-400/30 rounded-2xl p-6 text-center">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    <span className="text-gray-300 text-sm">{t('movies.specialPrice')}</span>
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    USD {film.price.toFixed(2)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. SYNOPSIS SECTION */}
          <div className="mb-8">
            <h3 className="text-white text-xl font-semibold mb-4 flex items-center">
              <Film className="w-5 h-5 mr-2 text-purple-400" />
              {movies.synopsis}
            </h3>
            <p className="text-gray-300 text-lg leading-relaxed bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              {getLocalizedSynopsis(film, locale)}
            </p>
          </div>

          {/* 3. POSTER AND PHOTOS SECTION */}
          <div className="mb-8">
            <h3 className="text-white text-xl font-semibold mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-cyan-400" />
              {t('movies.galeryImages')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Poster */}
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10">
                <Image
                  src={film.posterUrl || "/placeholder.svg"}
                  alt={`${getLocalizedTitle(film, locale)} - Poster`}
                  fill
                  className="object-cover transition-transform duration-300"
                />
              </div>

              {/* Images Gallery - Horizontal layout */}
              <div className="col-span-1 md:col-span-1 lg:col-span-2 grid grid-cols-1 gap-4">
                {/* Image 1 */}
                {film.img_1 && (
                  <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10">
                    <Image
                      src={film.img_1}
                      alt={getLocalizedTitle(film, locale)}
                      fill
                      className="object-cover transition-transform duration-300"
                    />
                  </div>
                )}

                {/* Image 2 */}
                {film.img_2 && (
                  <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10">
                    <Image
                      src={film.img_2}
                      alt={getLocalizedTitle(film, locale)}
                      fill
                      className="object-cover transition-transform duration-300"
                    />
                  </div>
                )}

                {/* Image 3 */}
                {film.img_3 && (
                  <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10">
                    <Image
                      src={film.img_3}
                      alt={getLocalizedTitle(film, locale)}
                      fill
                      className="object-cover transition-transform duration-300"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {isPurchased ? (
              <>
                {/* Play Button */}
                <button
                  onClick={handlePlay}
                  className="flex-1 flex items-center justify-center space-x-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-pink-500/25"
                >
                  <Play className="w-6 h-6" />
                  <span style={{ cursor: 'pointer' }}>{t('movies.watchNowButton')}</span>
                </button>
                
                {/* Add to Favorites */}
                <button className="flex items-center justify-center space-x-3 bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105">
                  <Heart className="w-6 h-6 text-red-400" />
                  <span>{t('movies.favorite')}</span>
                </button>
              </>
            ) : (
              <>
                {/* Purchase Button */}
                <button
                  onClick={handlePurchase}
                  className="flex-1 flex items-center justify-center space-x-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/25"
                >
                  <Crown className="w-6 h-6" />
                  <span>{t('movies.buyFor')} USD {film.price.toFixed(2)}</span>
                </button>
              </>
            )}
          </div>

          {/* Security Notice */}
          {!isPurchased && (
            <div className="mt-6 flex items-center justify-center space-x-2 p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-xl backdrop-blur-sm">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <span className="text-blue-300 text-sm font-medium">
                ✨ {t('movies.securePayment')}
              </span>
            </div>
          )}
        </div>

        {/* Decorative Footer */}
        <div className="px-8 pb-6">
          <div className="flex justify-center space-x-2">
            {['🎬', '🌈', '❤️', '✨', '🎭', '🏳️‍🌈', '💖', '🎪'].map((emoji, i) => (
              <span 
                key={i} 
                className="text-xl animate-pulse" 
                style={{ animationDelay: `${i * 0.2}s` }}
              >
                {emoji}
              </span>
            ))}
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  )
}