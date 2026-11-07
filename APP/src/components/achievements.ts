import type { Stats } from "../types";

export type Achievement = {
  id: string;
  name: string;
  desc: string;
  icon: string;
  check: (data: { stats: Stats; collectionCount: number; seriesCompleted: number; ballsFound: number; wishes: number; totalCards: number }) => boolean;
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first-pack", name: "Premier Pack", desc: "Ouvrir votre premier pack", icon: "🎴", check: (d) => d.stats.packs >= 1 },
  { id: "ten-packs", name: "Collectionneur", desc: "Ouvrir 10 packs", icon: "📦", check: (d) => d.stats.packs >= 10 },
  { id: "fifty-packs", name: "Chasseur Assidu", desc: "Ouvrir 50 packs", icon: "🎯", check: (d) => d.stats.packs >= 50 },
  { id: "hundred-packs", name: "Accro du Distrinateur", desc: "Ouvrir 100 packs", icon: "🏆", check: (d) => d.stats.packs >= 100 },
  { id: "sell-10", name: "Marchand", desc: "Vendre 10 doublons", icon: "💰", check: (d) => d.stats.sells >= 10 },
  { id: "sell-50", name: "Commerçant", desc: "Vendre 50 doublons", icon: "🏪", check: (d) => d.stats.sells >= 50 },
  { id: "buy-5", name: "Acheteur", desc: "Acheter 5 cartes au marché", icon: "🛒", check: (d) => d.stats.buys >= 5 },
  { id: "first-wish", name: "Vœu Exaucé", desc: "Invoquer Shenron une fois", icon: "🐉", check: (d) => d.stats.wishes >= 1 },
  { id: "three-wishes", name: "Ami des Dragons", desc: "Invoquer Shenron 3 fois", icon: "🌟", check: (d) => d.stats.wishes >= 3 },
  { id: "ball-hunter", name: "Chasseur de Boules", desc: "Trouver 7 Dragon Balls", icon: "🟠", check: (d) => d.stats.ballsFound >= 7 },
  { id: "all-balls", name: "L'Appel des Dieux", desc: "Réunir les 7 boules simultanément", icon: "✨", check: (d) => d.ballsFound >= 7 },
  { id: "quarter-collection", name: "Un Bon Début", desc: "Compléter 25% de la collection", icon: "📈", check: (d) => d.collectionCount / d.totalCards >= 0.25 },
  { id: "half-collection", name: "Moitié Chemin", desc: "Compléter 50% de la collection", icon: "⚔️", check: (d) => d.collectionCount / d.totalCards >= 0.5 },
  { id: "three-quarters", name: "Expert Carddass", desc: "Compléter 75% de la collection", icon: "🎖️", check: (d) => d.collectionCount / d.totalCards >= 0.75 },
  { id: "full-collection", name: "MAÎTRE CARDDASS", desc: "Compléter 100% de la collection", icon: "👑", check: (d) => d.collectionCount >= d.totalCards },
  { id: "one-series", name: "Spécialiste", desc: "Compléter une série entière", icon: "📖", check: (d) => d.seriesCompleted >= 1 },
  { id: "three-series", name: "Polyvalent", desc: "Compléter 3 séries", icon: "📚", check: (d) => d.seriesCompleted >= 3 },
  { id: "rich", name: "Fortune", desc: "Accumuler 5000 Zenis", icon: "💎", check: (d) => d.stats.earned >= 5000 },
  { id: "max-card", name: "Carte Légendaire", desc: "Obtenir une carte MAX", icon: "⚡", check: (d) => d.collectionCount > 0 },
];
