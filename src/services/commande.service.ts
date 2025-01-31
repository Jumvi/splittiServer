import fs from 'fs';
import path from 'path';

const dataDir = path.join(__dirname, '../data');
const commandesFile = path.join(dataDir, 'commandes.json');

// Créer le répertoire data s'il n'existe pas
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Créer le fichier commandes.json s'il n'existe pas
if (!fs.existsSync(commandesFile)) {
  fs.writeFileSync(commandesFile, '[]', 'utf8');
}

interface Commande {
  id: string;
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

export const saveCommande = async (commande: Omit<Commande, 'id'>): Promise<Commande> => {
  try {
    console.log('Début de la sauvegarde de la commande');
    
    // Lire le fichier existant
    let commandes: Commande[] = [];
    try {
      const data = await fs.promises.readFile(commandesFile, 'utf8');
      commandes = JSON.parse(data);
      console.log('Fichier de commandes lu avec succès');
    } catch (error) {
      console.log('Erreur lors de la lecture du fichier, création d\'un nouveau tableau');
      commandes = [];
    }

    // Créer une nouvelle commande avec ID
    const nouvelleCommande: Commande = {
      ...commande,
      id: `CMD${Date.now()}${Math.floor(Math.random() * 1000)}`
    };
    console.log('Nouvelle commande créée avec ID:', nouvelleCommande.id);

    // Ajouter la nouvelle commande
    commandes.push(nouvelleCommande);

    // Sauvegarder dans le fichier
    await fs.promises.writeFile(commandesFile, JSON.stringify(commandes, null, 2));
    console.log('Commande sauvegardée avec succès');

    return nouvelleCommande;
  } catch (error) {
    console.error('Erreur détaillée lors de la sauvegarde de la commande:', error);
    throw new Error(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde de la commande');
  }
};

export const getCommandes = async (): Promise<Commande[]> => {
  try {
    if (!fs.existsSync(commandesFile)) {
      return [];
    }
    const data = await fs.promises.readFile(commandesFile, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    throw error;
  }
};

export const getCommandeById = async (id: string): Promise<Commande | null> => {
  try {
    const commandes = await getCommandes();
    return commandes.find(c => c.id === id) || null;
  } catch (error) {
    console.error('Erreur lors de la récupération de la commande:', error);
    throw error;
  }
};
