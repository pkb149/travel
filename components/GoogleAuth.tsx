"use client";
import { useEffect, useState } from "react";

const API = "https://travel-api.prashantkumarbharadwaj.workers.dev";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("travel_token");
}

export default function GoogleAuth() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle token from redirect (?token=xxx&auth=success)
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const token = url.searchParams.get("token");
      if (token) {
        localStorage.setItem("travel_token", token);
        url.searchParams.delete("token");
        url.searchParams.delete("auth");
        window.history.replaceState({}, "", url.toString());
      }
    }
    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    fetch(`${API}/auth/me`, { credentials: "include", headers })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.authenticated) setEmail(d.email);
        else if (token) {
          // token invalid, clear
          localStorage.removeItem("travel_token");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <span className="text-xs text-stone-400">Checking auth…</span>;

  if (email) {
    return (
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">{email}</span>
        <button
          onClick={() => {
            const token = getToken();
            localStorage.removeItem("travel_token");
            fetch(`${API}/auth/logout`, { method: "POST", credentials: "include", headers: token ? { Authorization: `Bearer ${token}` } : {} }).finally(() => {
              setEmail(null);
              window.location.href = "/";
            });
          }}
          className="rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-600 ring-1 ring-stone-200 hover:bg-stone-50"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <a
      href={`${API}/auth/login`}
      className="rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50"
    >
      Sign in with Google
    </a>
  );
}
