import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { Perfil } from '../services/auth'
import { getPerfil } from '../services/auth'

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

    async function carregarSessao() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!mounted) return
        if (session?.user) {
          const p = await getPerfil(session.user.id)
          if (mounted) setPerfil(p)
        }
      } catch (err) {
        console.error(err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    carregarSessao()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        if (event === 'SIGNED_IN' && session?.user) {
          try {
            const p = await getPerfil(session.user.id)
            if (mounted) {
              setPerfil(p)
              setLoading(false)
            }
          } catch (err) {
            console.error(err)
            if (mounted) setLoading(false)
          }
        }

        if (event === 'SIGNED_OUT') {
          if (mounted) {
            setPerfil(null)
            setLoading(false)
            window.location.href = '/login'
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
    await supabase.auth.signOut()
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
