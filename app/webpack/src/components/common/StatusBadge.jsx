import React from 'react';

const StatusBadge = ({ isActive, isDeleted }) => {
  if (isDeleted) {
    return <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-medium border border-red-200 dark:border-red-800">Deleted (ลบแล้ว)</span>;
  }
  if (!isActive) {
    return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-xs font-medium border border-yellow-200 dark:border-yellow-800">Inactive (ระงับสิทธิ์)</span>;
  }
  return <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium border border-green-200 dark:border-green-800">Active (ปกติ)</span>;
};

export default StatusBadge;