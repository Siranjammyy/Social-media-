import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  Moon,
  Sun,
  Monitor,
  Shield,
  KeyRound,
  Bell,
  Trash2,
  Lock,
  Globe,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export const SettingsPage = () => {
  const { user, updateUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('appearance');

  // Security passwords state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Privacy state
  const [visibility, setVisibility] = useState(user?.accountVisibility || 'public');

  // Deletion confirm
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await authService.updatePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      if (res.success) {
        toast.success('Password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleVisibilityChange = async (newVisibility) => {
    setVisibility(newVisibility);
    try {
      const res = await userService.updateProfile({ accountVisibility: newVisibility });
      if (res.success) {
        updateUser(res.user);
        toast.success(`Account visibility set to ${newVisibility}.`);
      }
    } catch (err) {
      toast.error('Failed to update visibility.');
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await userService.deleteAccount();
      toast.success('Your account has been deleted.');
      logout();
      navigate('/');
    } catch (err) {
      toast.error('Failed to delete account.');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-[#0B1020]/80 backdrop-blur-md border-b border-gray-200 dark:border-[#273449] p-4 flex items-center gap-2">
        <Settings className="w-5 h-5 text-brand-primary" />
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Settings</h1>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-[#273449] pb-3">
          {[
            { id: 'appearance', label: 'Appearance', icon: Sun },
            { id: 'privacy', label: 'Privacy', icon: Shield },
            { id: 'security', label: 'Security', icon: KeyRound },
            { id: 'account', label: 'Account', icon: Trash2 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                activeSection === tab.id
                  ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20'
                  : 'bg-gray-100 dark:bg-[#182235] text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Section 1: Appearance */}
        {activeSection === 'appearance' && (
          <div className="aura-card p-5 space-y-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Display & Color Theme
            </h2>
            <p className="text-xs text-gray-500">
              Customize how Aura looks on your screen. Switch between light and dark themes.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {[
                { id: 'light', label: 'Light Theme', icon: Sun, desc: 'Clean white surfaces' },
                { id: 'dark', label: 'Dark Theme', icon: Moon, desc: 'Deep night palette' },
                { id: 'system', label: 'System Match', icon: Monitor, desc: 'Matches device setting' },
              ].map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setTheme(opt.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    theme === opt.id
                      ? 'border-brand-primary bg-brand-primary/10 shadow-sm'
                      : 'border-gray-200 dark:border-[#273449] hover:bg-gray-50 dark:hover:bg-[#182235]'
                  }`}
                >
                  <opt.icon
                    className={`w-5 h-5 mb-2 ${
                      theme === opt.id ? 'text-brand-primary' : 'text-gray-400'
                    }`}
                  />
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {opt.label}
                  </p>
                  <p className="text-[11px] text-gray-400">{opt.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 2: Privacy */}
        {activeSection === 'privacy' && (
          <div className="aura-card p-5 space-y-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Account Privacy & Access
            </h2>
            <p className="text-xs text-gray-500">
              Manage who can see your profile, your posts, and your activity.
            </p>

            <div className="space-y-3 pt-2">
              <div
                onClick={() => handleVisibilityChange('public')}
                className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between ${
                  visibility === 'public'
                    ? 'border-brand-primary bg-brand-primary/10'
                    : 'border-gray-200 dark:border-[#273449]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-emerald-500" />
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      Public Account
                    </p>
                    <p className="text-xs text-gray-400">
                      Anyone on Aura can view your profile and public posts.
                    </p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="visibility"
                  checked={visibility === 'public'}
                  onChange={() => {}}
                  className="text-brand-primary focus:ring-brand-primary"
                />
              </div>

              <div
                onClick={() => handleVisibilityChange('private')}
                className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between ${
                  visibility === 'private'
                    ? 'border-brand-primary bg-brand-primary/10'
                    : 'border-gray-200 dark:border-[#273449]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-amber-500" />
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      Private Account
                    </p>
                    <p className="text-xs text-gray-400">
                      Only people you approve can see your posts and followers list.
                    </p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="visibility"
                  checked={visibility === 'private'}
                  onChange={() => {}}
                  className="text-brand-primary focus:ring-brand-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Security */}
        {activeSection === 'security' && (
          <div className="aura-card p-5 space-y-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Change Password
            </h2>
            <p className="text-xs text-gray-500">
              Ensure your account is protected with a secure, unique password.
            </p>

            <form onSubmit={handlePasswordChange} className="space-y-3.5 max-w-md pt-2">
              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <Button type="submit" isLoading={isChangingPassword} className="mt-2">
                Update Password
              </Button>
            </form>
          </div>
        )}

        {/* Section 4: Account Deletion */}
        {activeSection === 'account' && (
          <div className="aura-card p-5 border-rose-200 dark:border-rose-900/40 space-y-4">
            <h2 className="text-base font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Danger Zone
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Once you delete your account, your profile, published posts, comments, likes, and messages will be permanently purged from the Aura database. This action is irreversible.
            </p>

            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              className="mt-2"
            >
              Delete My Aura Account
            </Button>
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      <ConfirmDialog
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="Permanently Delete Account"
        message="Are you completely sure you want to delete your Aura account? All of your content will be irrevocably deleted."
        confirmText="Yes, Permanently Delete"
        isLoading={isDeletingAccount}
      />
    </div>
  );
};
