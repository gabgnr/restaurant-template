import Link from "next/link";

export default function CommandeConfirmeePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        <div className="mb-6">
          <svg
            className="mx-auto h-16 w-16 text-emerald-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="mb-4 text-2xl font-semibold text-gray-900">
          Merci pour votre commande !
        </h1>
        <p className="mb-6 text-gray-600">
          Vous recevrez une confirmation par email.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-emerald-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-emerald-500"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
