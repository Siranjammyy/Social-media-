import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F7F8FC] dark:bg-[#0B1020] text-center">
      <div className="max-w-md aura-card p-8 sm:p-12 space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto">
          <Sparkles className="w-8 h-8" />
        </div>

        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white font-mono">
          404
        </h1>

        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
          Page Not Found
        </h2>

        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          The link you followed may be broken or the page may have been moved or removed.
        </p>

        <div className="pt-2 flex justify-center gap-3">
          <Link to="/home">
            <Button size="sm" icon={Home} className="rounded-full px-5">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
