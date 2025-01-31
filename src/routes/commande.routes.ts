import { Router, Request, Response } from 'express';
import { sendWhatsAppMessage } from '../services/twilio.service';
import { saveCommande, getCommandes, getCommandeById } from '../services/commande.service';

const router = Router();

interface CommandeRequest {
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

// Créer une nouvelle commande
const nouvelleCommande = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Nouvelle commande reçue:', req.body);
    const commandeData = req.body as CommandeRequest;

    // Validation basique des données
    if (!commandeData.client || !commandeData.commande) {
      console.log('Données invalides:', commandeData);
      res.status(400).json({
        success: false,
        message: 'Données de commande invalides'
      });
      return;
    }

    console.log('Sauvegarde de la commande...');
    // Sauvegarder la commande
    const savedCommande = await saveCommande(commandeData);
    console.log('Commande sauvegardée:', savedCommande);

    console.log('Envoi du message WhatsApp...');
    // Envoi du message WhatsApp
    const result = await sendWhatsAppMessage(commandeData);
    console.log('Résultat WhatsApp:', result);

    res.status(200).json({
      success: true,
      message: 'Commande reçue et message WhatsApp envoyé avec succès',
      commande: savedCommande,
      whatsapp: result
    });
  } catch (error) {
    console.error('Erreur détaillée:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du traitement de la commande',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

// Obtenir toutes les commandes
const getAllCommandes = async (_req: Request, res: Response): Promise<void> => {
  try {
    const commandes = await getCommandes();
    res.status(200).json({
      success: true,
      commandes
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des commandes',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

// Obtenir une commande par ID
const getCommande = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const commande = await getCommandeById(id);

    if (!commande) {
      res.status(404).json({
        success: false,
        message: 'Commande non trouvée'
      });
      return;
    }

    res.status(200).json({
      success: true,
      commande
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la commande:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la commande',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

// Routes
router.post('/nouvelle-commande', nouvelleCommande);
router.get('/commandes', getAllCommandes);
router.get('/commande/:id', getCommande);

export default router;
