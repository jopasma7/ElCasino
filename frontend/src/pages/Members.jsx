import React, { useEffect, useState } from 'react'
import { usersAPI } from '../services/api'
import { useAdmin } from '../hooks/useAdmin'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

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

  const MySwal = withReactContent(Swal)

  const handleChangeRole = async (user) => {
    const newRole = user.role === 'Administrador' ? 'Usuario' : 'Administrador'
    const result = await MySwal.fire({
      title: `<span style="color:#a66a06;font-weight:bold">¿${user.role === 'Administrador' ? 'Quitar' : 'Asignar'} admin?</span>`,
      html: `<div style="color:#444">¿Seguro que quieres ${user.role === 'Administrador' ? 'quitarle' : 'asignarle'} el rol de administrador a <b>${user.name}</b>?</div>`,
      icon: 'question',
      showCancelButton: true,
      focusCancel: true,
      confirmButtonColor: '#a66a06',
      cancelButtonColor: '#d33',
      confirmButtonText: `<b>${user.role === 'Administrador' ? 'Quitar Admin' : 'Asignar Admin'}</b>`,
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'swal2-rounded swal2-shadow',
        confirmButton: 'swal2-confirm-custom',
        cancelButton: 'swal2-cancel-custom'
      },
      buttonsStyling: false
    })
    if (!result.isConfirmed) return
    try {
      await usersAPI.changeRole(user.id, newRole)
      setMembers(members.map(u => u.id === user.id ? { ...u, role: newRole } : u))
      toast.success(`Rol actualizado: ${user.name} ahora es ${newRole}`)
    } catch (error) {
      toast.error('Error al cambiar rol')
    }
  }

  const handleDelete = async (user) => {
    const result = await MySwal.fire({
      title: `<span style="color:#a66a06;font-weight:bold">¿Eliminar usuario?</span>`,
      html: `<div style="color:#444">¿Seguro que quieres eliminar a <b>${user.name}</b>?<br><b>Esta acción no se puede deshacer.</b></div>`,
      icon: 'warning',
      showCancelButton: true,
      focusCancel: true,
      confirmButtonColor: '#a66a06',
      cancelButtonColor: '#d33',
      confirmButtonText: '<b>Eliminar</b>',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'swal2-rounded swal2-shadow',
        confirmButton: 'swal2-confirm-custom',
        cancelButton: 'swal2-cancel-custom'
      },
      buttonsStyling: false
    })
    if (!result.isConfirmed) return
    try {
      await usersAPI.delete(user.id)
      setMembers(members.filter(u => u.id !== user.id))
      toast.success(`Usuario eliminado: ${user.name}`)
    } catch (error) {
      toast.error('Error al eliminar usuario')
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
                  <button
                    onClick={() => handleChangeRole(user)}
                    className={`px-4 py-1.5 rounded-lg font-semibold text-xs shadow transition-all duration-150 border focus:outline-none focus:ring-2 focus:ring-yellow-400/60
                      ${user.role === 'Administrador'
                        ? 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200 hover:text-yellow-900'
                        : 'bg-neutral-900 text-white border-neutral-800 hover:bg-yellow-400 hover:text-yellow-900 hover:border-yellow-400'}
                    `}
                  >
                    {user.role === 'Administrador' ? 'Quitar Admin' : 'Asignar Admin'}
                  </button>
                  <button
                    onClick={() => handleDelete(user)}
                    className="px-4 py-1.5 rounded-lg font-semibold text-xs shadow transition-all duration-150 border border-red-300 bg-red-100 text-red-700 hover:bg-red-600 hover:text-white hover:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-400/60"
                  >
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
