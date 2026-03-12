import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import nodemailer from "nodemailer";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Signature manquante" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("Erreur de vérification webhook:", err);
    return NextResponse.json(
      { error: "Signature invalide" },
      { status: 400 },
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    try {
      const sessionWithLineItems = await stripe.checkout.sessions.retrieve(
        session.id,
        {
          expand: ["line_items"],
        },
      );

      const lineItems = sessionWithLineItems.line_items?.data || [];
      const metadata = session.metadata || {};

      const items = lineItems.map((item) => ({
        name: item.description || item.price?.product as string,
        price: (item.price?.unit_amount || 0) / 100,
        quantity: item.quantity || 0,
      }));

      const totalAmount = lineItems.reduce(
        (sum, item) => sum + ((item.price?.unit_amount || 0) * (item.quantity || 0)),
        0,
      ) / 100;

      const restaurantSlug = process.env.NEXT_PUBLIC_RESTAURANT_SLUG;
      if (!restaurantSlug) {
        throw new Error("NEXT_PUBLIC_RESTAURANT_SLUG non défini");
      }

      const supabase = createSupabaseBrowserClient();
      const { data: restaurant } = await supabase
        .from("restaurants")
        .select("id, name")
        .eq("slug", restaurantSlug)
        .single();

      if (!restaurant) {
        throw new Error("Restaurant introuvable");
      }

      const { error: insertError } = await supabase.from("orders").insert({
        restaurant_id: restaurant.id,
        customer_name: metadata.customerName || "",
        customer_email: session.customer_email || "",
        customer_phone: metadata.customerPhone || "",
        order_type: metadata.orderType || "takeaway",
        delivery_address: metadata.deliveryAddress || null,
        items: items,
        total_amount: Math.round(totalAmount * 100),
        stripe_session_id: session.id,
        status: "pending",
      });

      if (insertError) {
        console.error("Erreur insertion commande:", insertError);
        throw insertError;
      }

      const restaurantName = restaurant.name;
      const customerEmail = session.customer_email || metadata.customerEmail || "";

      if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        await Promise.all([
          transporter.sendMail({
            from: `"Commandes" <${process.env.GMAIL_USER}>`,
            to: process.env.GMAIL_USER,
            subject: `🍽️ Nouvelle commande — ${metadata.customerName || "Client"}, ${totalAmount.toFixed(2)} €`,
            text: [
              "Nouvelle commande reçue :",
              "",
              `Client : ${metadata.customerName || "N/A"}`,
              `Email : ${customerEmail}`,
              `Téléphone : ${metadata.customerPhone || "N/A"}`,
              `Type : ${metadata.orderType === "delivery" ? "Livraison" : "À emporter"}`,
              metadata.orderType === "delivery" && metadata.deliveryAddress
                ? `Adresse : ${metadata.deliveryAddress}`
                : "",
              "",
              "Articles :",
              ...items.map(
                (item) => `  • ${item.name} x${item.quantity} — ${item.price.toFixed(2)} €`,
              ),
              "",
              `Total : ${totalAmount.toFixed(2)} €`,
              "",
              `Session Stripe : ${session.id}`,
            ]
              .filter(Boolean)
              .join("\n"),
          }),
          transporter.sendMail({
            from: `"${restaurantName}" <${process.env.GMAIL_USER}>`,
            to: customerEmail,
            subject: `Votre commande est confirmée — ${restaurantName}`,
            text: [
              `Bonjour ${metadata.customerName || "Cher client"},`,
              "",
              `Nous vous remercions pour votre commande à ${restaurantName}.`,
              "",
              "Récapitulatif de votre commande :",
              ...items.map(
                (item) => `  • ${item.name} x${item.quantity} — ${item.price.toFixed(2)} €`,
              ),
              "",
              `Total : ${totalAmount.toFixed(2)} €`,
              "",
              `Type : ${metadata.orderType === "delivery" ? "Livraison" : "À emporter"}`,
              metadata.orderType === "delivery" && metadata.deliveryAddress
                ? `Adresse de livraison : ${metadata.deliveryAddress}`
                : "",
              "",
              "Votre commande est en cours de préparation. Nous vous contacterons dès qu'elle sera prête.",
              "",
              "Au plaisir de vous servir,",
              restaurantName,
            ]
              .filter(Boolean)
              .join("\n"),
          }),
        ]);
      }
    } catch (error) {
      console.error("Erreur traitement webhook:", error);
      return NextResponse.json(
        { error: "Erreur traitement commande" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ received: true });
}
