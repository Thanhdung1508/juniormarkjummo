import { t, useLanguage, localize, translateError } from '../../i18n/language'
import { useEffect, useRef, useState } from 'react'
import { validateProfile } from '../account/account'
import { apiClient } from '../../lib/apiClient'
import { authErrorMessage } from '../../lib/helpers'
import { AuthContext } from './authContext'

export default function AuthProvider({ children }) {
  useLanguage()
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(Boolean(apiClient))
  const [profile, setProfile] = useState(null)
  const [profileError, setProfileError] = useState('')
  const [recovering, setRecovering] = useState(false)
  const [recoveryOpen, setRecoveryOpen] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')
  const currentUser = useRef(null)

  useEffect(() => {
    if (!apiClient) return
    // Không gọi truy vấn async trong callback này để tránh khóa Auth SDK.
    const {
      data: { subscription },
    } = apiClient.auth.onAuthStateChange((_event, nextSession) => {
      const previousUser = currentUser.current
      currentUser.current = nextSession?.user?.id || null
      setSession(nextSession)
      setLoading(false)
      // Chỉ lưu mã tài khoản để phục hồi UI, không lưu token/mật khẩu hoặc cấp quyền ở client.
      // backend Kotlin vẫn kiểm tra quyền đổi mật khẩu của session ở máy chủ.
      let recoveryUser = null
      try {
        recoveryUser = sessionStorage.getItem('jm-recovery-user')
      } catch {
        /* Storage có thể bị chặn. */
      }
      if (_event === 'PASSWORD_RECOVERY') {
        try {
          sessionStorage.setItem('jm-recovery-user', nextSession.user.id)
        } catch {
          /* Giữ trạng thái trong phiên React. */
        }
        setRecovering(true)
        setRecoveryOpen(true)
      } else if (_event === 'INITIAL_SESSION' && nextSession?.user.id === recoveryUser) {
        setRecovering(true)
        setRecoveryOpen(true)
      } else if (
        !nextSession ||
        (previousUser && previousUser !== nextSession.user.id) ||
        (recoveryUser && recoveryUser !== nextSession.user.id)
      ) {
        setRecovering(false)
        setRecoveryOpen(false)
        try {
          sessionStorage.removeItem('jm-recovery-user')
        } catch {
          /* Không chặn đăng xuất. */
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const userId = session?.user?.id
  useEffect(() => {
    let active = true
    if (!apiClient || !userId) return
    apiClient
      .from('fan_profiles')
      .select('id, display_name, avatar_url, bio, created_at')
      .eq('id', userId)
      .single()
      .then(({ data, error }) => {
        if (!active) return
        setProfile(data)
        setProfileError(
          error
            ? t(
                'Chưa tải được hồ sơ cộng đồng. Vui lòng thử tải lại trang.',
                'Your community profile could not load. Please reload the page.',
              )
            : '',
        )
      })
      .catch(() => {
        if (active)
          setProfileError(
            t('Chưa kết nối được hồ sơ cộng đồng.', 'Unable to connect to your community profile.'),
          )
      })
    return () => {
      active = false
    }
  }, [userId])

  const actions = {
    configured: Boolean(apiClient),
    recovering,
    recoveryOpen,
    passwordMessage: localize(passwordMessage),
    dismissRecovery: () => setRecoveryOpen(false),
    async requestPasswordReset(email) {
      if (!apiClient)
        throw new Error(
          t('Dịch vụ tài khoản chưa được cấu hình.', 'Account services are not configured.'),
        )
      const { error } = await apiClient.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin + window.location.pathname,
      })
      if (error) throw new Error(authErrorMessage(error))
    },
    async updatePassword(password, oldPassword) {
      if (!apiClient || !userId)
        throw new Error(
          t(
            'Đăng nhập hoặc mở liên kết khôi phục từ email.',
            'Sign in or open the recovery link from your email.',
          ),
        )
      if (password.length < 8)
        throw new Error(
          t('Mật khẩu cần ít nhất 8 ký tự.', 'Your password must contain at least 8 characters.'),
        )
      if (!recovering && !apiClient.isLocal) {
        if (!oldPassword)
          throw new Error(t('Nhập mật khẩu hiện tại.', 'Enter your current password.'))
        const { error } = await apiClient.auth.signInWithPassword({
          email: session.user.email,
          password: oldPassword,
        })
        if (error) throw new Error(authErrorMessage(error))
      }
      if (currentUser.current !== userId)
        throw new Error(
          t(
            'Phiên đăng nhập đã thay đổi. Vui lòng thử lại.',
            'Your session has changed. Please try again.',
          ),
        )
      const { error } = await apiClient.auth.updateUser({
        password,
        ...(apiClient.isLocal ? { oldPassword } : {}),
      })
      if (error) throw new Error(authErrorMessage(error))
      setRecovering(false)
      setRecoveryOpen(false)
      setPasswordMessage(t('Đã cập nhật mật khẩu thành công.', 'Your password has been updated.'))
      try {
        sessionStorage.removeItem('jm-recovery-user')
      } catch {
        /* Không lưu bí mật ở đây. */
      }
    },
    async updateProfile(values) {
      if (!apiClient || !userId) throw new Error(t('Vui lòng đăng nhập.', 'Please sign in.'))
      const invalid = validateProfile(values)
      if (invalid) throw new Error(invalid)
      const { data, error } = await apiClient
        .from('fan_profiles')
        .update({
          display_name: values.display_name.trim(),
          bio: values.bio || '',
          avatar_url: values.avatar_url?.trim() || null,
        })
        .eq('id', userId)
        .select('id,display_name,bio,avatar_url,created_at')
        .single()
      if (error)
        throw new Error(
          t(
            'Chưa lưu được hồ sơ. Kiểm tra kết nối và cấu hình database.',
            'Your profile could not be saved. Please check your connection and try again.',
          ),
        )
      if (currentUser.current === userId) setProfile(data)
    },
    async signIn(values) {
      if (!apiClient)
        throw new Error(
          t('Dịch vụ tài khoản chưa được cấu hình.', 'Account services are not configured.'),
        )
      const { data, error } = await apiClient.auth.signInWithPassword({
        email: values.email.trim(),
        password: values.password,
      })
      if (error) throw new Error(authErrorMessage(error))
      setSession(data.session)
      return data
    },
    async signUp(values) {
      if (!apiClient)
        throw new Error(
          t('Dịch vụ tài khoản chưa được cấu hình.', 'Account services are not configured.'),
        )
      const { data, error } = await apiClient.auth.signUp({
        email: values.email.trim(),
        password: values.password,
        options: {
          data: { display_name: values.displayName.trim() },
          emailRedirectTo: window.location.origin,
        },
      })
      if (error) throw new Error(authErrorMessage(error))
      if (data.session) setSession(data.session)
      return data
    },
    async signOut(scope = 'local') {
      if (!apiClient) return
      const { error } = await apiClient.auth.signOut({
        scope: scope === 'global' ? 'global' : 'local',
      })
      if (error) throw new Error(authErrorMessage(error))
      setSession(null)
      setProfile(null)
      setProfileError('')
      currentUser.current = null
      setRecovering(false)
      setRecoveryOpen(false)
      setPasswordMessage('')
      try {
        sessionStorage.removeItem('jm-recovery-user')
      } catch {
        /* Không chặn đăng xuất. */
      }
    },
  }
  const ownProfile = profile?.id === userId ? profile : null
  return (
    <AuthContext.Provider
      value={{
        ...actions,
        session,
        loading,
        profile: ownProfile,
        profileError: userId ? translateError(profileError) : '',
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
