import { User, Session } from '@supabase/supabase-js'
import { useRouter } from 'next/dist/client/router'
import { createContext, useState } from 'react'
import { useEffect } from "react"
import { supabase } from "../../services/supabase"

type AuthContextType = {
  user?: User,
  session?: Session,
  login?: () => void,
  logout?: () => void
}

export const AuthContext = createContext({} as AuthContextType)

export function AuthProvider({ children }) {
  const [user, setUser] = useState<User>()
  const [session, setSession] = useState<Session>()
  const routes = useRouter()

  useEffect(() => {
    const current_session = supabase.auth.session()

    if(current_session) {
      setSession(current_session)
      setUser(current_session.user)

      routes.push('/feed')
    }

    const { data } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession)
      setUser(newSession?.user)

      fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        credentials: 'same-origin',
        body: JSON.stringify({ event, session: newSession})
      })

      routes.push('/feed')
    })

    return () => {
      data.unsubscribe()
    }
  }, [])

  async function login() {
    const { error } = await supabase.auth.signIn({
      provider: 'github',
    })

    if(error) {
      console.error(error)
      return
    }

  }

  async function logout() {
    const {error} = await supabase.auth.signOut()
    if(error){
      console.error(error)
    } else {
      routes.push('/')
    }
  }

  const data = {
    login,
    logout,
    user,
    session,
    routes
  }

  return (
    <AuthContext.Provider value={data}>
      {children}
    </AuthContext.Provider>
  )
}