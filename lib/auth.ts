import { supabase, type Database } from './supabase'
import type { User } from '@supabase/supabase-js'

export type UserRole = 'CLIENT' | 'ADMIN' | 'STAFF'

export interface Client {
  id: string
  name: string
  email: string
  role: UserRole
  created_at?: string
}

// Get current authenticated user
export const getCurrentUser = (): Client | null => {
  if (typeof window === 'undefined') return null
  
  const userData = localStorage.getItem('eros_user')
  return userData ? JSON.parse(userData) : null
}

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null
}

// Login function - SIMPLIFICADO
export const login = async (email: string, password: string): Promise<Client | null> => {
  try {
    // Tentar login direto com o email fornecido
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      return null
    }

    // Buscar dados do usuário da tabela users
    const { data: clientData, error: clientError } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .eq('id', authData.user.id)
      .maybeSingle()

    if (clientError || !clientData) {
      return null
    }

    // IMPORTANTE: Sempre usar o email do Auth, não da tabela users
    const client: Client = {
      id: clientData.id,
      name: clientData.name,
      email: authData.user.email || clientData.email, // Priorizar email do Auth
      role: clientData.role,
      created_at: clientData.created_at,
    }

    localStorage.setItem('eros_user', JSON.stringify(client))
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('user-login'))
    }
    
    return client
    
  } catch (error) {
    return null
  }
}

// Register function - SEM HOOKS
export const register = async (name: string, email: string, password: string): Promise<Client | null> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name
        }
      }
    })

    if (authError) {
      throw new Error(authError.message)
    }

    if (!authData.user) {
      throw new Error('Failed to create user account')
    }

    await new Promise(resolve => setTimeout(resolve, 1000))

    const { data: clientData, error: clientError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        name,
        email,
        role: 'CLIENT'
      })
      .select('id, name, email, role, created_at')
      .single()

    if (clientError) {
      try {
        await supabase.auth.signOut()
      } catch (e) {
        // Silent error handling for signout
      }
      throw new Error('Failed to create user profile: ' + clientError.message)
    }

    const client: Client = {
      id: clientData.id,
      name: clientData.name,
      email: authData.user.email || clientData.email, // Priorizar email do Auth
      role: clientData.role,
      created_at: clientData.created_at,
    }

    localStorage.setItem('eros_user', JSON.stringify(client))
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('user-login'))
    }
    
    return client
  } catch (error) {
    throw error
  }
}

// Update user name - SEM HOOKS
export const updateUserName = async (name: string): Promise<Client | null> => {
  try {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      throw new Error('User not authenticated')
    }

    // Update in users table
    const { data: updatedData, error: updateError } = await supabase
      .from('users')
      .update({ name })
      .eq('id', currentUser.id)
      .select('id, name, email, role, created_at')
      .single()

    if (updateError) {
      throw new Error('Failed to update name: ' + updateError.message)
    }

    const updatedClient: Client = {
      id: updatedData.id,
      name: updatedData.name,
      email: currentUser.email, // Manter o email atual do localStorage
      role: updatedData.role,
      created_at: updatedData.created_at,
    }

    // Update localStorage
    localStorage.setItem('eros_user', JSON.stringify(updatedClient))
    
    // Dispatch update event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('user-updated', { detail: updatedClient }))
    }

    return updatedClient
  } catch (error) {
    throw error
  }
}

// Update user email - SEM HOOKS
export const updateUserEmail = async (newEmail: string): Promise<Client | null> => {
  try {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      throw new Error('User not authenticated')
    }

    // PASSO CRUCIAL: Obter o email atual do Auth
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      throw new Error('Could not get authenticated user')
    }

    // 1. Atualizar Auth primeiro
    const { error: authError } = await supabase.auth.updateUser({ 
      email: newEmail 
    })

    if (authError) {
      throw new Error('Failed to update email: ' + authError.message)
    }

    // 2. Atualizar tabela users
    const { data: updatedData, error: updateError } = await supabase
      .from('users')
      .update({ email: newEmail })
      .eq('id', currentUser.id)
      .select('id, name, email, role, created_at')
      .single()

    if (updateError) {
      console.warn('Error updating email in users table:', updateError)
      // Não reverter - o Auth já foi atualizado
    }

    const updatedClient: Client = {
      id: currentUser.id,
      name: updatedData?.name || currentUser.name,
      email: newEmail, // Usar o novo email
      role: updatedData?.role || currentUser.role,
      created_at: updatedData?.created_at || currentUser.created_at,
    }

    // 3. Atualizar localStorage
    localStorage.setItem('eros_user', JSON.stringify(updatedClient))
    
    // 4. Disparar evento de atualização
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('user-updated', { detail: updatedClient }))
    }

    // 5. IMPORTANTE: Informar que precisa relogar
    console.log('Email updated. Please log in again to ensure synchronization.')

    return updatedClient
  } catch (error) {
    throw error
  }
}

