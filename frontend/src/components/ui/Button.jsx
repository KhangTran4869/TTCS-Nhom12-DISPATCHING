import { Loader2 } from 'lucide-react';

const variants = {
  primary:   'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500/30 shadow-sm',
  secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-400/30 border border-slate-300',
  danger:    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500/30 shadow-sm',
  success:   'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500/30 shadow-sm',
  ghost:     'bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-400/30',
  outline:   'bg-white text-primary-600 border border-primary-300 hover:bg-primary-50 focus:ring-primary-500/30',
};

const sizes = {
  sm:   'px-3 py-1.5 text-xs',
  md:   'px-4 py-2.5 text-sm',
  lg:   'px-6 py-3 text-base',
};

export default function Button({
  id,
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  className = '',
  ...props
}) {
  return (
    <button
      id={id}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-semibold rounded-lg
        transition-all duration-200 cursor-pointer
        focus:outline-none focus:ring-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin-slow" />
      ) : Icon ? (
        <Icon size={16} />
      ) : null}
      {children}
    </button>
  );
}
