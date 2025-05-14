export interface ButtonConfig {
  id: string;
  label: string;
  color: 'amber' | 'brown' | 'teal' | 'purple' | 'indigo' | 'rose' | 'stone' | 'slate' | 'darkRed' | 'violet' | 'none' | 'amber-border';
}

// Utility function to generate color-specific classes
export const getColorClasses = (color: string) => {
  if (color === 'none') {
    return 'text-gray-200 hover:text-gray-100';
  }
  if (color === 'amber-border') {
    return 'border-amber-600 hover:border-amber-500 text-gray-200 hover:text-gray-100';
  }
  const colorMap: Record<string, string> = {
    amber: 'bg-amber-700 border-amber-600 hover:bg-amber-600 hover:shadow-amber-900/50 focus:ring-amber-500',
    brown: 'bg-amber-900 border-amber-800 hover:bg-amber-800 hover:shadow-amber-900/50 focus:ring-amber-700',
    teal: 'bg-teal-700 border-teal-600 hover:bg-teal-600 hover:shadow-teal-900/50 focus:ring-teal-500',
    purple: 'bg-purple-700 border-purple-600 hover:bg-purple-600 hover:shadow-purple-900/50 focus:ring-purple-500',
    indigo: 'bg-indigo-700 border-indigo-600 hover:bg-indigo-600 hover:shadow-indigo-900/50 focus:ring-indigo-500',
    rose: 'bg-rose-700 border-rose-600 hover:bg-rose-600 hover:shadow-rose-900/50 focus:ring-rose-500',
    stone: 'bg-stone-700 border-stone-600 hover:bg-stone-600 hover:shadow-stone-900/50 focus:ring-stone-500',
    slate: 'bg-slate-700 border-slate-600 hover:bg-slate-600 hover:shadow-slate-900/50 focus:ring-slate-500',
    darkRed: 'bg-red-900 border-red-800 hover:bg-red-800 hover:shadow-red-900/50 focus:ring-red-700',
    violet: 'bg-violet-700 border-violet-600 hover:bg-violet-600 hover:shadow-violet-900/50 focus:ring-violet-500'
  };
  return colorMap[color] || colorMap.rose; // fallback to rose if color not found
};