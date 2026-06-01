import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Perfil } from '../services/auth'
import { getPerfil, signOut as authSignOut } from '../services/auth'

export function useAuth() {
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        getPerfil(session.user.id)
          .then(setPerfil)
          .finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          const p = await getPerfil(session.user.id)
          setPerfil(p)
        } else {
          setPerfil(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function signOut() {
    await authSignOut()
    setPerfil(null)
  }

  return { perfil, loading, signOut }
}
