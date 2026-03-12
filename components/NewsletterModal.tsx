"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "restaurant-newsletter-dismissed";

export function NewsletterModal() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const alreadyDismissed =
      typeof window !== "undefined" &&
      window.localStorage.getItem(STORAGE_KEY) === "true";

    if (alreadyDismissed) return;

    const timer = setTimeout(() => {
      setOpen(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const close = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, "true");
    }
    setOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    close();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={close}
          className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
          aria-label="Fermer la fenêtre d'inscription"
        >
          ×
        </button>
        <div className="mt-2">
          <h2 className="text-xl font-semibold text-gray-900">
            Restez informé
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Recevez nos offres spéciales et événements en avant-première.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label
              htmlFor="newsletter-email"
              className="block text-xs font-medium uppercase tracking-wide text-gray-700"
            >
              Adresse e-mail
            </label>
            <input
              id="newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-800/10"
              placeholder="vous@example.com"
            />
          </div>
          <button
            type="submit"
            className="flex w-full items-center justify-center rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700"
          >
            S&apos;inscrire
          </button>
        </form>
      </div>
    </div>
  );
}

