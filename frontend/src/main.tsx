import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { queryClient } from '@/lib/query-client';
import { useThemeStore } from '@/stores/theme.store';
import App from './App';
import './index.css';

function Root() {
  const dark = useThemeStore((s) => s.dark);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [dark]);

  return (
    <>
      <App />
      <Toaster
        position="bottom-right"
        theme={dark ? 'dark' : 'light'}
        toastOptions={{ style: { fontFamily: 'Inter, sans-serif', fontSize: '14px' } }}
      />
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Root />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
