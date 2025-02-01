require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const twilio = require("twilio");

const app = express();
app.use(
  cors({
    origin: "*", // Permet à tout domaine de faire des requêtes
  })
);
app.use(bodyParser.json());

const TEST_MODE = process.env.TEST_MODE === "true";

const client = TEST_MODE
  ? null
  : new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Route pour recevoir la commande
app.post("/api/commandes/nouvelle-commande", async (req, res) => {
  try {
    // Récupérer directement les données envoyées par le client
    const { nom, telephone, adresse, commande } = req.body;

    // Si tu veux tester en mode test
    if (TEST_MODE) {
      console.log("\n=== TEST MODE: Messages that would be sent ===");
      console.log("Message to Admin:");
      console.log(`📢 Nouvelle commande reçue :
Nom: ${nom}
Téléphone: ${telephone}
Adresse: ${adresse}
Commande: ${commande}`);

      console.log("\nMessage to Customer:");
      console.log(
        `✅ Bonjour ${nom}, votre commande a été bien reçue ! 📦 Nous vous contacterons bientôt. Merci !`
      );

      res.json({ success: true, message: "Commande reçue en mode test !" });
      return;
    }

    // Message pour l'admin
    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: process.env.ADMIN_WHATSAPP_NUMBER,
      body: `📢 Nouvelle commande reçue :
Nom: ${nom}
Téléphone: ${telephone}
Adresse: ${adresse}
Commande: ${commande}`,
    });

    // Message de confirmation pour le client
    await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: `whatsapp:${telephone}`,
      body: `✅ Bonjour ${nom}, votre commande a été bien reçue ! 📦 Nous vous contacterons bientôt. Merci !`,
    });

    res.json({ success: true, message: "Commande envoyée avec succès !" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'envoi de la commande.",
    });
  }
});

app.listen(5001, () => console.log("Serveur backend démarré sur le port 5001"));
