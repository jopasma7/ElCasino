import { useEffect, useState } from 'react'
import { userProfileAPI } from '../services/api'

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setIsAdmin(false)
        setLoading(false)
        return
      }
      try {
        const response = await userProfileAPI.getMe()
        setIsAdmin(response.data?.role === 'Administrador')
      } catch {
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
    // Escuchar cambios de autenticación
    const handler = () => fetchProfile()
    window.addEventListener('user-auth-changed', handler)
    return () => window.removeEventListener('user-auth-changed', handler)
  }, [])

  return { isAdmin, loading }
}
