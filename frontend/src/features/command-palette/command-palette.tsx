import { useState } from 'react';
import { Command } from 'cmdk';
import * as Dialog from '@radix-ui/react-dialog';
import { useNavigate } from 'react-router-dom';
import { usePaletteStore } from './use-palette-store';
import { PALETTE_ACTIONS } from './actions';
import { useSearchProducts } from './hooks/use-search-products';
import { useSearchTransfers } from './hooks/use-search-transfers';
import { useSearchSuppliers } from './hooks/use-search-suppliers';
import { useSearchLocations } from './hooks/use-search-locations';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';
import { useAuthStore } from '@/stores/auth.store';

export function CommandPalette() {
  const { open, setOpen } = usePaletteStore();
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.user?.role);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 250);

  const products = useSearchProducts(debouncedSearch);
  const transfers = useSearchTransfers(debouncedSearch);
  const suppliers = useSearchSuppliers(debouncedSearch);
  const locations = useSearchLocations(debouncedSearch);

  const visibleActions = PALETTE_ACTIONS.filter((action) => {
    if (!action.visibleRoles || action.visibleRoles === 'ALL_AUTH') return true;
    return role ? (action.visibleRoles as string[]).includes(role) : false;
  });

  function handleClose() {
    setOpen(false);
    setSearch('');
  }

  const showingSearch = debouncedSearch.length >= 2;
  const hasSearchResults =
    (products.data?.length ?? 0) > 0 ||
    transfers.length > 0 ||
    suppliers.length > 0 ||
    locations.length > 0;
  const showEmptySearch = showingSearch && !hasSearchResults && !products.isFetching;

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-ink-900/40 dark:bg-ink-900/60" />
        <Dialog.Content
          className="fixed z-[101] left-1/2 top-[25%] -translate-x-1/2 w-full max-w-[640px] px-4 focus:outline-none"
          onEscapeKeyDown={handleClose}
          onPointerDownOutside={handleClose}
          aria-label="Command palette"
        >
          {/* visually hidden title for a11y */}
          <Dialog.Title className="sr-only">Command palette</Dialog.Title>

          <Command
            shouldFilter={false}
            className="bg-ink-50 dark:bg-ink-900 border border-ink-900/15 dark:border-ink-50/15"
          >
            <div className="border-b border-ink-900/10 dark:border-ink-50/10">
              <Command.Input
                autoFocus
                placeholder="Search or jump to…"
                value={search}
                onValueChange={setSearch}
                onKeyDown={(e) => { if (e.key === 'Escape') handleClose(); }}
                className="w-full h-14 px-4 bg-transparent font-sans text-lg text-ink-900 dark:text-ink-50 placeholder-ink-300 dark:placeholder-ink-700 focus:outline-none"
              />
            </div>

            <Command.List className="max-h-[400px] overflow-y-auto py-2">
              {/* Quick actions — always visible */}
              <div className="px-4 pt-2 pb-1 eyebrow text-ink-400 dark:text-ink-600">Quick actions</div>
              <Command.Group>
                {visibleActions.map((action) => (
                  <Command.Item
                    key={action.id}
                    value={action.id}
                    onSelect={() => {
                      action.handler(navigate);
                      handleClose();
                    }}
                    className="flex items-center justify-between px-4 py-2.5 cursor-pointer text-sm font-sans text-ink-900 dark:text-ink-50 data-[selected=true]:bg-ink-900/5 dark:data-[selected=true]:bg-ink-50/5 hover:bg-ink-900/[0.04] dark:hover:bg-ink-50/[0.04]"
                  >
                    <span>{action.label}</span>
                    {action.shortcut && (
                      <span className="eyebrow text-ink-400 dark:text-ink-600">{action.shortcut}</span>
                    )}
                  </Command.Item>
                ))}
              </Command.Group>

              {/* Search results */}
              {showingSearch && (
                <>
                  {/* Products */}
                  {(products.data?.length ?? 0) > 0 && (
                    <>
                      <div className="px-4 pt-4 pb-1 eyebrow text-ink-400 dark:text-ink-600">Products</div>
                      <Command.Group>
                        {products.data!.map((p) => (
                          <Command.Item
                            key={p.id}
                            value={`product-${p.id}`}
                            onSelect={() => {
                              navigate(`/products?search=${encodeURIComponent(p.sku)}`);
                              handleClose();
                            }}
                            className="flex items-center justify-between px-4 py-2.5 cursor-pointer data-[selected=true]:bg-ink-900/5 dark:data-[selected=true]:bg-ink-50/5 hover:bg-ink-900/[0.04] dark:hover:bg-ink-50/[0.04]"
                          >
                            <span className="text-sm font-sans text-ink-900 dark:text-ink-50">{p.name}</span>
                            <span className="eyebrow text-ink-400 dark:text-ink-600 ml-3 shrink-0">{p.brand} · {p.sku}</span>
                          </Command.Item>
                        ))}
                      </Command.Group>
                    </>
                  )}

                  {/* Transfers */}
                  {transfers.length > 0 && (
                    <>
                      <div className="px-4 pt-4 pb-1 eyebrow text-ink-400 dark:text-ink-600">Transfers</div>
                      <Command.Group>
                        {transfers.map((t) => (
                          <Command.Item
                            key={t.id}
                            value={`transfer-${t.id}`}
                            onSelect={() => {
                              navigate(`/transfers/${t.id}`);
                              handleClose();
                            }}
                            className="flex items-center justify-between px-4 py-2.5 cursor-pointer data-[selected=true]:bg-ink-900/5 dark:data-[selected=true]:bg-ink-50/5 hover:bg-ink-900/[0.04] dark:hover:bg-ink-50/[0.04]"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-sm font-sans font-medium text-ink-900 dark:text-ink-50 shrink-0">
                                {t.referenceNumber ?? t.id.slice(0, 8)}
                              </span>
                              <span className="text-sm font-sans text-ink-400 dark:text-ink-500 truncate">
                                {t.fromLocation.name} → {t.toLocation.name}
                              </span>
                            </div>
                            <span className="eyebrow text-ink-400 dark:text-ink-600 ml-3 shrink-0">{t.status}</span>
                          </Command.Item>
                        ))}
                      </Command.Group>
                    </>
                  )}

                  {/* Suppliers */}
                  {suppliers.length > 0 && (
                    <>
                      <div className="px-4 pt-4 pb-1 eyebrow text-ink-400 dark:text-ink-600">Suppliers</div>
                      <Command.Group>
                        {suppliers.map((s) => (
                          <Command.Item
                            key={s.id}
                            value={`supplier-${s.id}`}
                            onSelect={() => {
                              navigate('/suppliers');
                              handleClose();
                            }}
                            className="flex items-center justify-between px-4 py-2.5 cursor-pointer data-[selected=true]:bg-ink-900/5 dark:data-[selected=true]:bg-ink-50/5 hover:bg-ink-900/[0.04] dark:hover:bg-ink-50/[0.04]"
                          >
                            <span className="text-sm font-sans text-ink-900 dark:text-ink-50">{s.name}</span>
                            {s.country && (
                              <span className="eyebrow text-ink-400 dark:text-ink-600 ml-3 shrink-0">{s.country}</span>
                            )}
                          </Command.Item>
                        ))}
                      </Command.Group>
                    </>
                  )}

                  {/* Locations */}
                  {locations.length > 0 && (
                    <>
                      <div className="px-4 pt-4 pb-1 eyebrow text-ink-400 dark:text-ink-600">Locations</div>
                      <Command.Group>
                        {locations.map((l) => (
                          <Command.Item
                            key={l.id}
                            value={`location-${l.id}`}
                            onSelect={() => {
                              navigate('/locations');
                              handleClose();
                            }}
                            className="flex items-center justify-between px-4 py-2.5 cursor-pointer data-[selected=true]:bg-ink-900/5 dark:data-[selected=true]:bg-ink-50/5 hover:bg-ink-900/[0.04] dark:hover:bg-ink-50/[0.04]"
                          >
                            <span className="text-sm font-sans text-ink-900 dark:text-ink-50">{l.name}</span>
                            <span className="eyebrow text-ink-400 dark:text-ink-600 ml-3 shrink-0">
                              {l.type}{l.city ? ` · ${l.city}` : ''}
                            </span>
                          </Command.Item>
                        ))}
                      </Command.Group>
                    </>
                  )}

                  {/* No results */}
                  {showEmptySearch && (
                    <div className="px-4 py-8 text-center text-sm font-sans text-ink-400 dark:text-ink-500">
                      No matches for &ldquo;{debouncedSearch}&rdquo;
                    </div>
                  )}

                  {/* Loading indicator */}
                  {products.isFetching && (
                    <div className="px-4 py-2 text-xs font-sans text-ink-400 dark:text-ink-600">
                      Searching…
                    </div>
                  )}
                </>
              )}
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
