import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { authErrorMessage } from '../../lib/helpers'
import { AuthContext } from './authContext'

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(Boolean(supabase))
  const [profile, setProfile] = useState(null)
  const [profileError, setProfileError] = useState('')

  useEffect(() => {
    if (!supabase) return
    // Không gọi truy vấn async trong callback này để tránh khóa Auth SDK.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  const userId = session?.user?.id
  useEffect(() => {
    let active = true
    if (!supabase || !userId) return
    supabase.from('fan_profiles').select('id, display_name, created_at').eq('id', userId).single()
      .then(({ data, error }) => {
        if (!active) return
        setProfile(data)
        setProfileError(error ? 'Chưa tải được hồ sơ cộng đồng. Vui lòng thử tải lại trang.' : '')
      }).catch(() => { if (active) setProfileError('Chưa kết nối được hồ sơ cộng đồng.') })
    return () => { active = false }
  }, [userId])

  const actions = {
    configured: Boolean(supabase),
    async signIn(values) {
      if (!supabase) throw new Error('Dịch vụ tài khoản chưa được cấu hình.')
      const { data, error } = await supabase.auth.signInWithPassword({ email: values.email.trim(), password: values.password })
      if (error) throw new Error(authErrorMessage(error))
      setSession(data.session)
      return data
    },
    async signUp(values) {
      if (!supabase) throw new Error('Dịch vụ tài khoản chưa được cấu hình.')
      const { data, error } = await supabase.auth.signUp({
        email: values.email.trim(), password: values.password,
        options: { data: { display_name: values.displayName.trim() }, emailRedirectTo: window.location.origin },
      })
      if (error) throw new Error(authErrorMessage(error))
      if (data.session) setSession(data.session)
      return data
    },
    async signOut() {
      if (!supabase) return
      const { error } = await supabase.auth.signOut({ scope: 'local' })
      if (error) throw new Error(authErrorMessage(error))
      setSession(null)
      setProfile(null)
      setProfileError('')
    },
  }
  const ownProfile = profile?.id === userId ? profile : null
  return <AuthContext.Provider value={{ ...actions, session, loading, profile: ownProfile, profileError: userId ? profileError : '' }}>{children}</AuthContext.Provider>
}
