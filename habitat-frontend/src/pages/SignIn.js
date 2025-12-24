import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff, Apple } from 'lucide-react';
import { clearAuthError, login, register } from '../redux/actions/authActions';
import { useToast } from '../components/toast/ToastProvider';

export default function SignIn() {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const toast = useToast();

  const oauthBaseUrl = (process.env.REACT_APP_API_BASE_URL || '').replace(/\/$/, '');

  const [mode, setMode] = useState('login');

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isAppleButtonRendered, setIsAppleButtonRendered] = useState(false);

  const buttonLabel = useMemo(() => {
    if (loading) return mode === 'login' ? 'Signing in…' : 'Creating account…';
    return mode === 'login' ? 'Sign in' : 'Create account';
  }, [loading, mode]);

  const isValidUsername = (value) => /^[a-z0-9_]+$/.test(value);

  const validateRegister = () => {
    const trimmed = username.trim();
    if (!trimmed) return 'Username is required';
    if (!isValidUsername(trimmed)) {
      return 'Username must be lowercase and only use letters, numbers, and _';
    }

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    if (!hasUpper || !hasLower || !hasSpecial) {
      return 'Password must include uppercase, lowercase, and 1 special character';
    }

    return null;
  };

  useEffect(() => {
    if (typeof error !== 'string') return;
    if (mode !== 'register') return;
    if (!/email/i.test(error) || !/exist/i.test(error)) return;

    toast.error('Email already exists — please sign in.');
    dispatch(clearAuthError());
    setMode('login');
  }, [error, mode, dispatch, toast]);

  useEffect(() => {
    const el = document.getElementById('appleid-signin-page');
    if (!el) return;

    const update = () => {
      setIsAppleButtonRendered(el.childElementCount > 0);
    };

    update();
    const observer = new MutationObserver(update);
    observer.observe(el, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();

    dispatch(clearAuthError());

    const normalizedEmail = email.trim().toLowerCase();

    if (mode === 'login') {
      dispatch(login({ username : username.trim(),email: normalizedEmail, password }));
      return;
    }

    const validationError = validateRegister();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    dispatch(register({ username: username.trim(), email: normalizedEmail, password }));
  };

  return (
    
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="hidden lg:block">
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
            <p className="mt-2 text-slate-600">
              Sign in to manage bookings, settings, and your profile.
            </p>
            <div className="mt-6 grid gap-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">Fast</div>
                <div className="text-sm text-slate-600">Jump back into your account in seconds.</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">Secure</div>
                <div className="text-sm text-slate-600">Uses your JWT token for protected APIs.</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <div className="text-sm font-semibold text-slate-900">Simple</div>
                <div className="text-sm text-slate-600">No distractions — just sign in.</div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {mode === 'login' ? 'Sign in' : 'Create account'}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {mode === 'login'
                    ? 'Use your email and password.'
                    : 'Choose a username, email, and password.'}
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-red-600" />
            </div>

            <div className="mt-5 flex items-center gap-2 rounded-xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => {
                  dispatch(clearAuthError());
                  setMode('login');
                  setIsPasswordVisible(false);
                }}
                className={
                  mode === 'login'
                    ? 'flex-1 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm'
                    : 'flex-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200/60'
                }
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => {
                  dispatch(clearAuthError());
                  setMode('register');
                  setIsPasswordVisible(false);
                }}
                className={
                  mode === 'register'
                    ? 'flex-1 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm'
                    : 'flex-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200/60'
                }
              >
                Register
              </button>
            </div>

            <form onSubmit={onSubmit} className="mt-6 grid gap-4">
              {mode === 'register' ? (
                <label className="block">
                  <div className="mb-1 text-xs font-medium text-slate-700">Username</div>
                  <input
                    value={username}
                    onChange={(e) => {
                      if (error) dispatch(clearAuthError());
                      setUsername(e.target.value);
                    }}
                    autoComplete="username"
                    placeholder="your_username"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    required
                  />
                  <div className="mt-1 text-xs text-slate-500">
                    Lowercase only. Allowed: letters, numbers, and <span className="font-mono">_</span>
                  </div>
                </label>
              ) : null}

              <label className="block">
                <div className="mb-1 text-xs font-medium text-slate-700">Email</div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    if (error) dispatch(clearAuthError());
                    setEmail(e.target.value);
                  }}
                  autoComplete="email"
                  placeholder="you@domain.com"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  required
                />
              </label>

              <label className="block">
                <div className="mb-1 text-xs font-medium text-slate-700">Password</div>
                <div className="relative">
                  <input
                    type={isPasswordVisible ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      if (error) dispatch(clearAuthError());
                      setPassword(e.target.value);
                    }}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
                    required
                  />
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setIsPasswordVisible((v) => !v)}
                    aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                    aria-pressed={isPasswordVisible}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  >
                    {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              {mode === 'register' ? (
                <div className="-mt-2 text-xs text-slate-500">
                  Password must include uppercase, lowercase, and a special character.
                </div>
              ) : null}

              {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {typeof error === 'string' ? error : 'Authentication failed'}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {buttonLabel}
              </button>

              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = `${oauthBaseUrl}/oauth2/authorization/google`;
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Continue with Google
                </button>
                <div className="relative mx-auto h-8 w-[200px]">
                  {!isAppleButtonRendered ? (
                    <button
                      type="button"
                      onClick={() => {
                        window.location.href = `${oauthBaseUrl}/oauth2/authorization/apple`;
                      }}
                      className="flex h-8 w-[200px] items-center justify-center gap-2 rounded-[41px] bg-black text-xs font-semibold text-white"
                    >
                      <Apple size={16} className="text-white" />
                      Sign in with Apple
                    </button>
                  ) : null}

                  <div
                    id="appleid-signin-page"
                    data-mode="center-align"
                    data-type="sign-in"
                    data-color="black"
                    data-border="false"
                    data-border-radius="41"
                    data-width="200"
                    data-height="32"
                    className={isAppleButtonRendered ? '' : 'pointer-events-none opacity-0'}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = `${oauthBaseUrl}/oauth2/authorization/apple`;
                    }}
                    aria-label="Sign in with Apple"
                    className="absolute inset-0 rounded-[41px] bg-transparent"
                  />
                </div>
              </div>

              <p className="text-xs text-slate-500">
                {mode === 'login'
                  ? 'This page dispatches Redux `login()` which POSTs to `/auth/login`.'
                  : 'This page dispatches Redux `register()` which POSTs to `/auth/register`.'}
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