// Função para sincronizar emails
export const syncUserEmails = async (): Promise<void> => {
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser || !authUser.email) return

    // Atualizar tabela users com o email do Auth
    await supabase
      .from('users')
      .update({ email: authUser.email })
      .eq('id', authUser.id)

    // Atualizar localStorage
    const currentUser = getCurrentUser()
    if (currentUser && currentUser.id === authUser.id) {
      const updatedUser = { ...currentUser, email: authUser.email }
      localStorage.setItem('eros_user', JSON.stringify(updatedUser))
    }
  } catch (error) {
    console.error('Error syncing emails:', error)
  }
}

// Função de debug melhorada
export const debugUserState = async (): Promise<void> => {
  console.log('=== DEBUG USER STATE ===')
  
  // 1. localStorage
  const localUser = getCurrentUser()
  console.log('1. Local user:', localUser)
  
  // 2. Auth user
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
  console.log('2. Auth user:', authUser ? {
    id: authUser.id,
    email: authUser.email,
    email_confirmed_at: authUser.email_confirmed_at,
  } : 'Not authenticated', authError)
  
  if (authUser) {
    // 3. Database user
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single()
    console.log('3. DB user:', dbUser, dbError)
    
    // 4. Verificar discrepâncias
    if (dbUser && authUser.email !== dbUser.email) {
      console.warn('⚠️ DISCREPANCY: Auth email:', authUser.email, 'DB email:', dbUser.email)
    }
    
    if (localUser && authUser.email !== localUser.email) {
      console.warn('⚠️ DISCREPANCY: Auth email:', authUser.email, 'Local email:', localUser.email)
    }
  }
  
  console.log('=== END DEBUG ===')
}

// Update user password - SEM HOOKS
export const updateUserPassword = async (password: string): Promise<void> => {
  try {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      throw new Error('User not authenticated')
    }

    // Update auth password
    const { error: authError } = await supabase.auth.updateUser({ 
      password 
    })

    if (authError) {
      throw new Error('Failed to update password: ' + authError.message)
    }
  } catch (error) {
    throw error
  }
}

// Verifica senha atual - SIMPLIFICADO
export const verificaSenhaAtual = async (password: string): Promise<boolean> => {
  try {
    // Obter o email atual do Auth, não do localStorage
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser?.email) return false

    // Criar uma nova sessão temporária para verificar a senha
    const { data, error } = await supabase.auth.signInWithPassword({
      email: authUser.email, // Usar email do Auth
      password
    })

    // Se a senha está correta, a autenticação funcionará
    return !error && data.user !== null
  } catch (error) {
    console.error('Error verifying password:', error)
    return false
  }
}

// Logout function
export const logout = async (): Promise<void> => {
  try {
    await supabase.auth.signOut()
    localStorage.removeItem('eros_user')
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('user-logout'))
    }
  } catch (error) {
    localStorage.removeItem('eros_user')
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('user-logout'))
    }
  }
}

// Initialize auth state on app load - MELHORADO
export const initializeAuth = async (): Promise<Client | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user) {
      localStorage.removeItem('eros_user')
      return null
    }

    // Sempre sincronizar com dados atuais
    const { data: clientData, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .eq('id', session.user.id)
      .maybeSingle()

    if (error || !clientData) {
      await logout()
      return null
    }

    // Sincronizar email se houver discrepância
    if (session.user.email && session.user.email !== clientData.email) {
      console.log('Email discrepancy detected, syncing...')
      console.log('Auth email:', session.user.email)
      console.log('DB email:', clientData.email)
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ email: session.user.email })
        .eq('id', session.user.id)
      
      if (updateError) {
        console.error('Error syncing email:', updateError)
      }
    }

    // IMPORTANTE: Usar email do Auth, não da tabela
    const client: Client = {
      id: clientData.id,
      name: clientData.name,
      email: session.user.email || clientData.email, // Priorizar email do Auth
      role: clientData.role,
      created_at: clientData.created_at,
    }

    localStorage.setItem('eros_user', JSON.stringify(client))
    
    return client
  } catch (error) {
    localStorage.removeItem('eros_user')
    return null
  }
}