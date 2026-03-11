import React from 'react';
import { Edit, KeyRound } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const UserTable = ({ users, isLoading, onEdit, onResetPassword }) => {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
        <div className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent text-blue-600 rounded-full" role="status" aria-label="loading"></div>
        <p className="mt-2">กำลังโหลดข้อมูลผู้ใช้งาน...</p>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return <div className="p-8 text-center text-gray-500 dark:text-gray-400">ไม่พบข้อมูลผู้ใช้งานในระบบ</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-sm uppercase tracking-wider">
            <th className="p-4 font-semibold">Username</th>
            <th className="p-4 font-semibold">Name</th>
            <th className="p-4 font-semibold">Email</th>
            <th className="p-4 font-semibold">Role</th>
            <th className="p-4 font-semibold">IP / Members</th>
            <th className="p-4 font-semibold">Status</th>
            <th className="p-4 font-semibold text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {users.map((user) => (
            <tr key={user.username} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
              <td className="p-4 font-medium text-gray-900 dark:text-white">{user.username}</td>
              <td className="p-4 text-gray-800 dark:text-gray-200">{user.name}</td>
              <td className="p-4 text-sm text-gray-500 dark:text-gray-400">{user.email}</td>
              <td className="p-4">
                <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md text-xs font-semibold border border-blue-100 dark:border-blue-800">
                  {user.role}
                </span>
              </td>
              <td className="p-4 text-sm">
                <div className="text-gray-800 dark:text-gray-200">{user.ip_address || '-'}</div>
                <div className="text-gray-400 text-xs">Members: {user.allmember || 0}</div>
              </td>
              <td className="p-4">
                <StatusBadge isActive={user.is_active} isDeleted={user.is_deleted} />
              </td>
              <td className="p-4">
                <div className="flex justify-center space-x-2">
                  <button 
                    onClick={() => onResetPassword(user.username)}
                    className="p-2 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors tooltip"
                    title="Reset Password"
                  >
                    <KeyRound size={18} />
                  </button>
                  <button 
                    onClick={() => onEdit(user)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors tooltip"
                    title="Edit User"
                  >
                    <Edit size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;