import Link from "next/link";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { MenuCategory, MenuItem, Restaurant } from "@/lib/types";
import { Cart } from "@/components/Cart";
import { AddToCartButton } from "@/components/AddToCartButton";

export const dynamic = "force-dynamic";

const RESTAURANT_SLUG = process.env.NEXT_PUBLIC_RESTAURANT_SLUG;

async function fetchRestaurant() {
  if (!RESTAURANT_SLUG) return null;

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

async function fetchMenu(restaurantId: string) {
  const supabase = createSupabaseBrowserClient();

  const [{ data: categories, error: catError }, { data: items, error: itemError }] =
    await Promise.all([
      supabase
        .from("menu_categories")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .order("position", { ascending: true }),
      supabase
        .from("menu_items")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .eq("is_available", true)
        .order("position", { ascending: true }),
    ]);

  if (catError) {
    console.error("Erreur chargement catégories", catError);
  }

  if (itemError) {
    console.error("Erreur chargement plats", itemError);
  }

  return {
    categories: categories ?? [],
    items: items ?? [],
  };
}

function formatPrice(price: number) {
  return `${price.toFixed(2).replace(".", ",")} €`;
}

export default async function MenuPage() {
  const restaurant = await fetchRestaurant();

  if (!restaurant) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-emerald-900 px-4">
        <div className="rounded-2xl bg-white/95 px-8 py-10 text-center shadow-xl">
          <h1 className="mb-4 text-3xl font-semibold text-gray-900">
            Restaurant introuvable
          </h1>
          <p className="text-gray-600">
            Impossible d&apos;afficher la carte pour le moment.
          </p>
          <div className="mt-6">
            <Link
              href="/"
              className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
            >
              ← Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const { categories, items } = await fetchMenu(restaurant.id);

  const itemsByCategory = categories.reduce<Record<string, MenuItem[]>>(
    (acc, category) => {
      acc[category.id] = items.filter(
        (item) => item.category_id === category.id
      );
      return acc;
    },
    {}
  );

  const onlineOrderEnabled = restaurant.online_order_enabled === true;

  return (
    <main className="min-h-screen bg-gray-50 pb-16">
      {onlineOrderEnabled && <Cart />}
      {/* Header avec image de couverture */}
      <header className="relative h-48 w-full overflow-hidden bg-emerald-900">
        {restaurant.cover_image_url && (
          <Image
            src={restaurant.cover_image_url}
            alt={restaurant.name}
            fill
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 flex h-full items-center justify-between px-4 py-6 sm:px-8">
          <div>
            <Link
              href="/"
              className="mb-3 inline-flex items-center text-sm font-medium text-emerald-200 hover:text-emerald-100"
            >
              ← Retour
            </Link>
            <h1 className="text-2xl font-semibold text-white sm:text-3xl">
              {restaurant.name}
            </h1>
            <p className="mt-1 text-sm text-emerald-100 sm:text-base">
              Notre carte
            </p>
          </div>
        </div>
      </header>

      {/* Contenu de la carte */}
      <div className="mx-auto mt-10 max-w-5xl px-4 sm:px-6">
        {categories.length === 0 ? (
          <p className="text-center text-gray-600">
            La carte n&apos;est pas encore disponible.
          </p>
        ) : (
          categories.map((category) => {
            const categoryItems = itemsByCategory[category.id] ?? [];
            if (categoryItems.length === 0) {
              return null;
            }

            return (
              <section key={category.id} className="mb-10">
                <div className="mb-4 border-b border-emerald-100 pb-2">
                  <h2 className="text-2xl font-semibold text-emerald-800">
                    {category.name}
                  </h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {categoryItems.map((item) => (
                    <article
                      key={item.id}
                      className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-100"
                    >
                      {item.image_url && (
                        <div className="relative h-48 w-full overflow-hidden">
                          <Image
                            src={item.image_url}
                            alt={item.name}
                            fill
                            className="object-cover transition duration-500 hover:scale-105"
                          />
                        </div>
                      )}
                      <div className="p-5">
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <h3 className="text-base font-semibold text-gray-900">
                            {item.name}
                          </h3>
                          <span className="text-sm font-bold text-emerald-600">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-500">
                            {item.description}
                          </p>
                        )}
                        {onlineOrderEnabled && (
                          <AddToCartButton
                            item={{
                              id: item.id,
                              name: item.name,
                              price: item.price,
                            }}
                          />
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>
    </main>
  );
}

