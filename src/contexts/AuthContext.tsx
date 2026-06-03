import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { Perfil } from '../services/auth'
import { getPerfil, signOut as authSignOut } from '../services/auth'

interface AuthContextType {
  perfil: Perfil | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  perfil: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('getSession:', session?.user?.id, error)
        if (!mounted) return
        if (session?.user) {
          const p = await getPerfil(session.user.id)
          console.log('getPerfil:', p)
          if (mounted) setPerfil(p)
        }
      } catch (err) {
        console.error('init error:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    const timeout = setTimeout(() => {
      if (mounted) setLoading(false)
    }, 3000)

    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('onAuthStateChange:', event, session?.user?.id)
        if (!mounted) return
        if (session?.user) {
          try {
            const p = await getPerfil(session.user.id)
            console.log('getPerfil from event:', p)
            if (mounted) setPerfil(p)
          } catch (err) {
            console.error('getPerfil error:', err)
          }
        } else {
          if (mounted) setPerfil(null)
        }
      }
    )

    return () => {
      mounted = false
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  async function signOut() {
    await authSignOut()
    setPerfil(null)
  }

  return (
    <AuthContext.Provider value={{ perfil, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
