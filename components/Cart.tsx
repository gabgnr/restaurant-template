"use client";

import { useState, useEffect } from "react";

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

const STORAGE_KEY = "restaurant-cart";

export function Cart() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    orderType: "takeaway" as "delivery" | "takeaway",
    deliveryAddress: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const loadCart = () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch {
        setItems([]);
      }
    }
  };

  useEffect(() => {
    loadCart();
    window.addEventListener("cart-updated", loadCart);
    return () => window.removeEventListener("cart-updated", loadCart);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (!item) return prev;

      const newQuantity = item.quantity + delta;
      if (newQuantity <= 0) {
        return prev.filter((i) => i.id !== id);
      }

      return prev.map((i) =>
        i.id === id ? { ...i, quantity: newQuantity } : i,
      );
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          orderType: form.orderType,
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone,
          deliveryAddress:
            form.orderType === "delivery" ? form.deliveryAddress : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la création de la session de paiement");
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error(error);
      alert("Une erreur est survenue. Veuillez réessayer.");
      setIsLoading(false);
    }
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition hover:bg-emerald-500"
        aria-label="Ouvrir le panier"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        {itemCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {itemCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed right-0 top-0 z-50 h-full w-full max-w-md overflow-y-auto bg-white shadow-xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Panier</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Fermer"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {items.length === 0 ? (
                <p className="text-center text-gray-500">Votre panier est vide.</p>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 rounded-lg border border-gray-200 p-4"
                      >
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-500">
                            {item.price.toFixed(2).replace(".", ",")} €
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="h-8 w-8 rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
                          >
                            −
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="h-8 w-8 rounded border border-gray-300 text-gray-600 hover:bg-gray-50"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="ml-2 text-red-600 hover:text-red-700"
                            aria-label="Retirer"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mb-6 border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>{total.toFixed(2).replace(".", ",")} €</span>
                    </div>
                  </div>

                  <form onSubmit={handleCheckout} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prénom et nom *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Téléphone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type de commande *
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="orderType"
                            value="takeaway"
                            checked={form.orderType === "takeaway"}
                            onChange={(e) =>
                              setForm({ ...form, orderType: e.target.value as "takeaway" })
                            }
                            className="text-emerald-600"
                          />
                          <span className="text-sm">À emporter</span>
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="orderType"
                            value="delivery"
                            checked={form.orderType === "delivery"}
                            onChange={(e) =>
                              setForm({ ...form, orderType: e.target.value as "delivery" })
                            }
                            className="text-emerald-600"
                          />
                          <span className="text-sm">Livraison</span>
                        </label>
                      </div>
                    </div>

                    {form.orderType === "delivery" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Adresse de livraison *
                        </label>
                        <textarea
                          required
                          value={form.deliveryAddress}
                          onChange={(e) =>
                            setForm({ ...form, deliveryAddress: e.target.value })
                          }
                          rows={3}
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full rounded-lg bg-slate-800 px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isLoading
                        ? "Redirection vers le paiement..."
                        : `Payer ${total.toFixed(2).replace(".", ",")} €`}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
