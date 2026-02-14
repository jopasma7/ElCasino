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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-2">
      <div className="bg-white rounded-lg shadow-lg p-3 sm:p-6 w-full max-w-xs sm:max-w-md relative text-sm sm:text-base">
        <button className="absolute top-1.5 right-2 text-xl sm:text-2xl" onClick={onClose}>&times;</button>
        <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Personalizar {dish.name}</h2>
        {dish.customOptions?.map((group, groupIdx) => (
          <div key={group.type} className="mb-3 sm:mb-4">
            <div className="font-semibold mb-1 sm:mb-2">{group.type}</div>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {group.options.map(option => (
                <button
                  key={option}
                  className={`px-2 py-1 sm:px-3 rounded border text-xs sm:text-base ${selectedOptions[groupIdx]?.includes(option) ? 'bg-primary-600 text-white' : 'bg-neutral-100'}`}
                  onClick={() => handleOptionToggle(groupIdx, option)}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div className="flex justify-end gap-2 mt-4 sm:mt-6">
          <button className="btn-secondary px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-base" onClick={onClose}>Cancelar</button>
          <button className="btn-primary px-3 py-1 sm:px-4 sm:py-2 text-xs sm:text-base" onClick={handleConfirm}>Añadir</button>
        </div>
      </div>
    </div>
  );
};

export default DishOptionsModal;
