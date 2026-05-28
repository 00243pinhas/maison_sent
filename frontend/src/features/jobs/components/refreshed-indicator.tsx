import { useState, useEffect } from 'react';

interface RefreshedIndicatorProps {
  dataUpdatedAt: number;
}

export function RefreshedIndicator({ dataUpdatedAt }: RefreshedIndicatorProps) {
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    setSecondsAgo(Math.floor((Date.now() - dataUpdatedAt) / 1000));
    const interval = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - dataUpdatedAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [dataUpdatedAt]);

  return (
    <span className="text-xs font-sans text-ink-400 dark:text-ink-600">
      · refreshed {secondsAgo}s ago
    </span>
  );
}
