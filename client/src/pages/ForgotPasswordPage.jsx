import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/authService';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await authService.forgotPassword(email.trim());
      setIsSubmitted(true);
      if (res.devResetUrl) {
        setDevResetUrl(res.devResetUrl);
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Failed to submit reset request.'
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
            Reset your password
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Enter your email and we'll help you get back into your account.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isSubmitted ? (
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              If an account matches that email, a password reset link has been dispatched.
            </p>

            {/* Development helper link */}
            {devResetUrl && (
              <div className="p-3 bg-brand-primary/10 border border-brand-primary/20 rounded-xl text-left text-xs space-y-1">
                <p className="font-bold text-brand-primary">Development Helper Link:</p>
                <Link
                  to={devResetUrl}
                  className="text-brand-dark dark:text-brand-300 underline break-all block"
                >
                  Click here to proceed to Reset Form
                </Link>
              </div>
            )}

            <Link to="/login" className="inline-block mt-4">
              <Button variant="secondary" size="sm">
                Return to Login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Account Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              required
            />

            <Button
              type="submit"
              isLoading={isLoading}
              className="w-full rounded-xl py-3 font-semibold"
            >
              Send Reset Link
            </Button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-primary font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
