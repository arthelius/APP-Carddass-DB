import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { OwnedCard, Rarity, Variant } from "../types";

const BP_RARITY: Record<Rarity, number> = {
  Commun: 100,
  Uncommon: 300,
  Prism: 800,
  "Peel-off": 2000,
  "Ultra-Rare": 5000,
  Gold: 10000,
};

const BP_VARIANT: Record<Variant, number> = { Normale: 1, Prisme: 1.5, Laser: 2 };

function cardBP(card: { rarity: Rarity; variant: Variant }): number {
  return Math.round(BP_RARITY[card.rarity] * BP_VARIANT[card.variant]);
}

type Boss = {
  id: string;
  name: string;
  emoji: string;
  bp: number;
  reward: number;
  art: string;
  flavor: string;
};

const BOSSES: Boss[] = [
  { id: "willow", name: "Dr. Willow", emoji: "🧪", bp: 500, reward: 80, art: "from-violet-500 to-slate-800", flavor: "La science prime sur tout." },
  { id: "garlic", name: "Garlic Jr.", emoji: "🧿", bp: 800, reward: 100, art: "from-purple-500 to-indigo-900", flavor: "La Dead Zone vous engloutira !" },
  { id: "turles", name: "Turles", emoji: "🌳", bp: 1200, reward: 120, art: "from-teal-600 to-stone-900", flavor: "L'arbre de puissance !" },
  { id: "lord-slug", name: "Lord Slug", emoji: "👹", bp: 1600, reward: 150, art: "from-green-700 to-slate-900", flavor: "Je vais purger cet univers." },
  { id: "cooler", name: "Cooler", emoji: "❄️", bp: 2000, reward: 180, art: "from-violet-600 to-purple-950", flavor: "Freezer n'etait qu'un prealable." },
  { id: "metal-cooler", name: "Metal Cooler", emoji: "🤖", bp: 2500, reward: 220, art: "from-zinc-500 to-slate-900", flavor: "Big Gete Star, activation." },
  { id: "freezer", name: "Freezer (forme finale)", emoji: "🧊", bp: 3000, reward: 300, art: "from-fuchsia-500 to-purple-800", flavor: "Tu n'es qu'un insecte." },
  { id: "freezer-100", name: "Freezer 100%", emoji: "💥", bp: 3500, reward: 350, art: "from-fuchsia-600 to-purple-900", flavor: "Voici ma vraie puissance !" },
  { id: "android-13", name: "Android 13", emoji: "🔴", bp: 4000, reward: 400, art: "from-red-600 to-slate-900", flavor: "Les humains sont obsolete." },
  { id: "android-14-15", name: "Android 14 & 15", emoji: "🤖", bp: 4500, reward: 450, art: "from-zinc-600 to-slate-900", flavor: "Suppression de la cible." },
  { id: "super-13", name: "Super Android 13", emoji: "🔋", bp: 5000, reward: 500, art: "from-red-700 to-blue-900", flavor: "Fusion... accomplie !" },
  { id: "broly", name: "Broly Legendaire", emoji: "💪", bp: 6000, reward: 600, art: "from-emerald-500 to-teal-900", flavor: "Kakarot !!" },
  { id: "bojack", name: "Bojack", emoji: "🏴‍☠️", bp: 7000, reward: 700, art: "from-blue-500 to-red-800", flavor: "La galaxie m'appartient !" },
  { id: "zangya", name: "Zangya", emoji: "🗡️", bp: 7500, reward: 750, art: "from-orange-500 to-rose-900", flavor: "Tu ne fais pas le poids." },
  { id: "bido", name: "Bido & Bujin", emoji: "🥷", bp: 8000, reward: 800, art: "from-amber-600 to-stone-900", flavor: "Le piege se referme." },
  { id: "gokua", name: "Gokua", emoji: "⚔️", bp: 8500, reward: 850, art: "from-cyan-600 to-slate-900", flavor: "Tu es trop lent." },
  { id: "cell", name: "Cell Perfect", emoji: "🪲", bp: 9000, reward: 900, art: "from-lime-500 to-green-900", flavor: "Je suis parfait." },
  { id: "cell-jr", name: "Cell Juniors", emoji: "🔵", bp: 9500, reward: 950, art: "from-cyan-500 to-blue-900", flavor: "Attaque en meute !" },
  { id: "hatchiyack", name: "Hatchiyack", emoji: "👾", bp: 10000, reward: 1000, art: "from-lime-400 to-teal-900", flavor: "Vengeance des Tsufuls !" },
  { id: "janemba", name: "Janemba", emoji: "👹", bp: 11000, reward: 1100, art: "from-fuchsia-500 to-yellow-700", flavor: "Le royaume des ombres." },
  { id: "janemba-final", name: "Janemba Super", emoji: "😈", bp: 12000, reward: 1200, art: "from-fuchsia-600 to-purple-900", flavor: "Dimension... detruite !" },
  { id: "tapion", name: "Tapion (Hirudegarn)", emoji: "🦂", bp: 13000, reward: 1300, art: "from-stone-500 to-red-950", flavor: "Le moniteur se reveille !" },
  { id: "hirudegarn", name: "Hirudegarn", emoji: "🐉", bp: 14000, reward: 1400, art: "from-stone-600 to-red-950", flavor: "Rugissement infernal !" },
  { id: "buu", name: "Majin Buu", emoji: "🍬", bp: 15000, reward: 1500, art: "from-pink-400 to-rose-700", flavor: "Tu veux un bonbon ?" },
  { id: "super-buu", name: "Super Buu", emoji: "😤", bp: 16000, reward: 1600, art: "from-pink-500 to-purple-900", flavor: "Je vais t'absorber !" },
  { id: "kid-buu", name: "Kid Buu", emoji: "😈", bp: 18000, reward: 1800, art: "from-rose-500 to-purple-900", flavor: "Buu va tout detruire !" },
  { id: "baby", name: "Baby Vegeta", emoji: "🤖", bp: 20000, reward: 2000, art: "from-blue-600 to-slate-900", flavor: "Les Saiyans seront extermines !" },
  { id: "super-17", name: "Super 17", emoji: "🔫", bp: 22000, reward: 2200, art: "from-zinc-500 to-slate-900", flavor: "Barriere android !" },
  { id: "omega-shenron", name: "Omega Shenron", emoji: "🐲", bp: 25000, reward: 2500, art: "from-cyan-600 to-blue-950", flavor: "L'energie negative !" },
  { id: "beerus", name: "Beerus le Hakaishin", emoji: "🐱", bp: 30000, reward: 3000, art: "from-violet-700 to-slate-900", flavor: "Je pourrais detruire cette planete." },
  { id: "champa", name: "Champa", emoji: "🐈", bp: 32000, reward: 3200, art: "from-violet-500 to-yellow-900", flavor: "La nourriture avant tout !" },
  { id: "zamasu", name: "Zamasu Fusionne", emoji: "⚖️", bp: 35000, reward: 3500, art: "from-emerald-600 to-slate-950", flavor: "La justice divine !" },
];

