// Utility to handle post-login redirects
export interface PostLoginAction {
  type: 'purchase-film' | 'view-film'
  filmId: string
  filmData?: any // Optional film data to avoid re-fetching
}

const STORAGE_KEY = 'eros_post_login_action'

// Store the action that should be executed after login
export const setPostLoginAction = (action: PostLoginAction): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(action))
  }
}

// Get and clear the stored action
export const getAndClearPostLoginAction = (): PostLoginAction | null => {
  if (typeof window === 'undefined') return null
  
  try {
    const storedAction = localStorage.getItem(STORAGE_KEY)
    if (!storedAction) return null
    
    // Clear the action immediately
    localStorage.removeItem(STORAGE_KEY)
    
    return JSON.parse(storedAction) as PostLoginAction
  } catch (error) {
    // Clear invalid data
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}

// Clear any pending action (useful for cleanup)
export const clearPostLoginAction = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
  }
}

// Check if there's a pending action
export const hasPostLoginAction = (): boolean => {
  if (typeof window === 'undefined') return false
  
  return localStorage.getItem(STORAGE_KEY) !== null
}