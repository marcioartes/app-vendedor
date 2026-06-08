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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!mounted) return
        if (session?.user) {
          try {
            const p = await getPerfil(session.user.id)
            if (mounted) {
              setPerfil(p)
              setLoading(false)
            }
          } catch {
            if (mounted) setLoading(false)
          }
        } else {
          if (mounted) {
            setPerfil(null)
            setLoading(false)
          }
        }
      }
    )

    return () => {
      mounted = false
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
