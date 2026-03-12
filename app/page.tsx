import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { Event, GalleryImage, Restaurant } from "@/lib/types";
import { NewsletterModal } from "@/components/NewsletterModal";
import { ReservationForm } from "@/components/ReservationForm";
import { Cart } from "@/components/Cart";

export const dynamic = "force-dynamic";

const RESTAURANT_SLUG = process.env.NEXT_PUBLIC_RESTAURANT_SLUG;

async function fetchRestaurant() {
  if (!RESTAURANT_SLUG) {
    return null;
  }

  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", RESTAURANT_SLUG)
    .single();

  if (error) {
    console.error("Erreur chargement restaurant", error);
    return null;
  }

  return data;
}

async function fetchGallery(restaurantId: string) {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("gallery_images")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("position", { ascending: true });

  if (error) {
    console.error("Erreur chargement galerie", error);
    return [];
  }

  return data ?? [];
}

async function fetchEvents(restaurantId: string) {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("event_date", { ascending: true });

  if (error) {
    console.error("Erreur chargement événements", error);
    return [];
  }

  return (data ?? []) as Event[];
}

export async function generateMetadata(): Promise<Metadata> {
  const restaurant = await fetchRestaurant();

  if (!restaurant) {
    return {
      title: "Restaurant introuvable",
      description: "Le restaurant demandé est introuvable.",
    };
  }

  return {
    title: restaurant.seo_title ?? restaurant.name,
    description:
      restaurant.seo_description ??
      `Découvrez ${restaurant.name} et sa carte.`,
  };
}

