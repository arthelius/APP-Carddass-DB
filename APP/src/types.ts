export type Rarity = "Commun" | "Uncommon" | "Prism" | "Peel-off" | "Ultra-Rare" | "Gold";
export type Variant = "Normale" | "Prisme" | "Laser";

export type CardDef = {
  id: string;
  name: string;
  emoji: string;
  art: string;
  power: string;
  powerLevel: string;
  layout?: "landscape";
  orientation?: "hori" | "verti" | "carre";
};

export type OwnedCard = CardDef & { rarity: Rarity; variant: Variant; series: string; count: number };
export type OpenedCard = CardDef & { rarity: Rarity; variant: Variant; series: string };

export type Stats = {
  packs: number;
  spent: number;
  earned: number;
  sells: number;
  buys: number;
  wishes: number;
  ballsFound: number;
};

export type QuestState = { date: string; packs: number; sells: number; buys: number; claimed: string[] };
