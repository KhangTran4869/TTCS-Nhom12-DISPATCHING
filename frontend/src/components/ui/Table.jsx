export function Table({ children, className = '' }) {
  return (
    <div className={`overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      <table className="w-full text-sm text-left">
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children }) {
  return (
    <thead className="bg-slate-50 border-b border-slate-200">
      <tr>{children}</tr>
    </thead>
  );
}

export function TableHeader({ children, className = '' }) {
  return (
    <th className={`px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider ${className}`}>
      {children}
    </th>
  );
}

export function TableBody({ children }) {
  return <tbody className="divide-y divide-slate-100">{children}</tbody>;
}

export function TableRow({ children, className = '' }) {
  return (
    <tr className={`hover:bg-slate-50/70 transition-colors ${className}`}>
      {children}
    </tr>
  );
}

export function TableCell({ children, className = '' }) {
  return (
    <td className={`px-5 py-4 text-slate-700 ${className}`}>
      {children}
    </td>
  );
}
