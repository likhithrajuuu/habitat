import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { LOGIN_SUCCESS } from "../redux/constants/authConstants";
import { useToast } from "../components/toast/ToastProvider";

export default function OAuth2Redirect() {
  const dispatch = useDispatch();
  const toast = useToast();

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get("token");

    if (!token) {
      toast.error("OAuth login failed: missing token.");
      window.location.replace("/");
      return;
    }

    localStorage.setItem("token", token);
    dispatch({ type: LOGIN_SUCCESS, payload: token });

    toast.success("Signed in successfully.");

    url.searchParams.delete("token");
    window.history.replaceState({}, "", url.pathname + url.search);
    window.location.replace("/");
  }, [dispatch, toast]);

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-lg font-semibold text-slate-900">Signing you in…</div>
        <div className="mt-1 text-sm text-slate-600">Completing OAuth redirect.</div>
      </div>
    </div>
  );
}