export default async function Home() {
  const restaurant = await fetchRestaurant();

  if (!restaurant) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-emerald-900 px-4">
        <div className="rounded-2xl bg-white/95 px-8 py-10 text-center shadow-xl">
          <h1 className="mb-4 text-3xl font-semibold text-gray-900">
            Restaurant introuvable
          </h1>
          <p className="text-gray-600">
            Vérifiez la configuration de{" "}
            <span className="font-mono text-sm">
              NEXT_PUBLIC_RESTAURANT_SLUG
            </span>{" "}
            ou réessayez plus tard.
          </p>
        </div>
      </main>
    );
  }

  const gallery = await fetchGallery(restaurant.id);
  const events = await fetchEvents(restaurant.id);

  const heroHasImage = Boolean(restaurant.cover_image_url);

  const heroBackgroundStyle = heroHasImage
    ? {
        backgroundImage: `url(${restaurant.cover_image_url})`,
      }
    : undefined;

  const infoBlocks = [
    {
      label: "Adresse",
      value: restaurant.address,
      icon: (
        <svg
          className="h-6 w-6 text-emerald-600"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M12 21s-6-5.686-6-11a6 6 0 1112 0c0 5.314-6 11-6 11z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="12"
            cy="10"
            r="2.5"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      ),
    },
    {
      label: "Horaires",
      value: restaurant.hours,
      icon: (
        <svg
          className="h-6 w-6 text-emerald-600"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M12 7v5l3 2"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      label: "Téléphone",
      value: restaurant.phone,
      icon: (
        <svg
          className="h-6 w-6 text-emerald-600"
          viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M6.5 4h2l1.5 4-1.5 1a11 11 0 005 5l1-1.5 4 1.5v2a2 2 0 01-2 2A13 13 0 015 6a2 2 0 011.5-2z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      label: "Email",
      value: restaurant.email,
      icon: (
        <svg
          className="h-6 w-6 text-emerald-600"
          viewBox="0 0 24 24"
          fill="none"
        >
          <rect
            x="3.75"
            y="5"
            width="16.5"
            height="14"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M5 7.5L12 12l7-4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
  ].filter((b) => b.value);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* HERO */}
      <section
        className={`relative flex min-h-screen items-center justify-center px-4 py-16 ${
          heroHasImage ? "bg-cover bg-center" : "bg-emerald-900"
        }`}
        style={heroBackgroundStyle}
      >
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center text-center text-white">
          {restaurant.logo_url && (
            <div className="mb-6 h-20 w-20 overflow-hidden rounded-full bg-white/10 ring-2 ring-white/30">
              <Image
                src={restaurant.logo_url}
                alt={restaurant.name}
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            {restaurant.name}
          </h1>

          {restaurant.tagline && (
            <p className="mb-8 text-lg text-white/80 sm:text-xl">
              {restaurant.tagline}
            </p>
          )}

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/menu"
              className="rounded-full border border-white bg-white/10 px-8 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-white hover:text-emerald-900"
            >
              Voir la carte
            </Link>

            {restaurant.phone && (
              <a
                href={`tel:${restaurant.phone}`}
                className="rounded-full bg-emerald-500 px-8 py-3 text-sm font-semibold uppercase tracking-wide text-white shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400"
              >
                Appeler
              </a>
            )}
          </div>
        </div>
      </section>

      {/* INFO BAR */}
      {infoBlocks.length > 0 && (
        <section className="bg-white py-12">
          <div className="mx-auto flex max-w-5xl flex-wrap items-start justify-center gap-8 px-4">
            {infoBlocks.map((block) => (
              <div
                key={block.label}
                className="flex max-w-xs items-start gap-3"
              >
                <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
                  {block.icon}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    {block.label}
                  </p>
                  <p className="mt-1 text-sm text-gray-700 whitespace-pre-line">
                    {block.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ABOUT */}
      {restaurant.about && (
        <section className="bg-gray-50 py-16">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-gray-900">
              À propos
            </h2>
            <p className="text-lg leading-relaxed text-gray-600 whitespace-pre-line">
              {restaurant.about}
            </p>
          </div>
        </section>
      )}

      {/* GALLERY */}
      {gallery.length > 0 && (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="mb-8 text-center text-3xl font-semibold tracking-tight text-gray-900">
              Galerie
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((image) => (
                <div
                  key={image.id}
                  className="group overflow-hidden rounded-xl bg-gray-100 shadow-sm"
                >
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={image.image_url}
                      alt={restaurant.name}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* GOOGLE MAPS */}
      {restaurant.address && (
        <section className="bg-white py-16">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="mb-6 text-center text-3xl font-semibold tracking-tight text-gray-900">
              Nous trouver
            </h2>
            <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
              <iframe
                title="Carte Google Maps"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(
                  restaurant.address,
                )}&output=embed`}
                className="h-[400px] w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>
      )}

      {/* ÉVÉNEMENTS */}
      {events.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-semibold tracking-tight text-gray-900">
                Événements &amp; Soirées
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Découvrez nos prochains rendez-vous gourmands et musicaux.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {events.map((event) => (
                <article
                  key={event.id}
                  className="flex h-full flex-col rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    {new Date(event.event_date).toLocaleDateString("fr-FR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-gray-900">
                    {event.title}
                  </h3>
                  {event.description && (
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-600">
                      {event.description}
                    </p>
                  )}
                  {event.show_button && event.button_label && (
                    <div className="mt-4">
                      <button className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-500">
                        {event.button_label}
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* RÉSERVATION */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-gray-900">
              Réserver une table
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Réservez en ligne, nous confirmerons votre demande dans les plus
              brefs délais.
            </p>
          </div>

          <ReservationForm />
        </div>
      </section>

      {/* AVIS CLIENTS */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-gray-900">
              Ce que disent nos clients
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Des expériences partagées autour de la table.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                text: "Une cuisine exceptionnelle, service impeccable. Je recommande vivement !",
                author: "Marie L.",
              },
              {
                text: "Cadre magnifique et plats savoureux. Notre table préférée à Nancy !",
                author: "Thomas B.",
              },
              {
                text: "Accueil chaleureux et menu varié. Nous reviendrons !",
                author: "Sophie M.",
              },
            ].map((review) => (
              <article
                key={review.author}
                className="flex h-full flex-col rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
              >
                <div className="mb-3 flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className="h-4 w-4 fill-current"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 3.25l2.52 4.88 5.38.78-3.9 3.8.92 5.37L12 15.98l-4.82 2.53.92-5.37-3.9-3.8 5.38-.78L12 3.25z" />
                    </svg>
                  ))}
                </div>
                <p className="flex-1 text-sm leading-relaxed text-gray-700">
                  “{review.text}”
                </p>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-900">
                    {review.author}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white">
                    Google
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:text-left">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-400">
              {restaurant.name}
            </p>
            {restaurant.address && (
              <p className="mt-1 text-sm text-gray-400">{restaurant.address}</p>
            )}
          </div>

          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="flex items-center gap-3">
              {restaurant.facebook_url && (
                <a
                  href={restaurant.facebook_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-400 transition hover:text-white"
                  aria-label="Facebook"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M13.5 22v-7h2.25a.75.75 0 00.74-.63l.38-2.5a.75.75 0 00-.74-.87H13.5V9.25A1.25 1.25 0 0114.75 8h1.25a.75.75 0 00.75-.75V4.5a.75.75 0 00-.75-.75H14a4.75 4.75 0 00-4.75 4.75v2.5H7.75a.75.75 0 00-.75.75v2.5c0 .414.336.75.75.75h1.5v7h4.25z" />
                  </svg>
                </a>
              )}
              {restaurant.instagram_url && (
                <a
                  href={restaurant.instagram_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-400 transition hover:text-white"
                  aria-label="Instagram"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <rect
                      x="3.5"
                      y="3.5"
                      width="17"
                      height="17"
                      rx="5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <circle cx="17" cy="7" r="1" fill="currentColor" />
                  </svg>
                </a>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <Link
                href="/menu"
                className="font-medium text-emerald-400 transition hover:text-emerald-300"
              >
                Voir la carte
              </Link>
              <span className="h-4 w-px bg-gray-700" />
              <Link
                href="/mentions-legales"
                className="text-gray-400 transition hover:text-gray-200"
              >
                Mentions légales
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <NewsletterModal />
      {restaurant.online_order_enabled && <Cart />}
    </main>
  );
}
