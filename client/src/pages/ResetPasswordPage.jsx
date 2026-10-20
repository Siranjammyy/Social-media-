import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Sparkles, Lock, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get('token') || '';
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updateUser } = useAuth();

  const [token, setToken] = useState(tokenParam);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!token) {
      setErrorMessage('Reset token is required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.resetPassword({
        token,
        newPassword,
        confirmPassword,
      });

      if (res.success) {
        if (res.token) {
          localStorage.setItem('aura_token', res.token);
          localStorage.setItem('nexora_token', res.token);
        }
        if (res.user) updateUser(res.user);

        toast.success('Password reset successfully! You are now logged in.');
        navigate('/home', { replace: true });
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Invalid or expired reset token.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F7F8FC] dark:bg-[#0B1020]">
      <div className="w-full max-w-md aura-card p-6 sm:p-8 shadow-2xl">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-accent flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-brand-primary via-brand-500 to-brand-accent bg-clip-text text-transparent">
              Aura
            </span>
          </Link>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Set a new password
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Choose a strong password to secure your account.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!tokenParam && (
            <Input
              label="Reset Token"
              type="text"
              placeholder="Paste token from reset email"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              required
            />
          )}

          <Input
            label="New Password"
            type="password"
            placeholder="At least 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            icon={Lock}
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            icon={Lock}
            required
          />

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full rounded-xl py-3 font-semibold shadow-md shadow-brand-primary/20"
          >
            Update Password & Login
          </Button>
        </form>
      </div>
    </div>
  );
};
