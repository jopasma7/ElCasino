import React from 'react';

const Badge = ({ count }) => {
  if (!count || count < 1) return null;
  return (
    <span className="absolute bg-red-600 text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg z-20 border-2 border-white" style={{top: '-8px', right: '-8px'}}>
      {count > 99 ? '99+' : count}
    </span>
  );
};

export default Badge;
