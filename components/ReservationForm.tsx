"use client";

import { useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export function ReservationForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    guests: "2",
    message: "",
  });

  const today = new Date().toISOString().split("T")[0];

  const timeSlots: string[] = [
    // 12:00–14:30
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    // 19:00–22:30
    "19:00",
    "19:30",
    "20:00",
    "20:30",
    "21:00",
    "21:30",
    "22:00",
    "22:30",
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    try {
      const response = await fetch("/api/reservation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          date: form.date,
          time: form.time,
          guests: Number(form.guests),
          message: form.message || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(
          data?.error ??
            "Impossible d'envoyer votre réservation pour le moment.",
        );
        setStatus("error");
        return;
      }

      setStatus("success");
      setForm({
        name: "",
        email: "",
        phone: "",
        date: "",
        time: "",
        guests: "2",
        message: "",
      });
    } catch (err) {
      console.error(err);
      setError("Une erreur inattendue est survenue.");
      setStatus("error");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-800">
            Prénom et nom
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-800/10"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-800">
            Email
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) =>
              setForm((f) => ({ ...f, email: e.target.value }))
            }
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-800/10"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-800">
            Téléphone
          </label>
          <input
            type="tel"
            required
            value={form.phone}
            onChange={(e) =>
              setForm((f) => ({ ...f, phone: e.target.value }))
            }
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-800/10"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-800">
            Date
          </label>
          <input
            type="date"
            required
            min={today}
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-800/10"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-800">
            Heure
          </label>
          <select
            required
            value={form.time}
            onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-800/10"
          >
            <option value="">Sélectionner une heure</option>
            <optgroup label="Service du midi">
              {timeSlots
                .filter((t) => t >= "12:00" && t <= "14:30")
                .map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
            </optgroup>
            <optgroup label="Service du soir">
              {timeSlots
                .filter((t) => t >= "19:00")
                .map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
            </optgroup>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-800">
            Nombre de personnes
          </label>
          <select
            required
            value={form.guests}
            onChange={(e) =>
              setForm((f) => ({ ...f, guests: e.target.value }))
            }
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-800/10"
          >
            {Array.from({ length: 12 }).map((_, i) => {
              const value = i + 1;
              return (
                <option key={value} value={value}>
                  {value} {value > 1 ? "personnes" : "personne"}
                </option>
              );
            })}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-800">
            Message (optionnel)
          </label>
          <textarea
            rows={4}
            value={form.message}
            onChange={(e) =>
              setForm((f) => ({ ...f, message: e.target.value }))
            }
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-800/10"
            placeholder="Allergies, demande particulière..."
          />
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <button
          type="submit"
          disabled={status === "loading"}
          className="flex w-full items-center justify-center rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {status === "loading"
            ? "Envoi de votre demande..."
            : "Envoyer ma réservation"}
        </button>

        {status === "success" && (
          <p className="text-sm text-emerald-700">
            Votre réservation a bien été envoyée ! Vous recevrez une
            confirmation par email.
          </p>
        )}

        {status === "error" && error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    </form>
  );
}

