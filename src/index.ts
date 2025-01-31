import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import commandeRoutes from './routes/commande.routes';

// Configuration des variables d'environnement
dotenv.config();

const app = express();

// Middleware pour logger toutes les requêtes
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Middleware pour parser le JSON avec une taille limite augmentée
app.use(express.json({ limit: '10mb' }));

// Middleware CORS
app.use(cors());

// Routes
app.use('/api/commandes', commandeRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Serveur Splitti en ligne!');
});

// Middleware de gestion des erreurs
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Erreur serveur:', {
    message: err.message,
    stack: err.stack,
    status: err.status || 500
  });

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erreur serveur interne',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Port
const PORT = process.env.PORT || 5001;

// Démarrage du serveur
const server = app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`API des commandes disponible sur http://localhost:${PORT}/api/commandes`);
  console.log('Variables d\'environnement chargées:');
  console.log('- PORT:', process.env.PORT);
  console.log('- TWILIO_ACCOUNT_SID:', process.env.TWILIO_ACCOUNT_SID ? '***' + process.env.TWILIO_ACCOUNT_SID.slice(-4) : 'Non défini');
  console.log('- TWILIO_AUTH_TOKEN:', process.env.TWILIO_AUTH_TOKEN ? '***' + process.env.TWILIO_AUTH_TOKEN.slice(-4) : 'Non défini');
  console.log('- TWILIO_WHATSAPP_NUMBER:', process.env.TWILIO_WHATSAPP_NUMBER || 'Non défini');
  console.log('='.repeat(50));
});

// Gestion des erreurs non capturées
process.on('uncaughtException', (error: Error) => {
  console.error('Erreur non capturée:', error);
  // Fermer proprement le serveur
  server.close(() => {
    process.exit(1);
  });
});

process.on('unhandledRejection', (reason: any) => {
  console.error('Promesse rejetée non gérée:', reason);
  // Fermer proprement le serveur
  server.close(() => {
    process.exit(1);
  });
});