function artGradient(art: string, angle = "135deg") {
  const PALETTE: Record<string, string> = {
    black: "#000000", white: "#ffffff",
    "amber-300": "#fcd34d", "amber-500": "#f59e0b", "amber-600": "#d97706", "amber-700": "#b45309", "amber-900": "#78350f",
    "blue-500": "#3b82f6", "blue-700": "#1d4ed8", "blue-800": "#1e40af", "blue-900": "#1e3a8a",
    "cyan-400": "#22d3ee", "cyan-500": "#06b6d4",
    "emerald-500": "#10b981", "emerald-600": "#059669", "emerald-800": "#065f46", "emerald-900": "#064e3b",
    "fuchsia-500": "#d946ef",
    "green-500": "#22c55e", "green-600": "#16a34a", "green-900": "#14532d",
    "indigo-500": "#6366f1", "indigo-900": "#312e81",
    "lime-500": "#84cc16",
    "orange-500": "#f97316", "orange-600": "#ea580c", "orange-700": "#c2410c",
    "pink-400": "#f472b6",
    "purple-500": "#a855f7", "purple-600": "#9333ea", "purple-700": "#7e22ce", "purple-800": "#6b21a8", "purple-900": "#581c87", "purple-950": "#3b0764",
    "red-500": "#ef4444", "red-600": "#dc2626", "red-700": "#b91c1c", "red-800": "#991b1b", "red-900": "#7f1d1d", "red-950": "#450a0a",
    "rose-500": "#f43f5e", "rose-700": "#be123c", "rose-950": "#4c0519",
    "sky-400": "#38bdf8", "sky-600": "#0284c7", "sky-700": "#0369a1",
    "slate-600": "#475569", "slate-700": "#334155", "slate-800": "#1e293b", "slate-900": "#0f172a",
    "stone-800": "#292524", "stone-900": "#1c1917",
    "teal-500": "#14b8a6", "teal-900": "#134e4a",
    "violet-500": "#8b5cf6", "violet-700": "#6d28d9", "violet-900": "#4c1d95",
    "yellow-400": "#facc15", "yellow-500": "#eab308",
    "zinc-500": "#71717a",
  };
  const stops = art.split(" ").map((tok) => {
    const name = tok.replace(/^(from|via|to)-/, "");
    return PALETTE[name] || "#334155";
  });
  return `linear-gradient(${angle}, ${stops.join(", ")})`;
}

