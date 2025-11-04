import { createClient } from '@supabase/supabase-js'
import type { Film } from '@/lib/types' 

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export interface Purchase {
  id: string
  user_id: string
  movie_id: string
  amount: number
  payment_id: string
  payment_method: string
  status: string
  created_at: string
}

export interface FilmProgress {
  id: string
  user_id: string
  movie_id: string
  time_watched: number 
  last_updated: string
  created_at: string
}

// Busca todos os IDs de filmes comprados por um usuário
export const getUserPurchasedFilmIds = async (userId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .select('movie_id')
      .eq('user_id', userId)
      .eq('status', 'completed')

    if (error) throw error

    return data?.map(purchase => purchase.movie_id) || []
  } catch (error) {
    return []
  }
}

// Função auxiliar para converter snake_case para camelCase
const mapMovieToFilm = (movie: any): Film => ({
  id: movie.id,
  title: movie.title,
  title_pt: movie.title_pt || movie.title,
  title_es: movie.title_es || movie.title,
  title_zh: movie.title_zh || movie.title,
  synopsis: movie.synopsis || '',
  synopsis_pt: movie.synopsis_pt || movie.synopsis || '',
  synopsis_es: movie.synopsis_es || movie.synopsis || '',
  synopsis_zh: movie.synopsis_zh || movie.synopsis || '',
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

// Busca detalhes completos dos filmes comprados
export const getUserPurchasedFilms = async (userId: string): Promise<Film[]> => {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .select(`
        *,
        movies (*)
      `)
      .eq('user_id', userId)
      .eq('status', 'completed')

    if (error) throw error

    return data?.map(purchase => mapMovieToFilm(purchase.movies)) || []
  } catch (error) {
    return []
  }
}

// Verifica se um usuário comprou um filme específico
export const hasUserPurchasedFilm = async (userId: string, filmId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .select('id')
      .eq('user_id', userId)
      .eq('movie_id', filmId)
      .eq('status', 'completed')
      .single()

    return !error && !!data
  } catch (error) {
    return false
  }
}