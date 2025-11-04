export interface Film {
  id: string
  title: string
  title_pt: string
  title_es: string
  title_zh: string
  synopsis: string
  synopsis_pt: string
  synopsis_es: string
  synopsis_zh: string
  price: number
  posterUrl: string
  img_1: string
  img_2: string
  img_3: string
  trailerUrl: string
  videoUrl: string
  genre: string
  duration: number
  releaseYear: number
  rating: number
  launch: boolean
  main: boolean
  description: string
  created_at?: string
}

export interface Client {
  id: string
  name: string
  email: string
  password: string
  avatar?: string
}

export interface ClientFilm {
  id: string
  clientId: string
  filmId: string
  purchaseDate: Date
}