type DuelProps = {
  collection: OwnedCard[];
  zenis: number;
  onWin: (reward: number) => void;
  onLose: (cost: number) => void;
  playSound: (type: string) => void;
  playerLevel: number;
};

type Phase = "select" | "battle" | "result";

export default function Duel({ collection, zenis, onWin, onLose, playSound, playerLevel }: DuelProps) {
  const [selectedCards, setSelectedCards] = useState<OwnedCard[]>([]);
  const [boss, setBoss] = useState<Boss | null>(null);
  const [phase, setPhase] = useState<Phase>("select");
  const [result, setResult] = useState<"win" | "lose" | null>(null);
  const [battleLog, setBattleLog] = useState<string[]>([]);

  const DUEL_COST = 50;

  // BP cap augmente avec le niveau: 1000 + (level-1) * 500
  const bpCap = 1000 + (playerLevel - 1) * 500;

  const toggleCard = (card: OwnedCard) => {
    if (selectedCards.find((c) => c.id === card.id && c.series === card.series && c.rarity === card.rarity && c.variant === card.variant)) {
      setSelectedCards(selectedCards.filter((c) => !(c.id === card.id && c.series === card.series && c.rarity === card.rarity && c.variant === card.variant)));
    } else if (selectedCards.length < 3) {
      setSelectedCards([...selectedCards, card]);
    }
  };

  const rawBP = selectedCards.reduce((sum, c) => sum + cardBP(c), 0);
  const teamBP = Math.min(rawBP, bpCap);
  const bpCapped = rawBP > bpCap;

  const startBattle = (b: Boss) => {
    if (zenis < DUEL_COST) return;
    if (selectedCards.length !== 3) return;
    setBoss(b);
    setPhase("battle");
    setResult(null);
    setBattleLog([]);

    onLose(DUEL_COST);
    playSound("katchunk");

    const totalBP = teamBP;
    const win = totalBP >= b.bp;
    const log: string[] = [];

    setTimeout(() => {
      log.push(`⚔️ ${selectedCards[0].name} engage le combat !`);
      setBattleLog([...log]);
    }, 400);
    setTimeout(() => {
      log.push(`⚡ ${selectedCards[1].name} soutient avec ${selectedCards[1].power} !`);
      setBattleLog([...log]);
    }, 1000);
    setTimeout(() => {
      log.push(`💥 ${selectedCards[2].name} utilise ${selectedCards[2].power} !`);
      setBattleLog([...log]);
    }, 1600);
    setTimeout(() => {
      log.push(`🌟 BP total de l'équipe : ${totalBP}${bpCapped ? ` (plafonné à ${bpCap})` : ""}`);
      log.push(` ${b.emoji} ${b.name} : BP ${b.bp}`);
      setBattleLog([...log]);
    }, 2200);
    setTimeout(() => {
      if (win) {
        log.push(`🏆 VICTOIRE ! Vous remportez ${b.reward} Zenis !`);
        setBattleLog([...log]);
        setResult("win");
        onWin(b.reward);
        playSound("max");
      } else {
        log.push(`💀 DÉFAITE... Votre BP (${totalBP}) ne suffit pas contre ${b.bp}.`);
        setBattleLog([...log]);
        setResult("lose");
        playSound("rare");
      }
    }, 2800);
  };

  const reset = () => {
    setPhase("select");
    setBoss(null);
    setResult(null);
    setBattleLog([]);
    setSelectedCards([]);
  };

  return (
    <div className="flex flex-col gap-4">
      {phase === "select" && (
        <>
          <div className="rounded-xl border border-white/10 bg-black/30 p-4">
            <h2 className="font-heading text-sm tracking-widest text-amber-200">⚔️ DUEL CARDDASS</h2>
            <p className="mt-1 text-xs text-white/60">
              Choisissez 3 cartes pour affronter un boss. Votre BP doit dépasser le sien. Coût : {DUEL_COST} Zenis.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge className="bg-yellow-500/20 text-amber-200">💰 {zenis} Zenis</Badge>
              <Badge className="bg-green-500/20 text-green-200">BP équipe : {teamBP}{bpCapped ? ` / ${bpCap}` : ""}</Badge>
              <Badge className="bg-blue-500/20 text-blue-200">Cartes : {selectedCards.length}/3</Badge>
              <Badge className="bg-purple-500/20 text-purple-200">Niv. {playerLevel} · Plafond BP : {bpCap}</Badge>
            </div>
            {bpCapped && (
              <p className="mt-1 text-[10px] text-amber-300/70">
                ⚠️ BP brut de {rawBP} plafonné à {bpCap}. Montez de niveau pour augmenter la limite !
              </p>
            )}
          </div>

          <div className="rounded-xl border border-white/10 bg-black/30 p-4">
            <h3 className="mb-3 font-heading text-xs tracking-widest text-amber-200">🎯 ADVERSAIRES</h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {BOSSES.map((b) => (
                <div
                  key={b.id}
                  className={`flex items-center gap-3 rounded-lg border p-3 transition ${
                    selectedCards.length === 3 && zenis >= DUEL_COST
                      ? "border-amber-400/50 bg-amber-500/10 hover:scale-105"
                      : "border-white/10 bg-white/5 opacity-60"
                  }`}
                >
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg text-2xl ring-1 ring-white/20"
                    style={{ background: artGradient(b.art) }}
                  >
                    {b.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-white">{b.name}</div>
                    <div className="text-[10px] text-white/50">{b.flavor}</div>
                    <div className="flex gap-2 text-[10px]">
                      <span className="text-red-300">BP {b.bp}</span>
                      <span className="text-amber-300">💰 {b.reward}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    disabled={selectedCards.length !== 3 || zenis < DUEL_COST}
                    onClick={() => startBattle(b)}
                  >
                    Combattre
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/30 p-4">
            <h3 className="mb-3 font-heading text-xs tracking-widest text-amber-200">
              🃏 VOTRE ÉQUIPE ({selectedCards.length}/3)
            </h3>
            {selectedCards.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {selectedCards.map((c, i) => (
                  <div key={i} className="flex items-center gap-1 rounded-lg bg-white/5 px-2 py-1 text-[10px]">
                    <span>{c.emoji}</span>
                    <span className="font-bold">{c.name}</span>
                    <span className="text-amber-300">BP {cardBP(c)}</span>
                    <button onClick={() => toggleCard(c)} className="text-red-400 hover:text-red-300">✕</button>
                  </div>
                ))}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {collection.length === 0 ? (
                <p className="col-span-full py-6 text-center text-white/40">
                  Album vide — ouvrez des packs pour obtenir des cartes !
                </p>
              ) : (
                collection.map((card) => {
                  const isSelected = selectedCards.find((c) => c.id === card.id && c.series === card.series && c.rarity === card.rarity && c.variant === card.variant);
                  return (
                    <button
                      key={`${card.series}|${card.id}|${card.rarity}|${card.variant}`}
                      onClick={() => toggleCard(card)}
                      className={`flex items-center gap-1.5 rounded-lg border p-1.5 text-left transition ${
                        isSelected
                          ? "border-amber-400 bg-amber-500/20"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <span className="text-base">{card.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[10px] font-bold">{card.name}</div>
                        <div className="text-[9px] text-amber-300">BP {cardBP(card)}</div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}

      {phase === "battle" && boss && (
        <div className="rounded-xl border border-amber-400/40 bg-black/40 p-4">
          <div className="mb-4 flex items-center justify-center gap-4">
            <div className="flex flex-col items-center gap-1">
              <div className="flex gap-1">
                {selectedCards.map((c, i) => (
                  <div key={i} className="flex h-12 w-10 items-center justify-center rounded-lg bg-white/5 text-xl ring-1 ring-white/20">
                    {c.emoji}
                  </div>
                ))}
              </div>
              <div className="font-heading text-xs text-green-300">BP {teamBP}</div>
            </div>
            <span className="font-display text-2xl text-yellow-400">VS</span>
            <div className="flex flex-col items-center gap-1">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-lg text-3xl ring-2 ring-red-500/50"
                style={{ background: artGradient(boss.art) }}
              >
                {boss.emoji}
              </div>
              <div className="font-heading text-xs text-red-300">BP {boss.bp}</div>
            </div>
          </div>

          <div className="min-h-32 rounded-lg border border-white/10 bg-black/60 p-3">
            <AnimatePresence>
              {battleLog.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="mb-1 font-body text-xs text-white/80"
                >
                  {line}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {phase === "battle" && !result && (
            <div className="mt-3 flex justify-center">
              <motion.div
                animate={{ x: [-20, 20, -20], rotate: [-5, 5, -5] }}
                transition={{ duration: 0.3, repeat: Infinity }}
                className="text-3xl"
              >
                ⚔️
              </motion.div>
            </div>
          )}

          {result && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={`mt-4 text-center ${result === "win" ? "text-green-400" : "text-red-400"}`}
            >
              <div className="font-display text-2xl tracking-wide">
                {result === "win" ? "VICTOIRE !" : "DÉFAITE"}
              </div>
              <Button className="mt-3" onClick={reset}>
                Retour
              </Button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
