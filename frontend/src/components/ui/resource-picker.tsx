import { useState, useEffect, useRef } from 'react';
import { Command } from 'cmdk';
import { cn } from '@/lib/cn';
import { INPUT_BASE } from '@/components/ui/field';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';

interface ResourcePickerProps<T extends { id: string }> {
  label: string;
  value: string | null;
  onChange: (item: T) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  fetchOptions: (search: string) => Promise<T[]>;
  renderOption: (item: T) => React.ReactNode;
  getDisplayValue: (item: T) => string;
  error?: string;
}

export function ResourcePicker<T extends { id: string }>({
  label,
  value,
  onChange,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  fetchOptions,
  renderOption,
  getDisplayValue,
  error,
}: ResourcePickerProps<T>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedSearch = useDebouncedValue(search, 250);

  useEffect(() => {
    if (value === null || value === '') {
      setSelectedItem(null);
    }
  }, [value]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setIsLoading(true);
    fetchOptions(debouncedSearch)
      .then((results) => {
        if (!cancelled) {
          setOptions(results);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [debouncedSearch, open, fetchOptions]);

  useEffect(() => {
    if (!open) return;
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [open]);

  function handleOpen() {
    setSearch('');
    setOptions([]);
    setOpen(true);
  }

  function handleSelect(item: T) {
    setSelectedItem(item);
    onChange(item);
    setOpen(false);
    setSearch('');
  }

  return (
    <div className="relative space-y-1" ref={containerRef}>
      <label className="eyebrow text-ink-500 dark:text-ink-400">{label}</label>

      <button
        type="button"
        onClick={handleOpen}
        className={cn(
          INPUT_BASE,
          'text-left cursor-pointer',
          !selectedItem && 'text-ink-300 dark:text-ink-600',
        )}
      >
        {selectedItem ? getDisplayValue(selectedItem) : placeholder}
      </button>

      {open && (
        <div className="absolute z-50 left-0 right-0 top-full mt-0.5 bg-ink-50 dark:bg-ink-900 border border-ink-900/15 dark:border-ink-50/15 shadow-none">
          <Command shouldFilter={false} className="w-full">
            <div className="border-b border-ink-900/10 dark:border-ink-50/10">
              <Command.Input
                autoFocus
                placeholder={searchPlaceholder}
                value={search}
                onValueChange={setSearch}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setOpen(false);
                }}
                className="w-full h-9 px-3 bg-transparent font-sans text-sm text-ink-900 dark:text-ink-50 placeholder-ink-400 dark:placeholder-ink-600 focus:outline-none"
              />
            </div>
            <Command.List className="max-h-60 overflow-y-auto py-1">
              {isLoading && (
                <div className="px-3 py-2.5 eyebrow text-ink-400 dark:text-ink-500">
                  Searching…
                </div>
              )}
              {!isLoading && options.length === 0 && (
                <Command.Empty className="px-3 py-2.5 eyebrow text-ink-400 dark:text-ink-500">
                  No matches
                </Command.Empty>
              )}
              {!isLoading &&
                options.map((item) => (
                  <Command.Item
                    key={item.id}
                    value={item.id}
                    onSelect={() => handleSelect(item)}
                    className="px-3 py-2.5 cursor-pointer text-sm font-sans text-ink-900 dark:text-ink-50 data-[selected=true]:bg-ink-900/5 dark:data-[selected=true]:bg-ink-50/5 hover:bg-ink-900/[0.04] dark:hover:bg-ink-50/[0.04]"
                  >
                    {renderOption(item)}
                  </Command.Item>
                ))}
            </Command.List>
          </Command>
        </div>
      )}

      {error && (
        <p className="text-[13px] font-sans text-ink-500 dark:text-ink-400 mt-1">{error}</p>
      )}
    </div>
  );
}
