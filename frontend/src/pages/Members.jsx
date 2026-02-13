import React, { useEffect, useState } from 'react'
import { usersAPI } from '../services/api'
import { useAdmin } from '../hooks/useAdmin'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const Members = () => {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const { isAdmin, loading: adminLoading } = useAdmin()

  const fetchMembers = async (params = {}) => {
    setLoading(true)
    try {
      const response = await usersAPI.getAll({
        page,
        pageSize,
        search,
        role,
        ...params
      })
      setMembers(response.data.users)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      setMembers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
    // eslint-disable-next-line
  }, [page, pageSize, search, role])

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
      {/* Filtros de búsqueda */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
        <div className="flex flex-col md:flex-row items-center gap-2 w-full md:w-auto">
          <label htmlFor="searchMembers" className="font-medium text-neutral-700">Filtro:</label>
          <input
            id="searchMembers"
            type="text"
            placeholder="Buscar por nombre, email o teléfono"
            value={search}
            onChange={e => { setPage(1); setSearch(e.target.value) }}
            className="border rounded-lg px-3 py-2 w-full md:w-96"
          />
        </div>
        {isAdmin && (
          <select
            value={role}
            onChange={e => { setPage(1); setRole(e.target.value) }}
            className="border rounded-lg px-3 py-2 w-full md:w-48"
          >
            <option value="">Todos los roles</option>
            <option value="Administrador">Administrador</option>
            <option value="Usuario">Usuario</option>
          </select>
        )}
      </div>
      {loading || adminLoading ? (
        <div className="text-center text-neutral-500">Cargando...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {members.map(user => (
              <div key={user.id} className="bg-white rounded-lg shadow p-3 sm:p-4 flex flex-col items-center">
                <img
                  src={user.avatar ? (user.avatar.startsWith('http') ? user.avatar : `https://elcasino-backend.zeabur.app${user.avatar}`) : '/default-avatar.png'}
                  alt={user.name}
                  className="w-16 h-16 sm:w-24 sm:h-24 rounded-full object-cover mb-2 sm:mb-4 border border-neutral-200"
                />
                <div className="text-base sm:text-lg font-semibold text-neutral-900 mb-0.5 sm:mb-1 text-center break-words">{user.name}</div>
                <div className="text-xs sm:text-sm text-neutral-500 text-center break-words">{user.email}</div>
                {isAdmin && (
                  <div className="mt-2 sm:mt-4 flex flex-col sm:flex-row gap-2 w-full">
                    <button
                      onClick={() => handleChangeRole(user)}
                      className={`w-full sm:w-auto px-2 sm:px-4 py-1 rounded-lg font-semibold text-xs shadow transition-all duration-150 border focus:outline-none focus:ring-2 focus:ring-yellow-400/60
                        ${user.role === 'Administrador'
                          ? 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200 hover:text-yellow-900'
                          : 'bg-neutral-900 text-white border-neutral-800 hover:bg-yellow-400 hover:text-yellow-900 hover:border-yellow-400'}
                      `}
                    >
                      {user.role === 'Administrador' ? 'Quitar Admin' : 'Asignar Admin'}
                    </button>
                    <button
                      onClick={() => handleDelete(user)}
                      className="w-full sm:w-auto px-2 sm:px-4 py-1 rounded-lg font-semibold text-xs shadow transition-all duration-150 border border-red-300 bg-red-100 text-red-700 hover:bg-red-600 hover:text-white hover:border-red-600 focus:outline-none focus:ring-2 focus:ring-red-400/60"
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* Paginación */}
          <div className="flex flex-col xs:flex-row flex-wrap justify-center items-center gap-2 mt-6 sm:mt-8 w-full">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2 sm:px-3 py-1 rounded bg-neutral-200 hover:bg-neutral-300 disabled:opacity-50 text-xs sm:text-base"
            >Anterior</button>
            <span className="mx-2 text-xs sm:text-base">Página {page} de {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2 sm:px-3 py-1 rounded bg-neutral-200 hover:bg-neutral-300 disabled:opacity-50 text-xs sm:text-base"
            >Siguiente</button>
            <select
              value={pageSize}
              onChange={e => { setPage(1); setPageSize(Number(e.target.value)) }}
              className="border rounded px-1 sm:px-2 py-1 text-xs sm:text-base w-auto"
            >
              {[10, 20, 50, 100].map(size => (
                <option key={size} value={size}>{size} por página</option>
              ))}
            </select>
          </div>
        </>
      )}
    </div>
  )
}

export default Members
