import React from "react";

const DishOptionsModal = ({ dish, open, onClose, onConfirm }) => {
  if (!open || !dish) return null;

  // dish.customOptions: [{ type: "Ingredientes", options: ["Tomate", ...] }]
  const [selectedOptions, setSelectedOptions] = React.useState(() => {
    // Inicializa con arrays vacíos para cada grupo
    return dish.customOptions?.map(() => []);
  });

  const handleOptionToggle = (groupIdx, option) => {
    setSelectedOptions(prev => {
      const group = prev[groupIdx] || [];
      const exists = group.includes(option);
      const updatedGroup = exists
        ? group.filter(o => o !== option)
        : [...group, option];
      const updated = [...prev];
      updated[groupIdx] = updatedGroup;
      return updated;
    });
  };

  const handleConfirm = () => {
    // Devuelve las opciones seleccionadas agrupadas por tipo
    const result = dish.customOptions.map((group, idx) => ({
      type: group.type,
      options: selectedOptions[idx] || []
    }));
    onConfirm(result);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button className="absolute top-2 right-2 text-2xl" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-4">Personalizar {dish.name}</h2>
        {dish.customOptions?.map((group, groupIdx) => (
          <div key={group.type} className="mb-4">
            <div className="font-semibold mb-2">{group.type}</div>
            <div className="flex flex-wrap gap-2">
              {group.options.map(option => (
                <button
                  key={option}
                  className={`px-3 py-1 rounded border ${selectedOptions[groupIdx]?.includes(option) ? 'bg-primary-600 text-white' : 'bg-neutral-100'}`}
                  onClick={() => handleOptionToggle(groupIdx, option)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div className="flex justify-end gap-2 mt-6">
          <button className="btn-secondary px-4 py-2" onClick={onClose}>Cancelar</button>
          <button className="btn-primary px-4 py-2" onClick={handleConfirm}>Añadir</button>
        </div>
      </div>
    </div>
  );
};

export default DishOptionsModal;
