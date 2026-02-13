import React, { useEffect, useState } from 'react'
import { usersAPI } from '../services/api'
import { useAdmin } from '../hooks/useAdmin'

const Members = () => {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const { isAdmin, loading: adminLoading } = useAdmin()

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await usersAPI.getAll()
        setMembers(response.data)
      } catch (error) {
        setMembers([])
      } finally {
        setLoading(false)
      }
    }
    fetchMembers()
  }, [])

  const handleChangeRole = async (user) => {
    const newRole = user.role === 'Administrador' ? 'Usuario' : 'Administrador'
    try {
      await usersAPI.changeRole(user.id, newRole)
      setMembers(members.map(u => u.id === user.id ? { ...u, role: newRole } : u))
    } catch (error) {
      alert('Error al cambiar rol')
    }
  }

  const handleDelete = async (user) => {
    if (!window.confirm('¿Seguro que quieres eliminar este usuario?')) return
    try {
      await usersAPI.delete(user.id)
      setMembers(members.filter(u => u.id !== user.id))
    } catch (error) {
      alert('Error al eliminar usuario')
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Miembros registrados</h1>
      {loading || adminLoading ? (
        <div className="text-center text-neutral-500">Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {members.map(user => (
            <div key={user.id} className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
              <img
                src={user.avatar ? (user.avatar.startsWith('http') ? user.avatar : `https://elcasino-backend.zeabur.app${user.avatar}`) : '/default-avatar.png'}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover mb-4 border border-neutral-200"
              />
              <div className="text-lg font-semibold text-neutral-900 mb-1">{user.name}</div>
              <div className="text-sm text-neutral-500">{user.email}</div>
              {isAdmin && (
                <div className="mt-4 flex gap-2">
                  <button className="btn-admin" onClick={() => handleChangeRole(user)}>
                    {user.role === 'Administrador' ? 'Quitar Admin' : 'Asignar Admin'}
                  </button>
                  <button className="btn-danger" onClick={() => handleDelete(user)}>
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Members
