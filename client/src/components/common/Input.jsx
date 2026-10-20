import React from 'react';

export const Input = ({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  helperText,
  icon: Icon,
  disabled = false,
  required = false,
  className = '',
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-gray-400 dark:text-gray-500 pointer-events-none flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
        )}

        <input
          id={inputId}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`w-full rounded-xl bg-white dark:bg-[#111827] border px-4 py-2.5 text-sm transition-all outline-none text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
            Icon ? 'pl-11' : ''
          } ${
            error
              ? 'border-rose-500 focus:ring-2 focus:ring-rose-500/20'
              : 'border-gray-200 dark:border-[#273449] focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20'
          } disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:opacity-60`}
          {...props}
        />
      </div>

      {error ? (
        <span className="text-xs text-rose-500 font-medium">{error}</span>
      ) : helperText ? (
        <span className="text-xs text-gray-500 dark:text-gray-400">{helperText}</span>
      ) : null}
    </div>
  );
};
