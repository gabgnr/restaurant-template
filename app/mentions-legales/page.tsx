import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { Restaurant } from "@/lib/types";

export const dynamic = "force-dynamic";

const RESTAURANT_SLUG = process.env.NEXT_PUBLIC_RESTAURANT_SLUG;

async function fetchRestaurant() {
  if (!RESTAURANT_SLUG) {
    return null;
  }

  const supabase = createSupabaseBrowserClient();

  const { data } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", RESTAURANT_SLUG)
    .single<Restaurant>();

  return data;
}

export default async function MentionsLegalesPage() {
  const restaurant = await fetchRestaurant();

  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <div className="mx-auto max-w-3xl px-4">
        <h1 className="mb-8 text-3xl font-semibold tracking-tight text-gray-900">
          Mentions légales
        </h1>

        <section className="mb-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Éditeur du site
          </h2>
          <div className="mt-3 text-sm text-gray-700">
            <p className="font-semibold">
              {restaurant?.name ?? "Nom du restaurant"}
            </p>
            {restaurant?.address && <p>{restaurant.address}</p>}
            {restaurant?.phone && <p>Tél. : {restaurant.phone}</p>}
            {restaurant?.email && <p>Email : {restaurant.email}</p>}
          </div>
        </section>

        <section className="mb-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Hébergeur</h2>
          <div className="mt-3 text-sm text-gray-700">
            <p className="font-semibold">Vercel Inc.</p>
            <p>340 Pine Street</p>
            <p>San Francisco, CA 94104</p>
            <p>États-Unis</p>
            <p className="mt-1">
              Site :{" "}
              <a
                href="https://vercel.com"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-700 underline underline-offset-2"
              >
                vercel.com
              </a>
            </p>
          </div>
        </section>

        <section className="mb-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Propriété intellectuelle
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-700">
            L&apos;ensemble des contenus présents sur ce site (textes, images,
            photographies, logos, marques, etc.) est protégé par le droit de la
            propriété intellectuelle. Toute reproduction, représentation,
            modification ou exploitation, totale ou partielle, sans
            l&apos;autorisation écrite préalable de l&apos;éditeur est
            strictement interdite.
          </p>
        </section>

        <section className="mb-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Données personnelles
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-700">
            Conformément au Règlement Général sur la Protection des Données
            (RGPD), les informations recueillies via les formulaires du site
            sont destinées exclusivement à l&apos;usage de{" "}
            {restaurant?.name ?? "notre établissement"}. Elles ne sont en aucun
            cas transmises à des tiers sans votre consentement.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-gray-700">
            Vous disposez d&apos;un droit d&apos;accès, de rectification, de
            suppression et d&apos;opposition aux données vous concernant. Pour
            exercer ces droits, vous pouvez nous contacter à l&apos;adresse
            suivante :{" "}
            {restaurant?.email ? (
              <a
                href={`mailto:${restaurant.email}`}
                className="text-emerald-700 underline underline-offset-2"
              >
                {restaurant.email}
              </a>
            ) : (
              "adresse e-mail de contact"
            )}
            .
          </p>
        </section>

        <p className="mt-6 text-xs text-gray-500">
          Ces mentions légales sont fournies à titre indicatif et doivent être
          adaptées en fonction de la situation juridique réelle de
          l&apos;établissement.
        </p>
      </div>
    </main>
  );
}

