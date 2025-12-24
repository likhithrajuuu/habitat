import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Menu,
  X,
  Search,
  MapPin,
  User,
  Sun,
  Moon,
  ChevronDown,
  Building2,
  LocateFixed,
  Eye,
  EyeOff,
  Bell,
  ShoppingBag,
  MonitorPlay,
  CreditCard,
  HelpCircle,
  Settings,
  Gift,
  RefreshCcw,
  Lock,
  ChevronRight,
} from "lucide-react";
import { clearAuthError, login, logout, register } from "../redux/actions/authActions";

const METRO_CITIES = [
  { name: "New York", sub: "United States" },
  { name: "Los Angeles", sub: "United States" },
  { name: "London", sub: "United Kingdom" },
  { name: "Paris", sub: "France" },
  { name: "Tokyo", sub: "Japan" },
  { name: "Singapore", sub: "Singapore" },
  { name: "Dubai", sub: "UAE" },
  { name: "Sydney", sub: "Australia" },
  { name: "Mumbai", sub: "India" },
  { name: "Bengaluru", sub: "India" },
];

const isValidUsername = (value) => /^[a-z0-9_]+$/.test(value);

const LocationMenu = ({
  location,
  isDetectingLocation,
  isOpen,
  onToggle,
  onClose,
  onDetect,
  onSelectCity,
}) => {
  return (
    <div className="relative" data-location-menu="true">
      <button
        type="button"
        onClick={onToggle}
        className="inline-flex w-10 items-center justify-center gap-1.5 rounded-full bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/15 sm:w-44 sm:justify-start"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <MapPin size={16} />
        <span className="hidden min-w-0 flex-1 truncate sm:inline">
          {isDetectingLocation ? "Detecting…" : location}
        </span>
        <ChevronDown size={16} className="hidden opacity-90 sm:inline" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Choose your city</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Pick a metro area for shows near you</div>
          </div>

          <div className="max-h-80 overflow-auto p-2" role="listbox" aria-label="City">
            <button
              type="button"
              onClick={() => {
                onDetect();
                onClose();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
              role="option"
              aria-selected={false}
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 text-white">
                <LocateFixed size={18} />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {isDetectingLocation ? "Detecting location…" : "Detect my location"}
                </span>
                <span className="block truncate text-xs text-slate-500 dark:text-slate-400">Use GPS to set your current city</span>
              </span>
            </button>

            <div className="my-1 h-px bg-slate-200 dark:bg-slate-800" />

            {METRO_CITIES.map((city) => (
              <button
                key={city.name}
                type="button"
                onClick={() => onSelectCity(city.name)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
                role="option"
                aria-selected={location === city.name}
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-slate-700">
                  <Building2 size={18} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{city.name}</span>
                  <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{city.sub}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const RightDrawer = ({ showMenu, onClose, onLogout, isAuthenticated, onLoginOrRegister, user }) => {
  return (
    <div className={showMenu ? "fixed inset-0 z-50" : "pointer-events-none fixed inset-0 z-50"}>
      <button
        type="button"
        onClick={onClose}
        className={showMenu ? "absolute inset-0 bg-black/40" : "absolute inset-0 bg-black/0"}
        aria-label="Close menu"
      />

      <aside
        className={
          "absolute right-0 top-0 h-full w-[85%] max-w-sm transform bg-white shadow-xl transition-transform duration-200 dark:bg-slate-900 " +
          (showMenu ? "translate-x-0" : "translate-x-full")
        }
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-5 dark:border-slate-800">
          <div className="text-3xl font-semibold leading-none text-slate-900 dark:text-slate-100">Hey!</div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <X />
          </button>
        </div>

        <div className="px-5 py-4">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-700">
                {isAuthenticated ? <User size={20} /> : <Gift size={20} />}
              </span>
              <div className="min-w-0">
                {isAuthenticated ? (
                  <>
                    <div className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {user?.username || user?.name || user?.email || "Account"}
                    </div>
                    <div className="truncate text-sm font-medium text-slate-600 dark:text-slate-300">{user?.email || ""}</div>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-medium text-slate-600 dark:text-slate-300">Unlock special offers &</div>
                    <div className="text-sm font-medium text-slate-600 dark:text-slate-300">great benefits</div>
                  </>
                )}
              </div>
            </div>

            {!isAuthenticated ? (
              <button
                type="button"
                onClick={onLoginOrRegister}
                className="shrink-0 rounded-xl border border-red-500 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                Login / Register
              </button>
            ) : (
              <button
                type="button"
                onClick={onLogout}
                className="shrink-0 rounded-xl border border-red-500 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            )}
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex w-full items-center gap-4 bg-white px-4 py-4 text-left hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800"
            >
              <Bell className="shrink-0 text-slate-700 dark:text-slate-200" size={22} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Notifications</div>
              </div>
              <ChevronRight className="shrink-0 text-slate-400" size={18} />
            </button>

            <div className="h-px bg-slate-200 dark:bg-slate-800" />

            <button
              type="button"
              onClick={onClose}
              disabled={!isAuthenticated}
              className={
                isAuthenticated
                  ? "flex w-full items-center gap-4 bg-white px-4 py-4 text-left hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800"
                  : "flex w-full cursor-not-allowed items-center gap-4 bg-white px-4 py-4 text-left text-slate-400 dark:bg-slate-900"
              }
            >
              <ShoppingBag
                className={
                  "shrink-0 " +
                  (isAuthenticated ? "text-slate-700 dark:text-slate-200" : "text-slate-300")
                }
                size={22}
              />
              <div className="min-w-0 flex-1">
                <div
                  className={
                    "text-sm font-medium " +
                    (isAuthenticated ? "text-slate-900 dark:text-slate-100" : "text-slate-400")
                  }
                >
                  Your Orders
                </div>
                <div
                  className={
                    "mt-0.5 text-xs " +
                    (isAuthenticated ? "text-slate-500 dark:text-slate-400" : "text-slate-400")
                  }
                >
                  View all your bookings & purchases
                </div>
              </div>
              {!isAuthenticated ? <Lock className="shrink-0 text-slate-300" size={18} /> : null}
            </button>

            <div className="h-px bg-slate-200 dark:bg-slate-800" />

            <button
              type="button"
              onClick={onClose}
              disabled={!isAuthenticated}
              className={
                isAuthenticated
                  ? "flex w-full items-center gap-4 bg-white px-4 py-4 text-left hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800"
                  : "flex w-full cursor-not-allowed items-center gap-4 bg-white px-4 py-4 text-left text-slate-400 dark:bg-slate-900"
              }
            >
              <MonitorPlay
                className={
                  "shrink-0 " +
                  (isAuthenticated ? "text-slate-700 dark:text-slate-200" : "text-slate-300")
                }
                size={22}
              />
              <div className="min-w-0 flex-1">
                <div
                  className={
                    "text-sm font-medium " +
                    (isAuthenticated ? "text-slate-900 dark:text-slate-100" : "text-slate-400")
                  }
                >
                  Stream Library
                </div>
                <div
                  className={
                    "mt-0.5 text-xs " +
                    (isAuthenticated ? "text-slate-500 dark:text-slate-400" : "text-slate-400")
                  }
                >
                  Rented & Purchased Movies
                </div>
              </div>
              {!isAuthenticated ? <Lock className="shrink-0 text-slate-300" size={18} /> : null}
            </button>

            <div className="h-px bg-slate-200 dark:bg-slate-800" />

            <button
              type="button"
              onClick={onClose}
              className="flex w-full items-center gap-4 bg-white px-4 py-4 text-left hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800"
            >
              <CreditCard className="shrink-0 text-slate-700 dark:text-slate-200" size={22} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Play Credit Card</div>
                <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">View your Play Credit Card details and offers</div>
              </div>
              <ChevronRight className="shrink-0 text-slate-400" size={18} />
            </button>

            <div className="h-px bg-slate-200 dark:bg-slate-800" />

            <button
              type="button"
              onClick={onClose}
              className="flex w-full items-center gap-4 bg-white px-4 py-4 text-left hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800"
            >
              <HelpCircle className="shrink-0 text-slate-700 dark:text-slate-200" size={22} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Help & Support</div>
                <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">View commonly asked queries and Chat</div>
              </div>
              <ChevronRight className="shrink-0 text-slate-400" size={18} />
            </button>

            <div className="h-px bg-slate-200 dark:bg-slate-800" />

            <button
              type="button"
              onClick={onClose}
              disabled={!isAuthenticated}
              className={
                isAuthenticated
                  ? "flex w-full items-center gap-4 bg-white px-4 py-4 text-left hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800"
                  : "flex w-full cursor-not-allowed items-center gap-4 bg-white px-4 py-4 text-left text-slate-400 dark:bg-slate-900"
              }
            >
              <Settings
                className={
                  "shrink-0 " +
                  (isAuthenticated ? "text-slate-700 dark:text-slate-200" : "text-slate-300")
                }
                size={22}
              />
              <div className="min-w-0 flex-1">
                <div
                  className={
                    "text-sm font-medium " +
                    (isAuthenticated ? "text-slate-900 dark:text-slate-100" : "text-slate-400")
                  }
                >
                  Accounts & Settings
                </div>
                <div
                  className={
                    "mt-0.5 text-xs " +
                    (isAuthenticated ? "text-slate-500 dark:text-slate-400" : "text-slate-400")
                  }
                >
                  Profile, Payments, Preferences & Security
                </div>
              </div>
              {!isAuthenticated ? <Lock className="shrink-0 text-slate-300" size={18} /> : null}
            </button>

            {isAuthenticated ? (
              <>
                <div className="h-px bg-slate-200 dark:bg-slate-800" />
                <button
                  type="button"
                  onClick={onClose}
                  className="flex w-full items-center gap-4 bg-white px-4 py-4 text-left hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800"
                >
                  <User className="shrink-0 text-slate-700 dark:text-slate-200" size={22} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Profile</div>
                    <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Update name and account info</div>
                  </div>
                  <ChevronRight className="shrink-0 text-slate-400" size={18} />
                </button>

                <div className="h-px bg-slate-200 dark:bg-slate-800" />
                <button
                  type="button"
                  onClick={onClose}
                  className="flex w-full items-center gap-4 bg-white px-4 py-4 text-left hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800"
                >
                  <CreditCard className="shrink-0 text-slate-700 dark:text-slate-200" size={22} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Payment Methods</div>
                    <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Manage cards and billing</div>
                  </div>
                  <ChevronRight className="shrink-0 text-slate-400" size={18} />
                </button>

                <div className="h-px bg-slate-200 dark:bg-slate-800" />
                <button
                  type="button"
                  onClick={onClose}
                  className="flex w-full items-center gap-4 bg-white px-4 py-4 text-left hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800"
                >
                  <Lock className="shrink-0 text-slate-700 dark:text-slate-200" size={22} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Security</div>
                    <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">Password and sign-in options</div>
                  </div>
                  <ChevronRight className="shrink-0 text-slate-400" size={18} />
                </button>
              </>
            ) : null}

            <div className="h-px bg-slate-200 dark:bg-slate-800" />

            <button
              type="button"
              onClick={onClose}
              className="flex w-full items-center gap-4 bg-white px-4 py-4 text-left hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800"
            >
              <Gift className="shrink-0 text-slate-700 dark:text-slate-200" size={22} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">Rewards</div>
                <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">View your rewards & unlock new ones</div>
              </div>
              <ChevronRight className="shrink-0 text-slate-400" size={18} />
            </button>

            <div className="h-px bg-slate-200 dark:bg-slate-800" />

            <button
              type="button"
              onClick={onClose}
              className="flex w-full items-center gap-4 bg-white px-4 py-4 text-left hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800"
            >
              <RefreshCcw className="shrink-0 text-slate-700 dark:text-slate-200" size={22} />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">BookAChange</div>
              </div>
              <ChevronRight className="shrink-0 text-slate-400" size={18} />
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};

const AuthModal = ({
  isOpen,
  authMode,
  loading,
  error,
  authPrimaryLabel,
  oauthBaseUrl,
  authEmail,
  authPassword,
  authUsername,
  isAuthPasswordVisible,
  onClose,
  onOpenMode,
  onSubmit,
  onEmailChange,
  onPasswordChange,
  onUsernameChange,
  onTogglePasswordVisible,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <div className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {authMode === "login" ? "Sign in" : "Create account"}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {authMode === "login"
                ? "Welcome back — sign in to continue."
                : "Register to start booking shows."}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <X />
          </button>
        </div>

        <div className="px-5 py-4">
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => onOpenMode("login")}
              className={
                authMode === "login"
                  ? "flex-1 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100"
                  : "flex-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200/60 dark:text-slate-200"
              }
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => onOpenMode("register")}
              className={
                authMode === "register"
                  ? "flex-1 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100"
                  : "flex-1 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200/60 dark:text-slate-200"
              }
            >
              Register
            </button>
          </div>

          <form onSubmit={onSubmit} className="grid gap-3">
            {authMode === "register" && (
              <label className="block">
                <div className="mb-1 text-xs font-medium text-slate-700">Name</div>
                <input
                  value={authUsername}
                  onChange={onUsernameChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  placeholder="your_username"
                  autoComplete="username"
                  required
                />
                <div className="mt-1 text-xs text-slate-500">
                  Lowercase only. Allowed: letters, numbers, and <span className="font-mono">_</span>
                </div>
              </label>
            )}

            <label className="block">
              <div className="mb-1 text-xs font-medium text-slate-700">Email</div>
              <input
                type="email"
                value={authEmail}
                onChange={onEmailChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
                placeholder="you@domain.com"
                autoComplete="email"
                required
              />
            </label>

            <label className="block">
              <div className="mb-1 text-xs font-medium text-slate-700">Password</div>
              <div className="relative">
                <input
                  type={isAuthPasswordVisible ? "text" : "password"}
                  value={authPassword}
                  onChange={onPasswordChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  placeholder="••••••••"
                  autoComplete={authMode === "login" ? "current-password" : "new-password"}
                  required
                />
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={onTogglePasswordVisible}
                  aria-label={isAuthPasswordVisible ? "Hide password" : "Show password"}
                  aria-pressed={isAuthPasswordVisible}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  {isAuthPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            {authMode === "register" ? (
              <div className="-mt-1 text-xs text-slate-500">
                Password must include uppercase, lowercase, and a special character.
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {authPrimaryLabel}
            </button>

            <div className="my-2 flex items-center gap-2 text-xs text-slate-400">
              <div className="h-px flex-1 bg-slate-200" />
              OR
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <button
              type="button"
              onClick={() => {
                window.location.href = `${oauthBaseUrl}/oauth2/authorization/google`;
              }}
              className="gsi-material-button w-full"
            >
              <div className="gsi-material-button-state" />
              <div className="gsi-material-button-content-wrapper">
                <div className="gsi-material-button-icon">
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    style={{ display: "block" }}
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
                </div>
                <span className="gsi-material-button-contents">Sign in with Google</span>
                <span style={{ display: "none" }}>Sign in with Google</span>
              </div>
            </button>

            <div className="relative flex w-full justify-center">
              <div
                id="appleid-signin"
                data-mode="center-align"
                data-type="sign-in"
                data-color="black"
                data-border="false"
                data-border-radius="41"
                data-width="200"
                data-height="32"
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
          </form>
        </div>
      </div>
    </div>
  );
};

const Navbar = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, error, user } = useSelector((state) => state.auth);

  const oauthBaseUrl = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/$/, "");

  const [search, setSearch] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [location, setLocation] = useState("Detecting...");
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login"); // login | register
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authUsername, setAuthUsername] = useState("");
  const [isAuthPasswordVisible, setIsAuthPasswordVisible] = useState(false);

  const authPrimaryLabel = useMemo(() => {
    if (loading) return authMode === "login" ? "Signing in…" : "Creating account…";
    return authMode === "login" ? "Sign in" : "Create account";
  }, [authMode, loading]);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDark = stored ? stored === "dark" : prefersDark;

    setIsDarkMode(shouldUseDark);
    document.documentElement.classList.toggle("dark", shouldUseDark);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem("theme", next ? "dark" : "light");
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  };

  /* ---------- Auto-detect location ---------- */
  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation("Location unavailable");
      return;
    }

    setIsDetectingLocation(true);
    // Keep the current label while detecting to avoid layout shifts.

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
          );
          const data = await res.json();
          setLocation(data.address.city || data.address.state || "Your area");
        } catch {
          setLocation("Your area");
        } finally {
          setIsDetectingLocation(false);
        }
      },
      () => {
        setLocation("Location blocked");
        setIsDetectingLocation(false);
      }
    );
  }, []);

  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  useEffect(() => {
    if (!error) return;
    const message = typeof error === "string" ? error : "Authentication failed";

    // If email already exists during register, prompt user to sign in.
    if (authMode === "register" && /email/i.test(message) && /exist/i.test(message)) {
      setAuthMode("login");
      return;
    }

    console.warn(message);
  }, [error, authMode]);

  useEffect(() => {
    if (!isLocationMenuOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") setIsLocationMenuOpen(false);
    };

    const onMouseDown = (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.closest('[data-location-menu="true"]')) return;
      setIsLocationMenuOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onMouseDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [isLocationMenuOpen]);

  /* ---------- Search handler ---------- */
  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Search:", search);
  };

  const openDrawer = () => setShowMenu(true);
  const closeDrawer = () => setShowMenu(false);

  const openAuth = (mode) => {
    dispatch(clearAuthError());
    setAuthMode(mode);
    setIsAuthPasswordVisible(false);
    setIsAuthOpen(true);
  };

  const closeAuth = () => {
    setIsAuthOpen(false);
    dispatch(clearAuthError());
    setAuthEmail("");
    setAuthUsername("");
    setAuthPassword("");
    setIsAuthPasswordVisible(false);
  };

  const validateRegister = () => {
    const username = authUsername.trim();
    if (!username) return "Username is required";
    if (!isValidUsername(username)) {
      return "Username must be lowercase and only use letters, numbers, and _";
    }

    const password = authPassword;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    if (!hasUpper || !hasLower || !hasSpecial) {
      return "Password must include uppercase, lowercase, and 1 special character";
    }

    return null;
  };

  const toggleLocationMenu = () => setIsLocationMenuOpen((v) => !v);

  const closeLocationMenu = () => setIsLocationMenuOpen(false);

  const handleSelectCity = (cityName) => {
    setLocation(cityName);
    closeLocationMenu();
  };

  const handleSignInClick = () => {
    openAuth("login");
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    dispatch(clearAuthError());

    const normalizedEmail = authEmail.trim().toLowerCase();

    if (authMode === "login") {
      dispatch(login({ email: normalizedEmail, password: authPassword }));
      return;
    }

    const validationError = validateRegister();
    if (validationError) {
      console.warn(validationError);
      return;
    }

    dispatch(
      register({
        username: authUsername.trim(),
        email: normalizedEmail,
        password: authPassword,
      })
    );
  };

  useEffect(() => {
    if (isAuthenticated && isAuthOpen) {
      // Close modal on successful auth
      setIsAuthOpen(false);
      setAuthEmail("");
      setAuthUsername("");
      setAuthPassword("");
      setIsAuthPasswordVisible(false);
    }
  }, [isAuthenticated, isAuthOpen]);

  const handleLogout = () => {
    dispatch(logout());
    closeDrawer();
  };

  return (
    <>
      {/* ================= NAVBAR ================= */}
      <nav className="sticky top-0 z-50 border-b border-red-700/20 bg-red-600 shadow-sm">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-16 items-center justify-between gap-2 sm:gap-4">

            {/* Logo */}
            <div className="flex items-center gap-2 text-xl font-bold text-white">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15">🎬</span>
              <span>Habitat</span>
            </div>

            {/* Search */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex flex-1 max-w-lg items-center rounded-full border border-white/30 bg-white/95 px-4 shadow-sm"
            >
              <Search size={18} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search movies, events, artists..."
                className="ml-2 w-full bg-transparent py-2 text-sm text-slate-900 outline-none placeholder:text-slate-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>

            {/* Right section */}
            <div className="flex items-center gap-2 sm:gap-4">

              <LocationMenu
                location={location}
                isDetectingLocation={isDetectingLocation}
                isOpen={isLocationMenuOpen}
                onToggle={toggleLocationMenu}
                onClose={closeLocationMenu}
                onDetect={detectLocation}
                onSelectCity={handleSelectCity}
              />

              {/* Theme toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                role="switch"
                aria-checked={isDarkMode}
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/15"
              >
                <span
                  className={
                    "relative inline-flex h-5 w-9 items-center rounded-full bg-white/20 transition" +
                    (isDarkMode ? "" : "")
                  }
                >
                  <span
                    className={
                      "inline-block h-4 w-4 transform rounded-full bg-white transition-transform " +
                      (isDarkMode ? "translate-x-4" : "translate-x-1")
                    }
                  />
                </span>
                {isDarkMode ? <Moon size={16} /> : <Sun size={16} />}
              </button>

              {/* Sign in */}
              {!isAuthenticated ? (
                <button
                  onClick={handleSignInClick}
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Sign in
                </button>
              ) : (
                <button
                  onClick={openDrawer}
                  className="hidden sm:inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
                >
                  <User size={16} />
                  {user?.username || user?.name || user?.email || "Account"}
                </button>
              )}

              {/* Hamburger */}
              <button
                onClick={showMenu ? closeDrawer : openDrawer}
                className="rounded-full p-2 text-white hover:bg-white/15"
                aria-label="Open menu"
              >
                {showMenu ? <X /> : <Menu />}
              </button>
            </div>
          </div>

          {/* Mobile search row */}
          <div className="pb-3 md:hidden">
            <form
              onSubmit={handleSearch}
              className="flex items-center rounded-full border border-white/30 bg-white/95 px-4 shadow-sm"
            >
              <Search size={18} className="text-slate-400" />
              <input
                type="text"
                placeholder="Search movies, events, artists..."
                className="ml-2 w-full bg-transparent py-2 text-sm text-slate-900 outline-none placeholder:text-slate-500"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>
          </div>
        </div>
      </nav>

      <RightDrawer
        showMenu={showMenu}
        onClose={closeDrawer}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        user={user}
        onLoginOrRegister={() => {
          closeDrawer();
          openAuth("login");
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        authMode={authMode}
        loading={loading}
        error={error}
        authPrimaryLabel={authPrimaryLabel}
        oauthBaseUrl={oauthBaseUrl}
        authEmail={authEmail}
        authPassword={authPassword}
        authUsername={authUsername}
        isAuthPasswordVisible={isAuthPasswordVisible}
        onClose={closeAuth}
        onOpenMode={openAuth}
        onSubmit={handleAuthSubmit}
        onEmailChange={(e) => {
          if (error) dispatch(clearAuthError());
          setAuthEmail(e.target.value);
        }}
        onPasswordChange={(e) => {
          if (error) dispatch(clearAuthError());
          setAuthPassword(e.target.value);
        }}
        onUsernameChange={(e) => {
          if (error) dispatch(clearAuthError());
          setAuthUsername(e.target.value);
        }}
        onTogglePasswordVisible={() => setIsAuthPasswordVisible((v) => !v)}
      />
    </>
  );
};

export default Navbar;