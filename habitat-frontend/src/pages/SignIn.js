import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Apple, Check as CheckIcon, X as XIcon } from 'lucide-react';
import { clearAuthError, login, register } from '../redux/actions/authActions';

export default function SignIn() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const oauthBaseUrl = (process.env.REACT_APP_API_BASE_URL || '').replace(/\/$/, '');

  const [mode, setMode] = useState('login');

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isAppleButtonRendered, setIsAppleButtonRendered] = useState(false);
  const [formError, setFormError] = useState(null);
  const [formInfo, setFormInfo] = useState(null);
  const [emailTouched, setEmailTouched] = useState(false);
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  const buttonLabel = useMemo(() => {
    if (loading) return mode === 'login' ? 'Signing in…' : 'Creating account…';
    return mode === 'login' ? 'Sign in' : 'Create account';
  }, [loading, mode]);

  const isValidUsername = (value) => /^[a-z0-9_]+$/.test(value);
  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const trimmedUsername = username.trim();
  const normalizedEmail = email.trim().toLowerCase();

  const usernameValid = !!trimmedUsername && isValidUsername(trimmedUsername);
  const emailValid = !!normalizedEmail && isValidEmail(normalizedEmail);

  const passwordHasUpper = /[A-Z]/.test(password);
  const passwordHasLower = /[a-z]/.test(password);
  const passwordHasSpecial = /[^A-Za-z0-9]/.test(password);
  const passwordValid = passwordHasUpper && passwordHasLower && passwordHasSpecial;

  const confirmPasswordValid = confirmPassword.length > 0 && confirmPassword === password;

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

    setFormInfo('Email already exists — please sign in.');
    setFormError(null);
    dispatch(clearAuthError());
    setMode('login');
  }, [error, mode, dispatch]);

  useEffect(() => {
    if (!isAuthenticated) return;
    navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

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

    setFormError(null);
    setFormInfo(null);
    dispatch(clearAuthError());

    setEmailTouched(true);
    setUsernameTouched(true);
    setPasswordTouched(true);
    setConfirmPasswordTouched(true);

    if (mode === 'login') {
      if (!emailValid) {
        setFormError('Please enter a valid email address.');
        return;
      }
      if (!password) {
        setFormError('Password is required.');
        return;
      }
      dispatch(login({ email: normalizedEmail, password }));
      return;
    }

    if (!emailValid || !usernameValid || !passwordValid || !confirmPasswordValid) {
      setFormError('Please fix the highlighted fields before continuing.');
      return;
    }

    const validationError = validateRegister();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    dispatch(register({ username: username.trim(), email: normalizedEmail, password }));
  };

  return (

    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="hidden lg:block">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Welcome back</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Sign in to manage bookings, settings, and your profile.
            </p>
            <div className="mt-6 grid gap-3">
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Fast</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">Jump back into your account in seconds.</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Secure</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">Uses your JWT token for protected APIs.</div>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Simple</div>
                <div className="text-sm text-slate-600 dark:text-slate-300">No distractions — just sign in.</div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">
                  <Link
                    to="/"
                    className="rounded-md px-1 py-0.5 hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    Habitat
                  </Link>
                </div>
                <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-slate-100">Welcome back</h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  {mode === 'login'
                    ? 'Use your email and password.'
                    : 'Choose a username, email, and password.'}
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-red-600" aria-hidden="true" />
            </div>

            <div className="mt-5 flex items-center gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => {
                  dispatch(clearAuthError());
                  setFormError(null);
                  setFormInfo(null);
                  setMode('login');
                  setIsPasswordVisible(false);
                  setConfirmPassword('');
                  setConfirmPasswordTouched(false);
                }}
                className={
                  mode === 'login'
                    ? 'flex-1 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm dark:bg-slate-950 dark:text-slate-100'
                    : 'flex-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200/60 dark:text-slate-200 dark:hover:bg-slate-700/60'
                }
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => {
                  dispatch(clearAuthError());
                  setFormError(null);
                  setFormInfo(null);
                  setMode('register');
                  setIsPasswordVisible(false);
                }}
                className={
                  mode === 'register'
                    ? 'flex-1 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm dark:bg-slate-950 dark:text-slate-100'
                    : 'flex-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200/60 dark:text-slate-200 dark:hover:bg-slate-700/60'
                }
              >
                Register
              </button>
            </div>

            {formInfo ? (
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                {formInfo}
              </div>
            ) : null}

            {formError ? (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
                {formError}
              </div>
            ) : null}

            <form onSubmit={onSubmit} className="mt-6 grid gap-4">
              {mode === 'register' ? (
                <label className="block">
                  <div className="mb-1 text-xs font-medium text-slate-700 dark:text-slate-200">Username</div>
                  <div className="relative">
                    <input
                      value={username}
                      onChange={(e) => {
                        if (error) dispatch(clearAuthError());
                        if (formError) setFormError(null);
                        if (formInfo) setFormInfo(null);
                        setUsernameTouched(true);
                        setUsername(e.target.value);
                      }}
                      autoComplete="username"
                      placeholder="your_username"
                      className={
                        "w-full rounded-lg border bg-white px-3 py-2 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 " +
                        (usernameTouched && !usernameValid
                          ? "border-red-300 dark:border-red-900/60"
                          : "border-slate-300 dark:border-slate-700")
                      }
                      required
                    />
                    {usernameTouched ? (
                      usernameValid ? (
                        <CheckIcon
                          size={18}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400"
                          aria-hidden="true"
                        />
                      ) : (
                        <XIcon
                          size={18}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600 dark:text-red-300"
                          aria-hidden="true"
                        />
                      )
                    ) : null}
                  </div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Lowercase only. Allowed: letters, numbers, and <span className="font-mono">_</span>
                  </div>
                </label>
              ) : null}

              <label className="block">
                <div className="mb-1 text-xs font-medium text-slate-700 dark:text-slate-200">Email</div>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      if (error) dispatch(clearAuthError());
                      if (formError) setFormError(null);
                      if (formInfo) setFormInfo(null);
                      setEmailTouched(true);
                      setEmail(e.target.value);
                    }}
                    autoComplete="email"
                    placeholder="you@domain.com"
                    className={
                      "w-full rounded-lg border bg-white px-3 py-2 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 " +
                      (emailTouched && !emailValid
                        ? "border-red-300 dark:border-red-900/60"
                        : "border-slate-300 dark:border-slate-700")
                    }
                    required
                  />
                  {emailTouched ? (
                    emailValid ? (
                      <CheckIcon
                        size={18}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400"
                        aria-hidden="true"
                      />
                    ) : (
                      <XIcon
                        size={18}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600 dark:text-red-300"
                        aria-hidden="true"
                      />
                    )
                  ) : null}
                </div>
              </label>

              <label className="block">
                <div className="mb-1 text-xs font-medium text-slate-700 dark:text-slate-200">Password</div>
                <div className="relative">
                  <input
                    type={isPasswordVisible ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      if (error) dispatch(clearAuthError());
                      if (formError) setFormError(null);
                      if (formInfo) setFormInfo(null);
                      setPasswordTouched(true);
                      setPassword(e.target.value);
                    }}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    placeholder="••••••••"
                    className={
                      "w-full rounded-lg border bg-white px-3 py-2 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 " +
                      (mode === 'register' && passwordTouched && !passwordValid
                        ? "border-red-300 dark:border-red-900/60"
                        : "border-slate-300 dark:border-slate-700")
                    }
                    required
                  />
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setIsPasswordVisible((v) => !v)}
                    aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                    aria-pressed={isPasswordVisible}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:text-slate-300 dark:hover:text-slate-100"
                  >
                    {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </label>

              {mode === 'register' ? (
                <label className="block">
                  <div className="mb-1 text-xs font-medium text-slate-700 dark:text-slate-200">Confirm password</div>
                  <div className="relative">
                    <input
                      type={isPasswordVisible ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        if (error) dispatch(clearAuthError());
                        if (formError) setFormError(null);
                        if (formInfo) setFormInfo(null);
                        setConfirmPasswordTouched(true);
                        setConfirmPassword(e.target.value);
                      }}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      className={
                        "w-full rounded-lg border bg-white px-3 py-2 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 " +
                        (confirmPasswordTouched && !confirmPasswordValid
                          ? "border-red-300 dark:border-red-900/60"
                          : "border-slate-300 dark:border-slate-700")
                      }
                      required
                    />
                    {confirmPasswordTouched ? (
                      confirmPasswordValid ? (
                        <CheckIcon
                          size={18}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400"
                          aria-hidden="true"
                        />
                      ) : (
                        <XIcon
                          size={18}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600 dark:text-red-300"
                          aria-hidden="true"
                        />
                      )
                    ) : null}
                  </div>
                </label>
              ) : null}

              {mode === 'register' ? (
                <div className="-mt-2 grid gap-1 text-xs">
                  <div className="flex items-center gap-2">
                    {passwordHasUpper ? (
                      <CheckIcon size={14} className="text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    ) : (
                      <XIcon size={14} className="text-red-600 dark:text-red-300" aria-hidden="true" />
                    )}
                    <span className="text-slate-600 dark:text-slate-300">At least 1 uppercase letter</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {passwordHasLower ? (
                      <CheckIcon size={14} className="text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    ) : (
                      <XIcon size={14} className="text-red-600 dark:text-red-300" aria-hidden="true" />
                    )}
                    <span className="text-slate-600 dark:text-slate-300">At least 1 lowercase letter</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {passwordHasSpecial ? (
                      <CheckIcon size={14} className="text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                    ) : (
                      <XIcon size={14} className="text-red-600 dark:text-red-300" aria-hidden="true" />
                    )}
                    <span className="text-slate-600 dark:text-slate-300">At least 1 special character</span>
                  </div>
                </div>
              ) : null}

              {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
                  {typeof error === 'string' ? error : 'Authentication failed'}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={
                  loading ||
                  !emailValid ||
                  (mode === 'login' && !password) ||
                  (mode === 'register' && (!usernameValid || !passwordValid || !confirmPasswordValid))
                }
                className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-red-600 dark:hover:text-white"
              >
                {buttonLabel}
              </button>

              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = `${oauthBaseUrl}/oauth2/authorization/google`;
                  }}
                  className="relative w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 pl-11 text-center text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  <span className="absolute left-4 top-1/2 -translate-y-1/2" aria-hidden="true">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      className="h-5 w-5"
                      style={{ display: 'block' }}
                    >
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      />
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      />
                      <path fill="none" d="M0 0h48v48H0z" />
                    </svg>
                  </span>
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
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
