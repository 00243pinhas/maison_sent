import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

export interface SelectOption {
  value: string;
  label: string;
}

interface EditorialSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  placeholder?: string;
}

export const EditorialSelect = forwardRef<HTMLSelectElement, EditorialSelectProps>(
  ({ options, placeholder, className, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          'h-10 px-0 pb-1.5 bg-transparent border-0 border-b border-ink-900/20 dark:border-ink-50/20',
          'font-sans text-sm text-ink-900 dark:text-ink-50',
          'focus:outline-none focus:border-ink-900 dark:focus:border-ink-50',
          'transition-colors duration-150 cursor-pointer appearance-none',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className,
        )}
        {...props}
      >
        {placeholder !== undefined && (
          <option value="">{placeholder}</option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  },
);

EditorialSelect.displayName = 'EditorialSelect';
