import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { type Profile } from './types'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import Navbar from './components/Layout/Navbar'

export default function App() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) fetchProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (uid: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).single()
    setProfile(data)
    setLoading(false)
  }

  if (loading) return <p style={{ padding: 24 }}>Loading...</p>

  return (
    <BrowserRouter>
      {profile && <Navbar profile={profile} onSignOut={() => supabase.auth.signOut()} />}
      <Routes>
        <Route path="/auth" element={!profile ? <AuthPage /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={
          !profile ? <Navigate to="/auth" /> : <Dashboard profile={profile} />
        } />
        <Route path="*" element={<Navigate to={profile ? '/dashboard' : '/auth'} />} />
      </Routes>
    </BrowserRouter>
  )
}
