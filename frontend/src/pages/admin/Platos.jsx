
import { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Lock, Plus, Edit, Trash2, Eye, EyeOff, X } from 'lucide-react';
import '../../sweetalert2-custom.css';
import { dishesAPI, categoriesAPI } from '../../services/api';

// Imagen de plato con fallback si falla
function DishImage({ src, name }) {
	const [error, setError] = useState(false);
	if (!src || error) {
		return (
			<div className="w-full h-full flex items-center justify-center text-neutral-400">
				<svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
				</svg>
			</div>
		);
	}
	const url = src && src.startsWith('http')
		? src
		: `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000'}${src}`;
	return (
		<img
			src={url}
			alt={name}
			className="w-full h-full object-cover"
			onError={() => setError(true)}
		/>
	);
}

const MySwal = withReactContent(Swal);

const Platos = () => {
	const [dishes, setDishes] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [editingId, setEditingId] = useState(null);
	const [selectedCategory, setSelectedCategory] = useState('all');
	const [formData, setFormData] = useState({
		name: '',
		description: '',
		price: '',
		category: '',
		available: true,
		image: null,
		imageUrl: '',
		customOptions: []
	});
	const [newOptionType, setNewOptionType] = useState('');
	const [newOptionValue, setNewOptionValue] = useState('');
	const [optionTypeIndex, setOptionTypeIndex] = useState(null);
	const [showImageSection, setShowImageSection] = useState(false);
	const [showCustomOptions, setShowCustomOptions] = useState(false);
	const [categories, setCategories] = useState([{ value: 'all', label: 'Todos', id: 'all' }]);
	const [showCategoryModal, setShowCategoryModal] = useState(false);
	const [newCategory, setNewCategory] = useState('');
	const [editingCategoryId, setEditingCategoryId] = useState(null);
	const [editingCategoryName, setEditingCategoryName] = useState('');

	useEffect(() => {
		fetchDishes();
		fetchCategories();
	}, []);

	const fetchCategories = async () => {
		try {
			const res = await categoriesAPI.getAll();
			setCategories([{ value: 'all', label: 'Todos', id: 'all' }, ...res.data.map(c => ({ value: c.id, label: c.name, id: c.id }))]);
		} catch (e) {
			setCategories([{ value: 'all', label: 'Todos', id: 'all' }]);
		}
	};

	const fetchDishes = async () => {
		try {
			const response = await dishesAPI.getAll();
			setDishes(response.data);
		} catch (error) {
			console.error('Error al cargar platos:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id) => {
		const result = await MySwal.fire({
			title: <span style={{color:'#a66a06',fontWeight:'bold'}}>¿Eliminar plato?</span>,
			html: '<div style="color:#444">¿Seguro que quieres eliminar este plato? <br><b>Esta acción no se puede deshacer.</b></div>',
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
			await dishesAPI.delete(id);
			setDishes(dishes.filter(d => d.id !== id));
			toast.success('Plato eliminado correctamente');
		} catch (error) {
			toast.error('Error al eliminar plato');
		}
	};

	const filteredDishes = useMemo(() => {
		return selectedCategory === 'all'
			? dishes
			: dishes.filter(d => d.categoryId === selectedCategory);
	}, [dishes, selectedCategory]);

	if (loading) {
		return <div className="text-center py-8">Cargando...</div>;
	}

	const handleEdit = (dish) => {
		setEditingId(dish.id);
		setFormData({
			name: dish.name,
			description: dish.description,
			price: dish.price.toString(),
			category: dish.categoryId,
			available: dish.available,
			image: null,
			imageUrl: dish.imageUrl || '',
			customOptions: dish.customOptions || []
		});
		setShowForm(true);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const handleCreate = async (e) => {
		e.preventDefault();
		setSubmitting(true);
		if (!formData.category || formData.category === 'all') {
			toast.error('Selecciona una categoría válida para el plato.');
			setSubmitting(false);
			return;
		}
		try {
			const payload = new FormData();
			payload.append('name', formData.name);
			payload.append('description', formData.description);
			payload.append('price', formData.price);
			payload.append('categoryId', formData.category);
			payload.append('available', formData.available);
			if (formData.image) {
				payload.append('image', formData.image);
			} else if (formData.imageUrl) {
				payload.append('imageUrl', formData.imageUrl);
			}
			if (formData.customOptions && formData.customOptions.length > 0) {
				payload.append('customOptions', JSON.stringify(formData.customOptions));
			}

			if (editingId) {
				await dishesAPI.update(editingId, payload);
				toast.success('Plato actualizado correctamente');
			} else {
				await dishesAPI.create(payload);
				toast.success('Plato creado correctamente');
			}

			setLoading(true);
			await fetchDishes();
			setFormData({
				name: '',
				description: '',
				price: '',
				category: '',
				available: true,
				image: null,
				imageUrl: '',
				customOptions: []
			});
			setEditingId(null);
			setShowForm(false);
		} catch (error) {
			toast.error(editingId ? 'Error al actualizar plato' : 'Error al crear plato');
		} finally {
			setSubmitting(false);
		}
	};

	const handleAddCategory = async (e) => {
		e.preventDefault();
		if (!newCategory.trim()) return;
		try {
			const res = await categoriesAPI.create({ name: newCategory });
			setCategories([{ value: 'all', label: 'Todos', id: 'all' }, ...categories.slice(1), { value: res.data.id, label: res.data.name, id: res.data.id }]);
			setNewCategory('');
			setShowCategoryModal(false);
			toast.success('Categoría añadida');
		} catch (e) {
			toast.error('Error al crear categoría');
		}
	};

	const handleEditCategory = (cat) => {
		setEditingCategoryId(cat.id);
		setEditingCategoryName(cat.label);
	};

	const handleUpdateCategory = async (e) => {
		e.preventDefault();
		if (!editingCategoryName.trim()) return;
		try {
			await categoriesAPI.update(editingCategoryId, { name: editingCategoryName });
			setCategories(categories.map(c => c.id === editingCategoryId ? { ...c, label: editingCategoryName } : c));
			setEditingCategoryId(null);
			setEditingCategoryName('');
			toast.success('Categoría actualizada');
		} catch (e) {
			toast.error('Error al actualizar categoría');
		}
	};

	const handleDeleteCategory = async (cat) => {
		if (cat.id === 'all') return;
		const result = await MySwal.fire({
			title: <span style={{color:'#a66a06',fontWeight:'bold'}}>¿Eliminar categoría?</span>,
			html: `<div style="color:#444">¿Seguro que quieres eliminar la categoría <b>${cat.label}</b>?<br><b>Esta acción no se puede deshacer.</b></div>`,
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
			await categoriesAPI.delete(cat.id);
			setCategories(categories.filter(c => c.id !== cat.id));
			toast.success('Categoría eliminada');
			if (selectedCategory === cat.id) setSelectedCategory('all');
		} catch (e) {
			if (e.response && e.response.data && e.response.data.error) {
				const msg = e.response.data.error;
				if (
					msg.includes('Foreign key constraint') ||
					msg.includes('violates foreign key') ||
					msg.includes('No se puede eliminar una categoría que contiene platos')
				) {
					toast.error('No se puede eliminar una categoría que contiene platos. Elimina o reasigna los platos primero.');
				} else {
					toast.error('Error al eliminar categoría');
				}
			} else {
				toast.error('Error al eliminar categoría');
			}
		}
	};

	const handleToggleAvailability = async (dish) => {
		try {
			const payload = new FormData();
			payload.append('available', (!dish.available).toString());
			const response = await dishesAPI.update(dish.id, payload);
			setDishes(dishes.map(d => d.id === dish.id ? response.data : d));
		} catch (error) {
			toast.error('Error al actualizar disponibilidad');
		}
	};

	const getDishCountByCategory = (categoryId) => {
		if (categoryId === 'all') return dishes.length;
		return dishes.filter(d => d.categoryId === categoryId).length;
	};

	return (
		<div>
			<div className="flex justify-between items-center mb-6 gap-2 flex-wrap">
				<h2 className="text-2xl font-semibold">Platos de la Carta</h2>
				<div className="flex gap-2">
					<button
						onClick={() => setShowCategoryModal(true)}
						className="btn-secondary flex items-center gap-2"
						type="button"
					>
						<Plus className="w-5 h-5" />
						Añadir Categoría
					</button>
					<button
						onClick={() => {
							setEditingId(null);
							setFormData({
								name: '',
								description: '',
								price: '',
								category: '',
								available: true,
								image: null,
								imageUrl: '',
								customOptions: []
							});
							setShowForm(!showForm);
						}}
						className="btn-primary flex items-center gap-2"
						type="button"
					>
						<Plus className="w-5 h-5" />
						Añadir Plato
					</button>
				</div>
			</div>

			{showForm && (
				<form onSubmit={handleCreate} className="mb-8 border border-neutral-200 rounded-lg p-0 md:p-0">
					{/* Opciones personalizadas dinámicas (colapsable) */}
					<div className="border border-primary-100 rounded-t-lg mb-0">
						<button
							type="button"
							className="w-full flex items-center justify-between px-4 py-2 bg-primary-50 hover:bg-primary-100 rounded-t-lg focus:outline-none"
							onClick={() => setShowCustomOptions(v => !v)}
						>
							<span className="font-semibold text-primary-700">Opciones personalizadas</span>
							<span className="text-primary-600 text-xl">{showCustomOptions ? '▲' : '▼'}</span>
						</button>
						{showCustomOptions && (
							<div className="p-4 border-t border-primary-100">
								<div className="flex gap-2 mb-2">
									<input
										className="input-field flex-1"
										placeholder="Tipo (ej: Ingredientes, Extras...)"
										value={newOptionType}
										onChange={e => setNewOptionType(e.target.value)}
									/>
									<button
										type="button"
										className="btn-primary"
										onClick={() => {
											if (!newOptionType.trim()) return;
											setFormData({
												...formData,
												customOptions: [...formData.customOptions, { type: newOptionType.trim(), options: [] }]
											});
											setNewOptionType('');
										}}
									>Añadir tipo</button>
								</div>
								{formData.customOptions.length === 0 && (
									<div className="text-sm text-neutral-400 mb-2">No hay tipos añadidos.</div>
								)}
								{formData.customOptions.map((opt, idx) => (
									<div key={idx} className="mb-3 border border-neutral-200 rounded p-2">
										<div className="flex items-center gap-2 mb-1">
											<span className="font-semibold text-neutral-700 flex-1">{opt.type}</span>
											<button type="button" className="text-red-500 hover:text-red-700" onClick={() => {
												setFormData({
													...formData,
													customOptions: formData.customOptions.filter((_, i) => i !== idx)
												})
											}}>Eliminar tipo</button>
										</div>
										<div className="flex flex-wrap gap-2 mb-1">
											{opt.options.map((val, vIdx) => (
												<span key={vIdx} className="inline-flex items-center bg-primary-100 text-primary-700 rounded px-2 py-1 text-xs">
													{val}
													<button type="button" className="ml-1 text-red-400 hover:text-red-700" onClick={() => {
														const updated = [...formData.customOptions];
														updated[idx].options = updated[idx].options.filter((_, i) => i !== vIdx);
														setFormData({ ...formData, customOptions: updated });
													}}>×</button>
												</span>
											))}
										</div>
										<div className="flex gap-2">
											<input
												className="input-field flex-1"
												placeholder={`Añadir opción a ${opt.type}`}
												value={optionTypeIndex === idx ? newOptionValue : ''}
												onChange={e => {
													setOptionTypeIndex(idx);
													setNewOptionValue(e.target.value);
												}}
												onFocus={() => setOptionTypeIndex(idx)}
											/>
											<button
												type="button"
												className="btn-secondary"
												onClick={() => {
													if (!newOptionValue.trim()) return;
													const updated = [...formData.customOptions];
													updated[idx].options = [...updated[idx].options, newOptionValue.trim()];
													setFormData({ ...formData, customOptions: updated });
													setNewOptionValue('');
													setOptionTypeIndex(null);
												}}
											>Añadir</button>
										</div>
									</div>
								))}
							</div>
						)}
					</div>

					<div className="w-full rounded-md bg-yellow-100">
							<button
								type="button"
								className="w-full flex items-center justify-between py-3 px-4 bg-primary-50 hover:bg-primary-100 rounded-t-lg focus:outline-none"
								onClick={() => setShowImageSection(s => !s)}
								style={{ minWidth: 0 }}
							>
								<span className="font-semibold text-primary-700">Imagen</span>
								<span className="text-primary-600 text-xl">{showImageSection ? '▲' : '▼'}</span>
							</button>
							{showImageSection && (
								<div className="bg-white px-4 pb-4 pt-2 rounded-b-md w-full" style={{ minWidth: 0 }}>
									<input
										type="file"
										accept="image/*"
										onChange={e => setFormData({ ...formData, image: e.target.files[0] })}
									/>
									<div className="text-xs text-neutral-400 mt-1">O pega una URL de imagen:</div>
									<input
										type="url"
										className="input-field w-full mt-1"
										placeholder="https://..."
										value={formData.imageUrl}
										onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
									/>
								</div>
							)}
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-neutral-50 border-b border-neutral-200 px-6 py-6">
						<div>
							<label className="block text-sm font-medium text-neutral-700 mb-2">Nombre</label>
							<input
								className="input-field"
								value={formData.name}
								onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								required
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-neutral-700 mb-2">Categoría</label>
							<select
								className="input-field"
								value={formData.category}
								onChange={(e) => setFormData({ ...formData, category: e.target.value })}
								required
							>
								<option value="" disabled>Selecciona una categoría</option>
								{categories.filter(c => c.value !== 'all').map(cat => (
									<option key={cat.id} value={cat.id}>{cat.label}</option>
								))}
							</select>
						</div>
						<div>
							<label className="block text-sm font-medium text-neutral-700 mb-2">Precio (€)</label>
							<input
								type="number"
								step="0.01"
								className="input-field"
								value={formData.price}
								onChange={(e) => setFormData({ ...formData, price: e.target.value })}
								required
							/>
						</div>
						<div className="md:col-span-3">
							<label className="block text-sm font-medium text-neutral-700 mb-2">Descripción</label>
							<textarea
								className="input-field"
								rows="3"
								value={formData.description}
								onChange={(e) => setFormData({ ...formData, description: e.target.value })}
								required
							/>
						</div>
					</div>

					<div className="flex flex-row gap-3 justify-end px-6 pb-6 pt-4">
						<div className="flex items-center gap-2 mt-2">
							<input
								id="dish-available"
								type="checkbox"
								className="h-4 w-4"
								checked={formData.available}
								onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
							/>
							<label htmlFor="dish-available" className="text-sm text-neutral-700">Mostrar en carta</label>
						</div>
						<button type="submit" className="btn-primary" disabled={submitting}>
							{submitting ? 'Guardando...' : (editingId ? 'Actualizar Plato' : 'Guardar Plato')}
						</button>
						<button
							type="button"
							onClick={() => {
								setShowForm(false);
								setEditingId(null);
								setFormData({
									name: '',
									description: '',
									price: '',
									category: '',
									available: true,
									image: null,
									imageUrl: '',
									customOptions: []
								});
							}}
							className="px-4 py-2 rounded-lg bg-neutral-200 hover:bg-neutral-300 transition-colors"
						>
							Cancelar
						</button>
					</div>
				</form>
			)}

			<div className="mb-6 border-b border-neutral-200">
				<div className="flex overflow-x-auto gap-2">
					{categories.map((cat) => (
						<button
							key={cat.value}
							onClick={() => setSelectedCategory(cat.value)}
							className={`px-4 py-3 font-medium whitespace-nowrap transition-colors border-b-2 ${
								selectedCategory === cat.value
									? 'text-primary-600 border-primary-600'
									: 'text-neutral-600 border-transparent hover:text-neutral-900'
							}`}
						>
							{cat.label}
							<span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-neutral-100">
								{getDishCountByCategory(cat.value)}
							</span>
						</button>
					))}
				</div>
			</div>

			{showCategoryModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
					<div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative">
						<button className="absolute top-2 right-2 text-neutral-400 hover:text-neutral-700" onClick={() => { setShowCategoryModal(false); setEditingCategoryId(null); }}>
							<X className="w-5 h-5" />
						</button>
						<h3 className="text-lg font-semibold mb-4">Gestionar categorías</h3>
						<form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
							<input
								className="input-field flex-1"
								placeholder="Nueva categoría"
								value={newCategory}
								onChange={e => setNewCategory(e.target.value)}
								required
							/>
							<button type="submit" className="btn-primary">Añadir</button>
						</form>
						<ul className="space-y-2 max-h-56 overflow-y-auto">
							{categories.filter(c => c.id !== 'all').map(cat => (
								<li key={cat.id} className="flex items-center gap-2">
									{editingCategoryId === cat.id ? (
										<form onSubmit={handleUpdateCategory} className="flex gap-2 flex-1">
											<input
												className="input-field flex-1"
												value={editingCategoryName}
												onChange={e => setEditingCategoryName(e.target.value)}
												required
												autoFocus
											/>
											<button type="submit" className="btn-primary px-3">Guardar</button>
											<button type="button" className="px-3 py-2 rounded-lg bg-neutral-200 hover:bg-neutral-300" onClick={() => setEditingCategoryId(null)}>Cancelar</button>
										</form>
									) : (
										<>
											<span className="flex-1 truncate">{cat.label}</span>
											<button className="p-1 text-primary-600 hover:bg-primary-100 rounded" title="Editar" onClick={() => handleEditCategory(cat)}><Edit className="w-4 h-4" /></button>
											<button className="p-1 text-red-600 hover:bg-red-100 rounded" title="Eliminar" onClick={() => handleDeleteCategory(cat)}><Trash2 className="w-4 h-4" /></button>
										</>
									)}
								</li>
							))}
						</ul>
						<div className="flex gap-2 justify-end mt-4">
							<button type="button" className="px-4 py-2 rounded-lg bg-neutral-200 hover:bg-neutral-300" onClick={() => { setShowCategoryModal(false); setEditingCategoryId(null); }}>Cerrar</button>
						</div>
					</div>
				</div>
			)}

			{filteredDishes.length === 0 ? (
				<p className="text-center text-neutral-500 py-8">
					{selectedCategory === 'all' ? 'No hay platos. Añade el primero.' : `No hay platos en la categoría ${categories.find(c => c.value === selectedCategory)?.label}.`}
				</p>
			) : (
				<div className="grid gap-4 justify-center" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 260px))' }}>
					{filteredDishes.map((dish) => (
						<div
							key={dish.id}
							className="border border-neutral-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow mx-auto"
							style={{ width: '100%', maxWidth: '260px' }}
						>
							<div className="relative h-32 bg-neutral-100">
								<DishImage src={dish.image} name={dish.name} />
								{!dish.available && (
									<div className="absolute top-2 left-2 px-2 py-1 bg-red-600 text-white text-xs font-medium rounded">
										No disponible
									</div>
								)}
								<div className="absolute top-2 right-2 px-3 py-1 bg-black/70 text-white text-sm font-semibold rounded-full">
									€{dish.price.toFixed(2)}
								</div>
							</div>
							<div className="p-3" style={{ minHeight: '80px', maxHeight: '110px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
								<h3 className="font-semibold text-neutral-900 mb-1 line-clamp-1">{dish.name}</h3>
								<p className="text-xs text-neutral-600 mb-2 line-clamp-2" style={{ maxHeight: '32px', overflow: 'hidden' }}>{dish.description}</p>
								<div className="flex items-center gap-1">
									<button
										onClick={() => handleToggleAvailability(dish)}
										className="flex-1 px-2 py-1 text-xs rounded-lg bg-neutral-100 hover:bg-neutral-200 transition-colors flex items-center justify-center gap-1"
										title={dish.available ? 'Ocultar de la carta' : 'Mostrar en la carta'}
									>
										{dish.available ? (
											<><Eye className="w-4 h-4" /> Visible</>
										) : (
											<><EyeOff className="w-4 h-4" /> Oculto</>
										)}
									</button>
									<button 
										onClick={() => handleEdit(dish)}
										className="p-1 rounded-lg bg-primary-100 hover:bg-primary-200 transition-colors"
										title="Editar plato"
									>
										<Edit className="w-4 h-4 text-primary-600" />
									</button>
									<button 
										onClick={() => handleDelete(dish.id)}
										className="p-1 rounded-lg bg-red-100 hover:bg-red-200 transition-colors"
										title="Eliminar plato"
									>
										<Trash2 className="w-4 h-4 text-red-600" />
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default Platos;
