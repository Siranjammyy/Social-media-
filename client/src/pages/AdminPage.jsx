import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  FileText,
  MessageSquare,
  AlertTriangle,
  Search,
  CheckCircle,
  Ban,
  Loader2,
} from 'lucide-react';
import { adminService } from '../services/messageService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Avatar } from '../components/common/Avatar';

export const AdminPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUpdatingUser, setIsUpdatingUser] = useState(null);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(1, searchQuery),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (usersRes.success) setUsers(usersRes.users || []);
    } catch (err) {
      toast.error('Failed to load administrative dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAdminData();
    }
  }, [user]);

  const handleToggleSuspend = async (targetUser) => {
    setIsUpdatingUser(targetUser._id);
    try {
      const res = await adminService.toggleSuspend(targetUser._id);
      if (res.success) {
        toast.success(res.message);
        setUsers((prev) =>
          prev.map((u) =>
            u._id === targetUser._id ? { ...u, isSuspended: res.isSuspended } : u
          )
        );
      }
    } catch (err) {
      toast.error('Action failed.');
    } finally {
      setIsUpdatingUser(null);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="p-12 text-center text-gray-500">
        <ShieldAlert className="w-12 h-12 mx-auto mb-3 text-rose-500" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Unauthorized Access
        </h2>
        <p className="text-xs max-w-sm mx-auto mt-1">
          You must be an authorized Aura administrator to view this console.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-[#0B1020]/80 backdrop-blur-md border-b border-gray-200 dark:border-[#273449] p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-500" />
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">
            Admin Console
          </h1>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Metric Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="nexora-card p-4">
              <Users className="w-5 h-5 text-brand-primary mb-2" />
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
                {stats.totalUsers}
              </p>
              <p className="text-xs text-gray-400">Total Users</p>
            </div>

            <div className="nexora-card p-4">
              <FileText className="w-5 h-5 text-brand-accent mb-2" />
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
                {stats.totalPosts}
              </p>
              <p className="text-xs text-gray-400">Total Posts</p>
            </div>

            <div className="nexora-card p-4">
              <MessageSquare className="w-5 h-5 text-emerald-500 mb-2" />
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
                {stats.totalComments}
              </p>
              <p className="text-xs text-gray-400">Total Comments</p>
            </div>

            <div className="nexora-card p-4">
              <AlertTriangle className="w-5 h-5 text-amber-500 mb-2" />
              <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
                {stats.pendingReports}
              </p>
              <p className="text-xs text-gray-400">Pending Reports</p>
            </div>
          </div>
        )}

        {/* User Management Table */}
        <div className="nexora-card p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                User Moderation
              </h2>
              <p className="text-xs text-gray-400">
                Manage accounts, roles, and suspension states.
              </p>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter users..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  adminService.getUsers(1, e.target.value).then((res) => {
                    if (res.success) setUsers(res.users);
                  });
                }}
                className="bg-gray-100 dark:bg-[#182235] text-xs rounded-full pl-8 pr-3 py-1.5 outline-none text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-100 dark:border-[#273449] text-gray-400 uppercase">
                <tr>
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#273449]">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-[#182235]/50">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar src={u.avatar} name={u.name} size="xs" />
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{u.name}</p>
                          <p className="text-gray-400 text-[10px]">@{u.username} • {u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          u.role === 'admin'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full font-medium text-[10px] ${
                          u.isSuspended
                            ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40'
                            : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40'
                        }`}
                      >
                        {u.isSuspended ? 'Suspended' : 'Active'}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right">
                      {u.role !== 'admin' && (
                        <Button
                          size="sm"
                          variant={u.isSuspended ? 'outline' : 'danger'}
                          className="h-7 text-[10px] px-2.5 rounded-lg"
                          isLoading={isUpdatingUser === u._id}
                          onClick={() => handleToggleSuspend(u)}
                        >
                          {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
