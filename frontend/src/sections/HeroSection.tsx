import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useAuthStore } from '@/stores/auth.store';
import api from '@/lib/api';
import type { Location } from '@/types/api';

function useUserLocation(locationId: string | null) {
  return useQuery({
    queryKey: ['locations', locationId],
    queryFn: async () => {
      const { data } = await api.get<Location>(`/locations/${locationId}`);
      return data;
    },
    enabled: locationId != null,
    staleTime: Infinity,
  });
}

export function HeroSection() {
  const user = useAuthStore((s) => s.user);
  const { data: location } = useUserLocation(user?.locationId ?? null);

  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const dateLabel = format(now, 'EEEE · d MMMM yyyy').toUpperCase();
  const locationLabel = location?.name ?? (user?.locationId ? null : 'Global access');

  return (
    <section className="px-8 pt-10 pb-8 border-b border-ink-900/10 dark:border-ink-50/10">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="eyebrow text-ink-500 dark:text-ink-400 mb-3">{dateLabel}</p>
          <h1 className="font-serif text-3xl font-medium text-ink-900 dark:text-ink-50 leading-tight">
            {greeting},{' '}
            <span className="italic">{user?.fullName?.split(' ')[0] ?? 'there'}</span>
          </h1>
        </div>
        <div className="text-right shrink-0">
          <p className="eyebrow text-ink-400 dark:text-ink-500 mb-1">CURRENTLY SIGNED INTO</p>
          {locationLabel ? (
            <p className="text-sm font-sans font-medium text-ink-900 dark:text-ink-50">
              {locationLabel}
            </p>
          ) : (
            <p className="text-sm font-sans text-ink-400 dark:text-ink-500">—</p>
          )}
        </div>
      </div>
    </section>
  );
}
