const statusStyles = {
  // Vehicle & shared
  available:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  in_use:      'bg-blue-50 text-blue-700 border-blue-200',
  maintenance: 'bg-amber-50 text-amber-700 border-amber-200',
  // Driver
  assigned:    'bg-blue-50 text-blue-700 border-blue-200',
  on_trip:     'bg-violet-50 text-violet-700 border-violet-200',
  off:         'bg-slate-50 text-slate-700 border-slate-200',
  // User
  active:      'bg-emerald-50 text-emerald-700 border-emerald-200',
  inactive:    'bg-red-50 text-red-700 border-red-200',
  // Order
  pending:     'bg-amber-50 text-amber-700 border-amber-200',
  picked_up:   'bg-indigo-50 text-indigo-700 border-indigo-200',
  in_transit:  'bg-violet-50 text-violet-700 border-violet-200',
  delivered:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled:   'bg-red-50 text-red-700 border-red-200',
  // Dispatch Assignment
  accepted:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected:    'bg-red-50 text-red-700 border-red-200',
  in_progress: 'bg-violet-50 text-violet-700 border-violet-200',
  completed:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  // Incident
  reported:    'bg-red-50 text-red-700 border-red-200',
  processing:  'bg-amber-50 text-amber-700 border-amber-200',
  resolved:    'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const dotStyles = {
  available:   'bg-emerald-500',
  in_use:      'bg-blue-500',
  maintenance: 'bg-amber-500',
  assigned:    'bg-blue-500',
  on_trip:     'bg-violet-500',
  off:         'bg-slate-500',
  active:      'bg-emerald-500',
  inactive:    'bg-red-500',
  pending:     'bg-amber-500',
  picked_up:   'bg-indigo-500',
  in_transit:  'bg-violet-500',
  delivered:   'bg-emerald-500',
  cancelled:   'bg-red-500',
  accepted:    'bg-emerald-500',
  rejected:    'bg-red-500',
  in_progress: 'bg-violet-500',
  completed:   'bg-emerald-500',
  reported:    'bg-red-500',
  processing:  'bg-amber-500',
  resolved:    'bg-emerald-500',
};

const statusLabels = {
  available:   'Available',
  in_use:      'In Use',
  maintenance: 'Maintenance',
  assigned:    'Assigned',
  on_trip:     'On Trip',
  off:         'Off Duty',
  active:      'Active',
  inactive:    'Inactive',
  pending:     'Pending',
  picked_up:   'Picked Up',
  in_transit:  'In Transit',
  delivered:   'Delivered',
  cancelled:   'Cancelled',
  accepted:    'Accepted',
  rejected:    'Rejected',
  in_progress: 'In Progress',
  completed:   'Completed',
  reported:    'Reported',
  processing:  'Processing',
  resolved:    'Resolved',
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border
        ${statusStyles[status] || 'bg-slate-50 text-slate-600 border-slate-200'}
      `}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${dotStyles[status] || 'bg-slate-400'}`}
        style={{ animation: ['available', 'active', 'on_trip', 'in_transit', 'in_progress'].includes(status) ? 'pulse-dot 2s infinite' : 'none' }}
      />
      {statusLabels[status] || status}
    </span>
  );
}
