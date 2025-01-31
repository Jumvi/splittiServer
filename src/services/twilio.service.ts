import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_WHATSAPP_NUMBER;

console.log('Configuration Twilio:');
console.log('Account SID:', accountSid);
console.log('Auth Token:', authToken ? '***' + authToken.slice(-4) : 'Non défini');
console.log('Numéro WhatsApp:', twilioPhoneNumber);

// Vérification des variables d'environnement
if (!accountSid || !accountSid.startsWith('AC')) {
  throw new Error('TWILIO_ACCOUNT_SID invalide. Il doit commencer par "AC"');
}

if (!authToken) {
  throw new Error('TWILIO_AUTH_TOKEN manquant');
}

if (!twilioPhoneNumber) {
  throw new Error('TWILIO_WHATSAPP_NUMBER manquant');
}

let client: twilio.Twilio;
try {
  client = twilio(accountSid, authToken);
  console.log('Client Twilio initialisé avec succès');
} catch (error) {
  console.error('Erreur lors de l\'initialisation du client Twilio:', error);
  throw error;
}

interface CommandeData {
  client: {
    nom: string;
    prenom: string;
    telephone: string;
    whatsapp: string;
    adresse: string;
    ville: string;
    commune: string;
  };
  commande: {
    description: string;
    mode: string;
    commentaire?: string;
  };
  date: string;
  status: string;
}

export const sendWhatsAppMessage = async (data: CommandeData): Promise<any> => {
  try {
    console.log('Préparation du message WhatsApp pour:', data.client.whatsapp);
    
    const messageBody = `
🛍️ Nouvelle Commande KINTACOS!

👤 Client:
- Nom: ${data.client.nom} ${data.client.prenom}
- Téléphone: ${data.client.telephone}
- Adresse: ${data.client.adresse}, ${data.client.commune}, ${data.client.ville}

📦 Commande:
- Description: ${data.commande.description}
- Mode de livraison: ${data.commande.mode}
${data.commande.commentaire ? `- Commentaire: ${data.commande.commentaire}` : ''}

📅 Date: ${new Date(data.date).toLocaleString()}
📋 Status: ${data.status}

Merci de votre commande! Nous la traiterons dans les plus brefs délais.
    `;

    // Vérifier si le numéro WhatsApp est au bon format
    const toNumber = data.client.whatsapp.startsWith('whatsapp:') 
      ? data.client.whatsapp 
      : `whatsapp:${data.client.whatsapp}`;

    const fromNumber = twilioPhoneNumber.startsWith('whatsapp:')
      ? twilioPhoneNumber
      : `whatsapp:${twilioPhoneNumber}`;

    console.log('Envoi du message WhatsApp:');
    console.log('De:', fromNumber);
    console.log('À:', toNumber);
    console.log('Message:', messageBody);
    
    const message = await client.messages.create({
      body: messageBody,
      from: fromNumber,
      to: toNumber
    });

    console.log('Message WhatsApp envoyé avec succès:', {
      sid: message.sid,
      status: message.status,
      direction: message.direction,
      date: message.dateCreated
    });
    
    return {
      success: true,
      messageId: message.sid,
      status: message.status,
      details: {
        direction: message.direction,
        dateCreated: message.dateCreated
      }
    };
  } catch (error) {
    console.error('Erreur détaillée lors de l\'envoi du message WhatsApp:', {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error
    });
    
    throw new Error(
      error instanceof Error 
        ? `Erreur Twilio: ${error.message}`
        : 'Erreur inconnue lors de l\'envoi du message WhatsApp'
    );
  }
};
