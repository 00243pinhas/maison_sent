import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import type { LoginResponse, RoleName } from '@/types/api';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/cn';

// ── Schemas ──────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  fullName: z.string().min(2, 'At least 2 characters').max(150),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters').max(128),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'WAREHOUSE_MANAGER', 'BRANCH_MANAGER', 'SALES_STAFF']),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;
type Mode = 'login' | 'register';

// ── Constants ─────────────────────────────────────────────────────────────────

const ROLE_OPTIONS: Array<{ value: RoleName; label: string }> = [
  { value: 'SALES_STAFF', label: 'Sales Staff' },
  { value: 'BRANCH_MANAGER', label: 'Branch Manager' },
  { value: 'WAREHOUSE_MANAGER', label: 'Warehouse Manager' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
];

const FIELD =
  'w-full h-11 px-4 bg-white dark:bg-ink-800 border border-ink-900/15 dark:border-ink-50/15 font-sans text-sm text-ink-900 dark:text-ink-50 placeholder-ink-300 dark:placeholder-ink-600 focus:outline-none focus:ring-1 focus:ring-ink-900 dark:focus:ring-ink-50 transition-colors';

const LABEL = 'eyebrow text-ink-500 dark:text-ink-400 mb-2 block';

// ── Sub-components ────────────────────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-xs font-sans text-ink-600 dark:text-ink-400 mt-1.5">{message}</p>
  );
}

function ServerError({ message }: { message: string }) {
  return (
    <p className="text-sm font-sans text-ink-700 dark:text-ink-300 border border-ink-900/15 dark:border-ink-50/15 px-4 py-3">
      {message}
    </p>
  );
}

function SubmitBtn({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full h-11 bg-ink-900 dark:bg-ink-50 text-white dark:text-ink-900 font-sans font-medium text-sm tracking-wide disabled:opacity-50 hover:opacity-90 transition-opacity"
    >
      {loading ? '…' : label}
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [mode, setMode] = useState<Mode>('login');
  const [fading, setFading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  function switchMode(next: Mode) {
    if (next === mode) return;
    setFading(true);
    setServerError(null);
    setTimeout(() => {
      setMode(next);
      setFading(false);
    }, 150);
  }

  // Two separate form instances — state persists while hidden (good UX)
  const loginForm = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'SALES_STAFF' },
  });

  async function onLogin(values: LoginValues) {
    setServerError(null);
    try {
      const { data } = await axios.post<LoginResponse>('/api/auth/login', values);
      setAuth(data.user, data.accessToken, data.refreshToken);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      setServerError(
        axios.isAxiosError(err) && err.response?.status === 401
          ? 'Invalid email or password.'
          : 'Something went wrong. Please try again.',
      );
    }
  }

  async function onRegister(values: RegisterValues) {
    setServerError(null);
    try {
      const { data } = await axios.post<LoginResponse>('/api/auth/register', values);
      setAuth(data.user, data.accessToken, data.refreshToken);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      setServerError(
        axios.isAxiosError(err) && err.response?.status === 409
          ? 'This email is already in use.'
          : 'Something went wrong. Please try again.',
      );
    }
  }

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="mb-10">
          <p className="font-serif text-3xl font-medium text-ink-900 dark:text-ink-50 tracking-widest uppercase">
            Maison Sent
          </p>
          <p className="eyebrow text-ink-400 dark:text-ink-500 mt-2">ERP Console</p>
        </div>

        {/* Mode tabs */}
        <div className="flex gap-6 border-b border-ink-900/10 dark:border-ink-50/10 mb-8">
          {(['login', 'register'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={cn(
                'pb-3 text-sm font-sans font-medium -mb-px border-b-2 transition-colors',
                mode === m
                  ? 'border-ink-900 dark:border-ink-50 text-ink-900 dark:text-ink-50'
                  : 'border-transparent text-ink-400 dark:text-ink-500 hover:text-ink-700 dark:hover:text-ink-300',
              )}
            >
              {m === 'login' ? 'Sign in' : 'Register'}
            </button>
          ))}
        </div>

        {/* Form area — fades on switch */}
        <div
          className="transition-opacity duration-150"
          style={{ opacity: fading ? 0 : 1 }}
        >
          {/* ── Login ── */}
          {mode === 'login' && (
            <form onSubmit={loginForm.handleSubmit(onLogin)} noValidate className="space-y-5">
              <div>
                <label htmlFor="email" className={LABEL}>Email</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...loginForm.register('email')}
                  className={FIELD}
                />
                <FieldError message={loginForm.formState.errors.email?.message} />
              </div>

              <div>
                <label htmlFor="password" className={LABEL}>Password</label>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...loginForm.register('password')}
                  className={FIELD}
                />
                <FieldError message={loginForm.formState.errors.password?.message} />
              </div>

              {serverError && <ServerError message={serverError} />}
              <SubmitBtn loading={loginForm.formState.isSubmitting} label="Sign in" />
            </form>
          )}

          {/* ── Register ── */}
          {mode === 'register' && (
            <form onSubmit={registerForm.handleSubmit(onRegister)} noValidate className="space-y-5">
              <div>
                <label htmlFor="fullName" className={LABEL}>Full name</label>
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Jane Doe"
                  {...registerForm.register('fullName')}
                  className={FIELD}
                />
                <FieldError message={registerForm.formState.errors.fullName?.message} />
              </div>

              <div>
                <label htmlFor="reg-email" className={LABEL}>Email</label>
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...registerForm.register('email')}
                  className={FIELD}
                />
                <FieldError message={registerForm.formState.errors.email?.message} />
              </div>

              <div>
                <label htmlFor="reg-password" className={LABEL}>Password</label>
                <input
                  id="reg-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  {...registerForm.register('password')}
                  className={FIELD}
                />
                <FieldError message={registerForm.formState.errors.password?.message} />
              </div>

              <div>
                <label htmlFor="role" className={LABEL}>Role</label>
                <select
                  id="role"
                  {...registerForm.register('role')}
                  className={cn(FIELD, 'cursor-pointer appearance-none')}
                >
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <FieldError message={registerForm.formState.errors.role?.message} />
              </div>

              {serverError && <ServerError message={serverError} />}
              <SubmitBtn loading={registerForm.formState.isSubmitting} label="Create account" />
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
