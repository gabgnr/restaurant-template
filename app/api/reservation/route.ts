import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

type ReservationPayload = {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  message?: string;
};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ReservationPayload;

    const { name, email, phone, date, time, guests, message } = body;

    if (!name || !email || !phone || !date || !time || !guests) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants." },
        { status: 400 },
      );
    }

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return NextResponse.json(
        {
          error:
            "Configuration email manquante. Veuillez définir GMAIL_USER et GMAIL_APP_PASSWORD.",
        },
        { status: 500 },
      );
    }

    const restaurantName = process.env.NEXT_PUBLIC_RESTAURANT_NAME || "Le restaurant";

    // Email to restaurant
    const restaurantSubject = `🍽️ Nouvelle réservation — ${name}, ${guests} ${
      guests > 1 ? "personnes" : "personne"
    } le ${date} à ${time}`;

    const restaurantText = [
      "Vous avez reçu une nouvelle demande de réservation :",
      "",
      `Nom : ${name}`,
      `Email : ${email}`,
      `Téléphone : ${phone}`,
      `Date : ${date}`,
      `Heure : ${time}`,
      `Nombre de personnes : ${guests}`,
      "",
      "Message du client :",
      message?.trim() || "Aucun message",
      "",
      "Merci de confirmer la réservation auprès du client.",
    ].join("\n");

    // Email to client
    const clientSubject = `Votre réservation est confirmée — ${restaurantName}`;

    const clientText = [
      `Bonjour ${name},`,
      "",
      `Nous vous remercions pour votre réservation à ${restaurantName}.`,
      "",
      "Récapitulatif de votre demande :",
      `• Date : ${date}`,
      `• Heure : ${time}`,
      `• Nombre de personnes : ${guests}`,
      "",
      "Nous vous confirmerons votre réservation dans les plus brefs délais. ",
      "Si vous avez la moindre question ou si vous souhaitez modifier votre réservation, ",
      "n'hésitez pas à nous contacter par téléphone ou par email.",
      "",
      "Au plaisir de vous accueillir très prochainement,",
      `${restaurantName}`,
    ].join("\n");

    await Promise.all([
      transporter.sendMail({
        from: `"Réservations" <${process.env.GMAIL_USER}>`,
        to: process.env.GMAIL_USER,
        subject: restaurantSubject,
        text: restaurantText,
      }),
      transporter.sendMail({
        from: `"${restaurantName}" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: clientSubject,
        text: clientText,
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de l'envoi de la réservation:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'envoi de la réservation." },
      { status: 500 },
    );
  }
}

