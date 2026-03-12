import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

type CheckoutPayload = {
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
  orderType: "delivery" | "takeaway";
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutPayload;

    const {
      items,
      orderType,
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
    } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Le panier est vide." },
        { status: 400 },
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Configuration Stripe manquante." },
        { status: 500 },
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      line_items: items.map((item) => ({
        price_data: {
          currency: "eur",
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: "payment",
      success_url: `${baseUrl}/commande-confirmee?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/`,
      customer_email: customerEmail,
      metadata: {
        orderType,
        customerName,
        customerPhone,
        deliveryAddress: deliveryAddress || "",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Erreur lors de la création de la session Stripe:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création de la session de paiement." },
      { status: 500 },
    );
  }
}
