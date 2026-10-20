import React, { useState } from 'react';

const sizeMap = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg font-semibold',
  xl: 'w-24 h-24 text-2xl font-bold',
  '2xl': 'w-32 h-32 text-3xl font-bold',
};

export const Avatar = ({ src, name = 'User', size = 'md', className = '', isVerified = false }) => {
  const [imageError, setImageError] = useState(false);
  const sizeClass = sizeMap[size] || sizeMap.md;

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const fallbackUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
    name
  )}&backgroundColor=6c5ce7&textColor=ffffff`;

  const finalSrc = !imageError && src ? src : fallbackUrl;

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      <img
        src={finalSrc}
        alt={name}
        onError={() => setImageError(true)}
        className={`${sizeClass} rounded-full object-cover border border-gray-200 dark:border-[#273449] bg-gray-100 dark:bg-gray-800 transition-all`}
        loading="lazy"
      />
      {isVerified && (
        <span
          title="Verified Creator"
          className="absolute -bottom-0.5 -right-0.5 bg-brand-primary text-white p-0.5 rounded-full ring-2 ring-white dark:ring-[#111827] flex items-center justify-center"
        >
          <svg className="w-2.5 h-2.5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      )}
    </div>
  );
};
