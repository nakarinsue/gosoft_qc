import React from 'react';

const DropdownSelect = ({ item, onChange }) => {
  return (
    <div className={`flex flex-col mb-4 ${item.ui_class || 'col-span-12'}`}>
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {item.remark || item.key}
      </label>
      <select
        value={item.value || item.default_value || ''}
        onChange={(e) => onChange(item.id, e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white transition-colors"
      >
        <option value="" disabled>กรุณาเลือก...</option>
        {item.options && item.options.map((opt, index) => (
          <option key={index} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DropdownSelect;