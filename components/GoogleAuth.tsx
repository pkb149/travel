"use client";
import { useEffect, useState } from "react";

const API = "https://travel-api.prashantkumarbharadwaj.workers.dev";

export default function GoogleAuth() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/auth/me`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.authenticated) setEmail(d.email);
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
            fetch(`${API}/auth/logout`, { method: "POST", credentials: "include" }).then(() => {
              setEmail(null);
              window.location.reload();
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
