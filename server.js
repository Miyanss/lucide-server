require("dotenv").config();

const express = require("express");
const Stripe = require("stripe");

const app = express();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.use(express.json());

// Test simple pour vérifier que le serveur fonctionne
app.get("/", (req, res) => {
  res.send("🚀 Serveur Lucide fonctionne !");
});

// Webhook Stripe
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  (req, res) => {
    console.log("📩 Webhook Stripe reçu");

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        req.headers["stripe-signature"],
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      console.error("❌ Webhook invalide :", error.message);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    console.log("✅ Événement :", event.type);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      console.log("💰 Paiement reçu !");
      console.log("Session :", session.id);
      console.log("Client :", session.customer);
    }

    res.json({ received: true });
  }
);

const PORT = process.env.PORT || 4242;

app.listen(PORT, () => {
  console.log(`🚀 Lucide fonctionne sur http://localhost:${PORT}`);
});