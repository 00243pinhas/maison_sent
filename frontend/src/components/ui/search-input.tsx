import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Search…' }: SearchInputProps) {
  return (
    <div className="relative flex items-center">
      <Search
        size={13}
        strokeWidth={1.5}
        className="absolute left-0 text-ink-400 dark:text-ink-500 pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 pl-5 pr-2 min-w-52 bg-transparent border-b border-ink-900/20 dark:border-ink-50/20 font-sans text-sm text-ink-900 dark:text-ink-50 placeholder-ink-400 dark:placeholder-ink-600 focus:outline-none focus:border-ink-900 dark:focus:border-ink-50 transition-colors"
      />
    </div>
  );
}
