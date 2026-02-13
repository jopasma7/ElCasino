import { useEffect, useState } from 'react'
import { userProfileAPI } from '../services/api'

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
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
  }, [])

  return { isAdmin, loading }
}
