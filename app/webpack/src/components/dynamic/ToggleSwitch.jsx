import React from 'react';

const ToggleSwitch = ({ item, onChange }) => {
  const isChecked = item.value === 'true' || item.value === true;

  return (
    <div className={`flex items-center justify-between mb-4 p-3 border border-gray-200 rounded-lg dark:border-gray-700 ${item.ui_class || 'col-span-12'}`}>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {item.remark || item.key}
      </span>
      <button
        type="button"
        onClick={() => onChange(item.id, isChecked ? 'false' : 'true')}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          isChecked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isChecked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

export default ToggleSwitch;