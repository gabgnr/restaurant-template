"use client";

import { useState } from "react";

type MenuItem = {
  id: string;
  name: string;
  price: number;
};

const STORAGE_KEY = "restaurant-cart";

export function AddToCartButton({ item }: { item: MenuItem }) {
  const [added, setAdded] = useState(false);

  const addToCart = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const existingItems = stored ? JSON.parse(stored) : [];

    const existingIndex = existingItems.findIndex(
      (i: MenuItem) => i.id === item.id,
    );

    if (existingIndex >= 0) {
      existingItems[existingIndex].quantity += 1;
    } else {
      existingItems.push({ ...item, quantity: 1 });
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(existingItems));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);

    window.dispatchEvent(new Event("cart-updated"));
  };

  return (
    <button
      onClick={addToCart}
      className={`mt-3 w-full rounded-lg px-4 py-2 text-sm font-medium transition ${
        added
          ? "bg-emerald-500 text-white"
          : "bg-emerald-600 text-white hover:bg-emerald-500"
      }`}
    >
      {added ? "✓ Ajouté !" : "Ajouter au panier"}
    </button>
  );
}
