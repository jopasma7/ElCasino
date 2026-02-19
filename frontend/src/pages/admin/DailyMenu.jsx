import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, X } from 'lucide-react';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { dailyMenuAPI, dailyMenuOptionsAPI } from '../../services/api';

const MySwal = withReactContent(Swal);

const DailyMenu = () => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    price: '12.00',
    completeSingleDishPrice: '10.00',
    starters: '',
    mains: '',
    desserts: ''
  });
  const [menuOptions, setMenuOptions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionSubmitting, setOptionSubmitting] = useState(false);
  const [optionForm, setOptionForm] = useState({
    name: '',
    type: 'starter'
  });

  useEffect(() => {
    fetchMenus();
    fetchOptions();
  }, []);

  const fetchMenus = async () => {
    try {
      const response = await dailyMenuAPI.getToday();
      const menu = response.data.menu === undefined ? response.data : response.data.menu;
      if (menu) {
        setFormData({
          price: menu.price?.toString() || '12.00',
          completeSingleDishPrice: menu.completeSingleDishPrice?.toString() || '10.00',
          starters: Array.isArray(menu.starters) ? menu.starters.join('\n') : '',
          mains: Array.isArray(menu.mains) ? menu.mains.join('\n') : '',
          desserts: Array.isArray(menu.desserts) ? menu.desserts.join('\n') : ''
        });
      }
    } catch (error) {
      console.error('Error al cargar menú:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const response = await dailyMenuOptionsAPI.getAll();
      setMenuOptions(response.data);
    } catch (error) {
      console.error('Error al cargar opciones de menú:', error);
    } finally {
      setOptionsLoading(false);
    }
  };

  const handleCreateOption = async (e) => {
    if (e?.preventDefault) {
      e.preventDefault();
    }
    if (!optionForm.name.trim()) return;
    setOptionSubmitting(true);
    try {
      const response = await dailyMenuOptionsAPI.create({
        name: optionForm.name.trim(),
        type: optionForm.type
      });
      setMenuOptions([response.data, ...menuOptions]);
      setOptionForm({ name: '', type: optionForm.type });
    } catch (error) {
      toast.error('Error al crear opción');
    } finally {
      setOptionSubmitting(false);
    }
  };

  const handleRemoveOption = async (id) => {
    const result = await MySwal.fire({
      title: '<span style="color:#a66a06;font-weight:bold">¿Eliminar opción?</span>',
      html: '<div style="color:#444">¿Seguro que quieres eliminar esta opción rápida? <br><b>Esta acción no se puede deshacer.</b></div>',
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
    });
    if (!result.isConfirmed) return;
    try {
      await dailyMenuOptionsAPI.remove(id);
      setMenuOptions(menuOptions.filter(option => option.id !== id));
      toast.success('Opción eliminada correctamente');
    } catch (error) {
      toast.error('Error al eliminar opción');
    }
  };

  const appendOptionToList = (type, name) => {
    if (type === 'starter') {
      const currentItems = formData.starters.split('\n').filter(Boolean);
      if (currentItems.includes(name)) return;
      const updated = formData.starters ? `${formData.starters}\n${name}` : name;
      setFormData({ ...formData, starters: updated });
    }
    if (type === 'main') {
      const currentItems = formData.mains.split('\n').filter(Boolean);
      if (currentItems.includes(name)) return;
      const updated = formData.mains ? `${formData.mains}\n${name}` : name;
      setFormData({ ...formData, mains: updated });
    }
    if (type === 'dessert') {
      const currentItems = formData.desserts.split('\n').filter(Boolean);
      if (currentItems.includes(name)) return;
      const updated = formData.desserts ? `${formData.desserts}\n${name}` : name;
      setFormData({ ...formData, desserts: updated });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const menuData = {
      price: parseFloat(formData.price),
      completeSingleDishPrice: parseFloat(formData.completeSingleDishPrice),
      includes: ['Primero', 'Segundo', 'Postre o Café', 'Pan y Bebida'],
      starters: formData.starters.split('\n').filter(Boolean),
      mains: formData.mains.split('\n').filter(Boolean),
      desserts: formData.desserts.split('\n').filter(Boolean)
    };
    try {
      await dailyMenuAPI.create(menuData);
      toast.success('Menú actualizado correctamente');
    } catch (error) {
      toast.error('Error al actualizar menú');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  const handleDeleteMenu = async () => {
    const result = await MySwal.fire({
      title: '<span style="color:#a66a06;font-weight:bold">¿Eliminar menú del día?</span>',
      html: '<div style="color:#444">¿Seguro que quieres eliminar el menú del día? <br><b>Esta acción no se puede deshacer.</b></div>',
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
    });
    if (!result.isConfirmed) return;
    try {
      const response = await dailyMenuAPI.getToday();
      if (response.data && response.data.id) {
        await dailyMenuAPI.delete(response.data.id);
        toast.success('Menú eliminado correctamente');
        setFormData({
          price: '9.50',
          completeSingleDishPrice: '8.50',
          starters: '',
          mains: '',
          desserts: ''
        });
      } else {
        toast.info('No hay menú del día para eliminar');
      }
    } catch (error) {
      toast.error('Error al eliminar el menú');
    }
  };

  return (
    <div>
      <div className="mb-6">
        <div className="mb-8 w-full">
          <div className="relative rounded-2xl bg-gradient-to-r from-primary-50 via-white to-primary-100 shadow p-6 mb-2 flex items-center gap-4 border border-primary-100">
            <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-100 text-primary-700 text-3xl shadow mr-2">
              <ClipboardList className="w-9 h-9" />
            </span>
            <div>
              <h2 className="text-3xl font-extrabold text-primary-800 mb-1 drop-shadow-sm tracking-tight">Gestión del Menú Diario</h2>
              <p className="text-primary-700 text-base font-medium">Administra y personaliza el menú diario de tu restaurante de forma visual y sencilla.</p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-between items-center mb-6">
        <div></div>
        <button
          type="button"
          className="px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
          onClick={handleDeleteMenu}
        >
          Eliminar Menú
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Precio del Menú Completo (2 Platos) (€)
            </label>
            <input
              type="number"
              step="0.01"
              className="input-field"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Precio del Menú Completo (1 Plato) (€)
            </label>
            <input
              type="number"
              step="0.01"
              className="input-field"
              value={formData.completeSingleDishPrice}
              onChange={(e) => setFormData({ ...formData, completeSingleDishPrice: e.target.value })}
              required
            />
          </div>
        </div>
        <div className="border border-neutral-200 rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Opciones rápidas</h3>
              <p className="text-sm text-neutral-600">Crea y reutiliza opciones para el menú diario</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              className="input-field md:col-span-2"
              placeholder="Ej: Lentejas caseras"
              value={optionForm.name}
              onChange={(e) => setOptionForm({ ...optionForm, name: e.target.value })}
            />
            <select
              className="input-field"
              value={optionForm.type}
              onChange={(e) => setOptionForm({ ...optionForm, type: e.target.value })}
            >
              <option value="starter">Primeros</option>
              <option value="main">Segundos</option>
              <option value="dessert">Postres</option>
            </select>
            <button type="button" onClick={handleCreateOption} className="btn-primary" disabled={optionSubmitting}>
              {optionSubmitting ? 'Guardando...' : 'Añadir'}
            </button>
          </div>
          {optionsLoading ? (
            <div className="text-sm text-neutral-500">Cargando opciones...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {['starter', 'main', 'dessert'].map((type) => (
                <div key={type} className="border border-neutral-200 rounded-lg p-4">
                  <h4 className="font-semibold text-neutral-800 mb-3">
                    {type === 'starter' && 'Primeros'}
                    {type === 'main' && 'Segundos'}
                    {type === 'dessert' && 'Postres'}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {menuOptions.filter(option => option.type === type).map((option) => {
                      const isSelected = (() => {
                        if (type === 'starter') {
                          return formData.starters.split('\n').filter(Boolean).includes(option.name)
                        }
                        if (type === 'main') {
                          return formData.mains.split('\n').filter(Boolean).includes(option.name)
                        }
                        if (type === 'dessert') {
                          return formData.desserts.split('\n').filter(Boolean).includes(option.name)
                        }
                        return false
                      })();
                      return (
                        <button
                          type="button"
                          key={option.id}
                          onClick={() => appendOptionToList(type, option.name)}
                          disabled={isSelected}
                          className={`group inline-flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${
                            isSelected 
                              ? 'bg-primary-500 text-white cursor-not-allowed' 
                              : 'bg-neutral-100 hover:bg-primary-100'
                          }`}
                        >
                          <span className={`text-sm ${
                            isSelected 
                              ? 'text-white' 
                              : 'text-neutral-700 group-hover:text-primary-700'
                          }`}>
                            {option.name}
                          </span>
                          <span
                            className="text-neutral-400 hover:text-red-600"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleRemoveOption(option.id);
                            }}
                          >
                            <X className="w-4 h-4" />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Primeros Platos (uno por línea)
          </label>
          <textarea
            className="input-field"
            rows="5"
            value={formData.starters}
            onChange={(e) => setFormData({ ...formData, starters: e.target.value })}
            placeholder="Lentejas caseras&#10;Arroz a banda&#10;Ensalada mixta&#10;..."
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Segundos Platos (uno por línea)
          </label>
          <textarea
            className="input-field"
            rows="5"
            value={formData.mains}
            onChange={(e) => setFormData({ ...formData, mains: e.target.value })}
            placeholder="Pollo al ajillo&#10;Merluza a la plancha&#10;..."
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Postres (uno por línea)
          </label>
          <textarea
            className="input-field"
            rows="5"
            value={formData.desserts}
            onChange={(e) => setFormData({ ...formData, desserts: e.target.value })}
            placeholder="Tarta casera&#10;Flan&#10;Fruta del tiempo&#10;..."
            required
          />
        </div>
        <button type="submit" className="btn-primary">
          Actualizar Menú del Día
        </button>
      </form>
    </div>
  );
};

export default DailyMenu;
