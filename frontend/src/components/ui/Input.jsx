import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function Input({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  success,
  icon: Icon,
  rightElement,
  disabled = false,
  required = false,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon size={18} className="text-slate-400" />
          </div>
        )}
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            paddingLeft: Icon ? '2.5rem' : '0.875rem',
            paddingRight: (isPassword || rightElement) ? '2.5rem' : '0.875rem',
          }}
          className={`
            w-full rounded-lg border bg-white py-2.5 text-sm text-slate-900
            placeholder:text-slate-400
            transition-all duration-200 outline-none
            ${error
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
              : success
                ? 'border-green-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20'
                : 'border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20'
            }
            ${disabled ? 'bg-slate-50 text-slate-500 cursor-not-allowed' : ''}
          `}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
        {rightElement && !isPassword && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-red-500" />
          {error}
        </p>
      )}
      {success && !error && (
        <p className="mt-1.5 text-xs text-green-600 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-green-500" />
          {success}
        </p>
      )}
    </div>
  );
}
