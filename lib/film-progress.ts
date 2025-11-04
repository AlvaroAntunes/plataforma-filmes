import { createClient } from '@supabase/supabase-js'
import type { Film } from '@/lib/types' 

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface FilmProgress {
  id: string
  user_id: string
  movie_id: string
  time_watched: number 
  last_updated: string
  created_at: string
}

// Função auxiliar para converter snake_case para camelCase
const mapMovieToFilm = (movie: any): Film => ({
  id: movie.id,
  title: movie.title,
  title_pt: movie.title_pt || '',
  title_es: movie.title_es || '',
  title_zh: movie.title_zh || '',
  synopsis: movie.synopsis || '',
  synopsis_pt: movie.synopsis_pt || '',
  synopsis_es: movie.synopsis_es || '',
  synopsis_zh: movie.synopsis_zh || '',
  posterUrl: movie.poster_url || '',
  img_1: movie.img_1 || '',
  img_2: movie.img_2 || '',
  img_3: movie.img_3 || '',
  videoUrl: movie.movie_url || '',
  trailerUrl: movie.trailer_url || '',
  price: movie.price || 0,
  duration: movie.duration || 0,
  genre: movie.genre || '',
  rating: movie.rating || 0,
  releaseYear: movie.release_year || new Date().getFullYear(),
  launch: movie.launch || false,  
  main: movie.main || false,       
  description: movie.description || '' 
})

// Salva ou atualiza o progresso do filme
export const saveFilmProgress = async (
  userId: string, 
  filmId: string, 
  timeWatched: number
): Promise<boolean> => {
  try {
    // Usa upsert para inserir ou atualizar baseado na chave única (user_id, movie_id)
    const { error } = await supabase
      .from('film_progress')
      .upsert(
        {
          user_id: userId,
          movie_id: filmId,
          time_watched: timeWatched
        },
        {
          onConflict: 'user_id,movie_id', // Conflito na chave única
          ignoreDuplicates: false // Sempre atualiza se existir
        }
      )

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error saving film progress:', error)
    return false
  }
}

// Busca o progresso de um filme específico
export const getFilmProgress = async (
  userId: string, 
  filmId: string
): Promise<number | null> => {
  try {
    const { data, error } = await supabase
      .from('film_progress')
      .select('time_watched')
      .eq('user_id', userId)
      .eq('movie_id', filmId)
      .single()

    if (error) {
      // Se não encontrar registro, retorna null (filme não iniciado)
      if (error.code === 'PGRST116') return null
      throw error
    }

    return data?.time_watched || null
  } catch (error) {
    console.error('Error fetching film progress:', error)
    return null
  }
}

// Busca todos os progressos do usuário
export const getAllUserProgress = async (userId: string): Promise<FilmProgress[]> => {
  try {
    const { data, error } = await supabase
      .from('film_progress')
      .select('*')
      .eq('user_id', userId)
      .order('last_updated', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching all user progress:', error)
    return []
  }
}

// Busca filmes com progresso e detalhes
export const getUserFilmsWithProgress = async (userId: string): Promise<(Film & { progress: number })[]> => {
  try {
    const { data, error } = await supabase
      .from('film_progress')
      .select(`
        time_watched,
        movies (*)
      `)
      .eq('user_id', userId)
      .order('last_updated', { ascending: false })

    if (error) throw error

    return data?.map(item => ({
      ...mapMovieToFilm(item.movies),
      progress: item.time_watched
    })) || []
  } catch (error) {
    console.error('Error fetching films with progress:', error)
    return []
  }
}

// Remove o progresso de um filme (reset)
export const deleteFilmProgress = async (
  userId: string, 
  filmId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('film_progress')
      .delete()
      .eq('user_id', userId)
      .eq('movie_id', filmId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error deleting film progress:', error)
    return false
  }
}

// Função para salvar progresso periodicamente (a cada X segundos)
export const createProgressSaver = (
  userId: string, 
  filmId: string, 
  intervalSeconds: number = 10
) => {
  let interval: NodeJS.Timeout | null = null
  let lastSavedTime = 0

  return {
    start: (getCurrentTime: () => number) => {
      // Salva imediatamente ao iniciar
      const currentTime = getCurrentTime()
      if (currentTime !== lastSavedTime) {
        saveFilmProgress(userId, filmId, currentTime)
        lastSavedTime = currentTime
      }

      // Configura salvamento periódico
      interval = setInterval(() => {
        const currentTime = getCurrentTime()
        // Só salva se o tempo mudou significativamente (mais de 1 segundo)
        if (Math.abs(currentTime - lastSavedTime) > 1) {
          saveFilmProgress(userId, filmId, currentTime)
          lastSavedTime = currentTime
        }
      }, intervalSeconds * 1000)
    },
    
    stop: (finalTime?: number) => {
      if (interval) {
        clearInterval(interval)
        interval = null
      }
      // Salva o tempo final se fornecido
      if (finalTime !== undefined && finalTime !== lastSavedTime) {
        saveFilmProgress(userId, filmId, finalTime)
      }
    },
    
    saveNow: (currentTime: number) => {
      if (currentTime !== lastSavedTime) {
        saveFilmProgress(userId, filmId, currentTime)
        lastSavedTime = currentTime
      }
    }
  }
}