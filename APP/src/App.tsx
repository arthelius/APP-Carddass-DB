import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import PrizmPeel from "@/components/PrizmPeel";
import TitleScreen from "@/components/TitleScreen";
import Duel from "@/components/Duel";
import CapsuleCorp from "@/components/CapsuleCorp";
import { ACHIEVEMENTS } from "@/components/achievements";
import { COLLECTIONS } from "@/collections";
import type { CollectionDef } from "@/collections";

// ---------------------------------------------------------------
// PROTOTYPE — hommage aux CARDDASS Bandai (1989–1997).
// Cartes stylisées : remplacez `art` par vos propres scans.
// ---------------------------------------------------------------

type Rarity = "Commun" | "Uncommon" | "Prism" | "Peel-off" | "Ultra-Rare" | "Gold";
type Variant = "Normale" | "Prisme" | "Laser";

type CardDef = {
  id: string;
  name: string;
  emoji: string;
  art: string;
  power: string;
  powerLevel: string;
  layout?: "landscape";
  orientation?: "hori" | "verti" | "carre";
};

type SeriesDef = CollectionDef;

const VARIANT_ODDS: Record<Variant, number> = { Normale: 80, Prisme: 15, Laser: 5 };
const VARIANT_MULT: Record<Variant, number> = { Normale: 1, Prisme: 2, Laser: 4 };
const VARIANT_RANK: Record<Variant, number> = { Normale: 0, Prisme: 1, Laser: 2 };

const SERIES: SeriesDef[] = COLLECTIONS;

const RARITIES: Record<Rarity, { glow: string; ring: string; badge: string; sell: number; market: number }> = {
  Commun: { glow: "#64748b", ring: "ring-slate-400/40", badge: "bg-slate-500/20 text-slate-200", sell: 10, market: 30 },
  Uncommon: { glow: "#3b82f6", ring: "ring-blue-400/60", badge: "bg-blue-500/20 text-blue-200", sell: 25, market: 80 },
  Prism: { glow: "#a855f7", ring: "ring-purple-400/70", badge: "bg-purple-500/20 text-purple-200", sell: 60, market: 200 },
  "Peel-off": { glow: "#f59e0b", ring: "ring-amber-300/80", badge: "bg-amber-500/20 text-amber-200", sell: 150, market: 500 },
  "Ultra-Rare": { glow: "#fde047", ring: "ring-yellow-300", badge: "bg-yellow-400/30 text-yellow-100", sell: 500, market: 1500 },
  Gold: { glow: "#fbbf24", ring: "ring-amber-400", badge: "bg-gradient-to-r from-amber-500/30 to-yellow-300/30 text-amber-100", sell: 2000, market: 5000 },
};

const RARITY_ORDER: Rarity[] = ["Gold", "Ultra-Rare", "Peel-off", "Prism", "Uncommon", "Commun"];
const BINDER_RARITIES: Rarity[] = ["Commun", "Uncommon", "Prism", "Peel-off", "Ultra-Rare", "Gold"];

// ------------------- DÉGRADÉS (inline CSS, indépendants de Tailwind) ---------
const PALETTE: Record<string, string> = {
  black: "#000000", white: "#ffffff",
  "amber-300": "#fcd34d", "amber-500": "#f59e0b", "amber-600": "#d97706", "amber-700": "#b45309", "amber-900": "#78350f", "amber-950": "#451a03",
  "blue-500": "#3b82f6", "blue-600": "#2563eb", "blue-700": "#1d4ed8", "blue-800": "#1e40af", "blue-900": "#1e3a8a", "blue-950": "#172554",
  "cyan-200": "#a5f3fc", "cyan-400": "#22d3ee", "cyan-500": "#06b6d4", "cyan-600": "#0891b2",
  "emerald-500": "#10b981", "emerald-600": "#059669", "emerald-700": "#047857", "emerald-800": "#065f46", "emerald-900": "#064e3b", "emerald-950": "#022c22",
  "fuchsia-500": "#d946ef",
  "green-500": "#22c55e", "green-600": "#16a34a", "green-900": "#14532d",
  "indigo-500": "#6366f1", "indigo-800": "#3730a3", "indigo-900": "#312e81", "indigo-950": "#1e1b4b",
  "lime-400": "#a3e635", "lime-500": "#84cc16",
  "orange-400": "#fb923c", "orange-500": "#f97316", "orange-600": "#ea580c", "orange-700": "#c2410c",
  "pink-400": "#f472b6", "pink-500": "#ec4899",
  "purple-500": "#a855f7", "purple-600": "#9333ea", "purple-700": "#7e22ce", "purple-800": "#6b21a8", "purple-900": "#581c87", "purple-950": "#3b0764",
  "red-500": "#ef4444", "red-600": "#dc2626", "red-700": "#b91c1c", "red-800": "#991b1b", "red-900": "#7f1d1d", "red-950": "#450a0a",
  "rose-400": "#fb7185", "rose-500": "#f43f5e", "rose-600": "#e11d48", "rose-700": "#be123c", "rose-950": "#4c0519",
  "sky-400": "#38bdf8", "sky-600": "#0284c7", "sky-700": "#0369a1",
  "slate-600": "#475569", "slate-700": "#334155", "slate-800": "#1e293b", "slate-900": "#0f172a", "slate-950": "#020617",
  "stone-500": "#78716c", "stone-800": "#292524", "stone-900": "#1c1917", "stone-950": "#0c0a09",
  "teal-500": "#14b8a6", "teal-600": "#0d9488", "teal-900": "#134e4a",
  "violet-500": "#8b5cf6", "violet-700": "#6d28d9", "violet-900": "#4c1d95", "violet-950": "#2e1065",
  "yellow-400": "#facc15", "yellow-500": "#eab308", "yellow-700": "#a16207",
  "zinc-500": "#71717a",
};

function artGradient(art: string, angle = "135deg") {
  const stops = art.split(" ").map((tok) => {
    const name = tok.replace(/^(from|via|to)-/, "");
    return PALETTE[name] || "#334155";
  });
  return `linear-gradient(${angle}, ${stops.join(", ")})`;
}

// ------------------- THÈMES VISUELS -------------------
type Theme = {
  label: string;
  icon: string;
  bgStyle: string;
  machineArt: string;
  glowColor: string;
  binderArt: string;
  binderBorderColor: string;
};

const THEMES: Record<string, Theme> = {
  nuit: {
    label: "Nuit Saiyan",
    icon: "🌙",
    bgStyle: "radial-gradient(circle at top, #14532d, #020617)",
    machineArt: "from-green-700 via-orange-800 to-amber-950",
    glowColor: "rgba(34,197,94,0.3)",
    binderArt: "from-green-950 via-amber-950 to-black",
    binderBorderColor: "rgba(22,163,74,0.7)",
  },
  namek: {
    label: "Namek",
    icon: "🌿",
    bgStyle: "radial-gradient(circle at top, #15803d, #052e16)",
    machineArt: "from-emerald-600 via-green-800 to-stone-950",
    glowColor: "rgba(34,197,94,0.4)",
    binderArt: "from-emerald-950 via-green-950 to-black",
    binderBorderColor: "rgba(16,185,129,0.7)",
  },
  kame: {
    label: "Kamé House",
    icon: "🐢",
    bgStyle: "radial-gradient(circle at top, #c2410c, #1c0a03)",
    machineArt: "from-orange-500 via-amber-700 to-red-950",
    glowColor: "rgba(249,115,22,0.4)",
    binderArt: "from-orange-950 via-red-950 to-black",
    binderBorderColor: "rgba(249,115,22,0.7)",
  },
  shenron: {
    label: "Shenron",
    icon: "🐉",
    bgStyle: "radial-gradient(circle at top, #16a34a, #02120a)",
    machineArt: "from-green-600 via-emerald-800 to-amber-950",
    glowColor: "rgba(34,197,94,0.45)",
    binderArt: "from-green-950 via-emerald-950 to-black",
    binderBorderColor: "rgba(22,163,74,0.7)",
  },
};

function rollRarity(odds: Record<Rarity, number>): Rarity {
  const total = Object.values(odds).reduce((s, w) => s + w, 0);
  let roll = Math.random() * total;
  for (const name of RARITY_ORDER) {
    roll -= odds[name];
    if (roll < 0) return name;
  }
  return "Commun";
}

function rollVariant(): Variant {
  const total = Object.values(VARIANT_ODDS).reduce((s, w) => s + w, 0);
  let roll = Math.random() * total;
  for (const v of ["Laser", "Prisme", "Normale"] as Variant[]) {
    roll -= VARIANT_ODDS[v];
    if (roll < 0) return v;
  }
  return "Normale";
}

// ------------------- BRUITAGES (Web Audio, synthèse rétro) -------------------
let audioCtx: AudioContext | null = null;
let soundOn = true;

function playSound(type: string) {
  if (!soundOn) return;
  try {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    if (!audioCtx) audioCtx = new AC();
    const ctx = audioCtx;
    const t = ctx.currentTime;
    const beep = (freq: number, dur: number, delay = 0, wave: OscillatorType = "square", gain = 0.06) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = wave;
      o.frequency.value = freq;
      o.connect(g);
      g.connect(ctx.destination);
      g.gain.setValueAtTime(gain, t + delay);
      g.gain.exponentialRampToValueAtTime(0.001, t + delay + dur);
      o.start(t + delay);
      o.stop(t + delay + dur);
    };
    const noise = (dur: number, delay = 0, gain = 0.1) => {
      const len = Math.floor(ctx.sampleRate * dur);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const g = ctx.createGain();
      g.gain.value = gain;
      src.connect(g);
      g.connect(ctx.destination);
      src.start(t + delay);
    };
    if (type === "coin") { beep(1200, 0.07); beep(1600, 0.1, 0.07); }
    if (type === "katchunk") { beep(110, 0.12, 0, "sine", 0.25); noise(0.08, 0.04, 0.15); }
    if (type === "rip") { noise(0.4, 0, 0.14); noise(0.3, 0.15, 0.1); }
    if (type === "rare") { [660, 880, 1100, 1320].forEach((f, i) => beep(f, 0.12, i * 0.09, "triangle", 0.08)); }
    if (type === "max") { [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => beep(f, 0.16, i * 0.1, "triangle", 0.09)); }
    if (type === "shenron") { beep(55, 1.4, 0, "sawtooth", 0.14); beep(82, 1.4, 0.15, "sawtooth", 0.1); noise(1, 0.2, 0.04); }
    if (type === "buy") { beep(880, 0.08, 0, "sine"); beep(1320, 0.12, 0.08, "sine"); }
    if (type === "gold") { [523, 659, 784, 1047, 1319, 1568, 2093].forEach((f, i) => beep(f, 0.18, i * 0.08, "triangle", 0.1)); }
  } catch { /* audio indisponible */ }
}

// ------------------- TYPES -------------------
type OwnedCard = CardDef & { rarity: Rarity; variant: Variant; series: string; count: number };
type OpenedCard = CardDef & { rarity: Rarity; variant: Variant; series: string };
type Stats = { packs: number; spent: number; earned: number; sells: number; buys: number; wishes: number; ballsFound: number; duelsWon: number };
type QuestState = { date: string; packs: number; sells: number; buys: number; claimed: string[] };

const QUESTS = [
  { id: "q1", label: "Ouvrir 3 packs", goal: 3, stat: "packs", reward: 120 },
  { id: "q2", label: "Vendre 5 doublons", goal: 5, stat: "sells", reward: 150 },
  { id: "q3", label: "Acheter 2 cartes au marché", goal: 2, stat: "buys", reward: 100 },
];

const SAVE_KEY = "dbcc-carddass-save-v1";

function seriesOf(id: string) {
  return SERIES.find((s) => s.id === id)!;
}

function key(c: { series: string; id: string; rarity: Rarity; variant: Variant }) {
  return `${c.series}|${c.id}|${c.rarity}|${c.variant}`;
}

// ------------------- PRISM TYPE BY SERIES -------------------
function prismClassForSeries(): string {
  return "soft-prism-overlay";
}

// ------------------- CARTE : DOS -------------------
function CardBack({ card, size = "lg" }: { card: OpenedCard | OwnedCard; size?: "sm" | "md" | "lg" }) {
  const s = seriesOf(card.series);
  const landscape = card.layout === "landscape";
  const dims =
    size === "lg"
      ? landscape ? "h-56 w-80" : "h-80 w-56"
      : size === "sm"
      ? landscape ? "h-28 w-40" : "h-32 w-[5.5rem]"
      : landscape ? "h-32 w-48" : "h-44 w-32";
  const isImgBack = s.cardBack?.startsWith("img:");

  return (
    <div
      className={`relative ${dims} shrink-0 overflow-hidden rounded-xl ring-2 ring-amber-600/40 card-beveled`}
      style={
        isImgBack
          ? { backgroundImage: `url('${s.cardBack!.slice(4)}')`, backgroundSize: "cover", backgroundPosition: "center" }
          : { background: artGradient(s.art) }
      }
    >
      <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/60" />
      <div className="absolute left-1 top-1 rounded bg-black/60 px-1 text-[8px] font-black tracking-wider text-amber-200/80">
        {s.short}
      </div>
      <div className="flex h-full flex-col items-center justify-center gap-1.5 px-2 text-center">
        <div className="text-3xl opacity-60">{s.universeIcon}</div>
        <div className="font-heading text-[9px] tracking-widest text-white/50">{s.short}</div>
        <div className="text-[8px] text-white/40">{s.years}</div>
        {/* Jan-Ken symbols */}
        <div className="mt-1 flex gap-2 text-lg">
          <span title="Pierre" className="opacity-50">✊</span>
          <span title="Papier" className="opacity-50">✋</span>
          <span title="Ciseaux" className="opacity-50">✌️</span>
        </div>
        {/* Power gauge */}
        <div className="mt-1 w-3/4">
          <div className="text-[7px] text-white/40">FORCE</div>
          <div className="h-1.5 overflow-hidden rounded-full bg-black/60">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(100, (RARITIES[card.rarity].sell / 500) * 100)}%`,
                background: "linear-gradient(to right, #16a34a, #f97316, #fcd34d)",
              }}
            />
          </div>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-black/70 p-1.5">
        <div className="truncate text-[8px] text-amber-200/60">{card.name}</div>
        <div className="truncate text-[7px] text-white/40">{s.name}</div>
      </div>
    </div>
  );
}

// ------------------- CARTE : RECTO -------------------
function CardFace({
  card,
  size = "md",
  onZoom,
}: {
  card: OpenedCard | OwnedCard;
  size?: "sm" | "md" | "lg";
  onZoom?: () => void;
}) {
  const r = RARITIES[card.rarity];
  const s = seriesOf(card.series);
  const landscape = card.layout === "landscape";
  const isImg = card.art.startsWith("img:");
  const dims =
    size === "lg"
      ? landscape ? "h-56 w-80" : "h-80 w-56"
      : size === "sm"
      ? landscape ? "h-28 w-40" : "h-32 w-[5.5rem]"
      : landscape ? "h-32 w-48" : "h-44 w-32";
  return (
    <div
      onClick={onZoom}
      className={`relative ${dims} shrink-0 overflow-hidden rounded-xl ring-2 ${r.ring} card-beveled ${
        onZoom ? "cursor-zoom-in transition hover:scale-105" : ""
      }`}
      style={
        isImg
          ? { backgroundImage: `url('${card.art.slice(4)}')`, backgroundSize: "cover", backgroundPosition: "center", boxShadow: `0 0 24px ${r.glow}55` }
          : { background: artGradient(card.art), boxShadow: `0 0 24px ${r.glow}55` }
      }
    >
      <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-40">
        {card.emoji}
      </div>
      <div className="absolute left-1 top-1 rounded bg-black/60 px-1 text-[8px] font-black tracking-wider text-white/70">
        {s.short}
      </div>
      {/* Prism overlay texture based on series */}
      {card.variant === "Prisme" && (
        <div className={`pointer-events-none absolute inset-0 ${prismClassForSeries()}`} />
      )}
      {/* Rainbow shimmer for Prisme */}
      {card.variant === "Prisme" && (
        <motion.div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,0,0,0.2),rgba(255,200,0,0.15),rgba(0,255,0,0.15),rgba(0,200,255,0.2),rgba(150,0,255,0.2))]"
          animate={{ opacity: [0.1, 0.4, 0.1] }}
          transition={{ duration: 2.4, repeat: Infinity }}
        />
      )}
      {/* Flash Prism sparkle dots for Visual Adventure Prisme */}
      {card.variant === "Prisme" && (
        <div className="pointer-events-none absolute inset-0 flash-prism-overlay" />
      )}
      {card.variant === "Laser" && (
        <>
          <div className={`pointer-events-none absolute inset-0 ${prismClassForSeries()}`} />
          <motion.div
            className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/45 to-transparent"
            animate={{ x: ["-130%", "380%"] }}
            transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 1 }}
          />
          <motion.div
            className="pointer-events-none absolute inset-x-0 h-1/4 bg-gradient-to-b from-transparent via-cyan-200/30 to-transparent"
            animate={{ y: ["-110%", "480%"] }}
            transition={{ duration: 1.9, repeat: Infinity, repeatDelay: 0.7 }}
          />
        </>
      )}
      {(card.rarity === "Ultra-Rare" || card.rarity === "Gold") && (
        <motion.div
          className={`pointer-events-none absolute inset-0 ring-2 ${card.rarity === "Gold" ? "ring-amber-400" : "ring-yellow-300"}`}
          animate={{ boxShadow: ["inset 0 0 8px rgba(253,224,71,0.4)", "inset 0 0 22px rgba(253,224,71,0.85)", "inset 0 0 8px rgba(253,224,71,0.4)"] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        />
      )}
      <div className="absolute inset-x-0 bottom-0 z-10 bg-black/60 p-1.5 backdrop-blur-sm">
        <div className="truncate text-[11px] font-bold text-white">{card.name}</div>
        <div className="truncate text-[9px] text-amber-200/80">{card.powerLevel}</div>
        <div className="mt-0.5 flex items-center gap-1">
          <span className={`rounded px-1 text-[9px] font-semibold ${r.badge}`}>{card.rarity}</span>
          {card.variant !== "Normale" && (
            <span className={`rounded px-1 text-[9px] font-black ${card.variant === "Laser" ? "bg-cyan-400/30 text-cyan-100" : "bg-fuchsia-400/30 text-fuchsia-100"}`}>
              {card.variant === "Laser" ? "⚡" : "◆"}
            </span>
          )}
        </div>
      </div>
      {"count" in card && card.count > 1 && (
        <div className="absolute right-1 top-1 z-10 rounded-full bg-black/70 px-1.5 text-[10px] font-bold text-white">
          ×{card.count}
        </div>
      )}
    </div>
  );
}

function DragonBallIcon({ stars, owned, size = 44 }: { stars: number; owned: boolean; size?: number }) {
  return (
    <motion.div
      animate={owned ? { scale: [1, 1.15, 1] } : {}}
      transition={{ duration: 1.2, repeat: owned ? Infinity : 0, repeatDelay: 2 }}
      className={`flex items-center justify-center rounded-full ${
        owned
          ? "bg-[radial-gradient(circle_at_35%_30%,#fde047,#f59e0b_60%,#b45309)] shadow-[0_0_16px_rgba(245,158,11,0.7)]"
          : "bg-white/5 ring-1 ring-white/10"
      }`}
      style={{ width: size, height: size }}
    >
      <span className={`text-[11px] font-black ${owned ? "text-red-900" : "text-white/20"}`}>
        {owned ? "★".repeat(Math.min(stars, 3)) : stars}
      </span>
    </motion.div>
  );
}

// ------------------- APP -------------------
export default function App() {
  const [loaded] = useState<Record<string, unknown> | null>(() => {
    try {
      return JSON.parse(window.localStorage.getItem(SAVE_KEY) || "null");
    } catch {
      return null;
    }
  });

  const [zenis, setZenis] = useState<number>((loaded as { zenis?: number })?.zenis ?? 500);
  const [collection, setCollection] = useState<OwnedCard[]>((loaded as { collection?: OwnedCard[] })?.collection ?? []);
  const [balls, setBalls] = useState<number[]>((loaded as { balls?: number[] })?.balls ?? []);
  const [stats, setStats] = useState<Stats>(
    (loaded as { stats?: Stats })?.stats ?? { packs: 0, spent: 0, earned: 0, sells: 0, buys: 0, wishes: 0, ballsFound: 0, duelsWon: 0 }
  );
  const [quests, setQuests] = useState<QuestState>(
    (loaded as { quests?: QuestState })?.quests ?? { date: new Date().toISOString().slice(0, 10), packs: 0, sells: 0, buys: 0, claimed: [] }
  );
  const [audioPref, setAudioPref] = useState<boolean>((loaded as { audioPref?: boolean })?.audioPref ?? true);
  const [theme, setTheme] = useState<string>((loaded as { theme?: string })?.theme ?? "nuit");
  const T = THEMES[theme] ?? THEMES.nuit;
  soundOn = audioPref;

  const [opened, setOpened] = useState<OpenedCard[]>([]);
  const [activeSeries, setActiveSeries] = useState(COLLECTIONS[0].id);
  const [albumSeries, setAlbumSeries] = useState("all");
  const [tab, setTab] = useState<"machine" | "album" | "market" | "shenron" | "duel" | "capsule" | "stats">("machine");
  const [phase, setPhase] = useState<"idle" | "dispensing" | "dispensed">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [ballMessage, setBallMessage] = useState<string | null>(null);
  const [marketStock, setMarketStock] = useState<string[]>([]);
  const [wishGranted, setWishGranted] = useState<OpenedCard | null>(null);
  const [zoom, setZoom] = useState<(OpenedCard | OwnedCard) | null>(null);
  const [summoning, setSummoning] = useState(false);
  const [wishPhase, setWishPhase] = useState(false);
  const [ripping, setRipping] = useState(false);
  const [rareEffect, setRareEffect] = useState<"rare" | "max" | null>(null);
  const [ballEffect, setBallEffect] = useState(false);
  const [peelCard, setPeelCard] = useState<OpenedCard | null>(null);
  const [showTitle, setShowTitle] = useState(true);
  const [showcase, setShowcase] = useState<string[]>([]);
  const [albumRarity, setAlbumRarity] = useState<Rarity | "all">("all");
  const [albumVariant, setAlbumVariant] = useState<Variant | "all">("all");
  const [albumSearch, setAlbumSearch] = useState("");
  const [lastPack, setLastPack] = useState<OpenedCard[]>([]);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [ki, setKi] = useState<number>((loaded as { ki?: number })?.ki ?? 5);
  const [maxKi, setMaxKi] = useState<number>((loaded as { maxKi?: number })?.maxKi ?? 5);
  const [lastKiRegen, setLastKiRegen] = useState<number>(Date.now());
  const [fullMoon, setFullMoon] = useState(false);
  const [promosClaimed, setPromosClaimed] = useState<string[]>((loaded as { promosClaimed?: string[] })?.promosClaimed ?? []);
  const [moonMessage, setMoonMessage] = useState<string | null>(null);

  // ---- Sauvegarde automatique ----
  useEffect(() => {
    try {
      window.localStorage.setItem(
        SAVE_KEY,
        JSON.stringify({ zenis, collection, balls, stats, quests, audioPref, theme, ki, maxKi, promosClaimed })
      );
    } catch { /* stockage indisponible */ }
  }, [zenis, collection, balls, stats, quests, audioPref, theme, ki, maxKi, promosClaimed]);

  // ---- Régénération du Ki (1 point toutes les 2 minutes) ----
  useEffect(() => {
    const interval = setInterval(() => {
      setKi((k) => {
        if (k >= maxKi) return k;
        const elapsed = Date.now() - lastKiRegen;
        const regen = Math.floor(elapsed / 120000);
        if (regen > 0) {
          setLastKiRegen(Date.now());
          return Math.min(k + regen, maxKi);
        }
        return k;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [lastKiRegen, maxKi]);

  // ---- Pleine Lune (toutes les 5 minutes, dure 1 minute) ----
  useEffect(() => {
    const checkMoon = () => {
      const cycle = Math.floor(Date.now() / 300000);
      const active = cycle % 5 === 0;
      setFullMoon(active);
      if (active) setMoonMessage("🌕 LA PLEINE LUNE APPARAÎT ! Taux de carte MAX doublé pendant 1 minute !");
      else setMoonMessage(null);
    };
    checkMoon();
    const interval = setInterval(checkMoon, 10000);
    return () => clearInterval(interval);
  }, []);

  // ---- Reset des quêtes au changement de jour ----
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (quests.date !== today) {
      setQuests({ date: today, packs: 0, sells: 0, buys: 0, claimed: [] });
    }
  }, [quests.date]);

  const series = seriesOf(activeSeries);
  const totalCards = SERIES.reduce((sum, s) => sum + s.cards.length * 5 * 3, 0);
  const shownCollection =
    albumSeries === "all" ? collection : collection.filter((c) => c.series === albumSeries);
  const dupes = collection.filter((c) => c.count > 1);
  const dupeCount = dupes.reduce((s, c) => s + (c.count - 1), 0);
  const ballsComplete = balls.length === 7;
  const pctComplete = (collection.length / totalCards) * 100;
  const playerLevel = Math.floor(pctComplete / 10) + 1;
  const levelTitles = ["Débutant", "Collectionneur", "Chasseur", "Expert", "Maître", "Légende", "Saiyan", "Super Saiyan", "Dieu", "Whis", "Grand Prêtre"];
  const levelTitle = levelTitles[Math.min(playerLevel - 1, levelTitles.length - 1)];

  const seriesOwned = (sid: string) =>
    collection.filter((c) => c.series === sid).length;
  const seriesTotal = (sid: string) => seriesOf(sid).cards.length * 15;

  const isUnlocked = (s: SeriesDef): boolean => {
    if (!s.unlock) return true;
    if ("type" in s.unlock) {
      if (s.unlock.type === "packs") return stats.packs >= s.unlock.count;
      if (s.unlock.type === "maxcards") return collection.filter((c) => c.rarity === "Ultra-Rare" || c.rarity === "Gold").length >= s.unlock.count;
      if (s.unlock.type === "zenis") return zenis >= s.unlock.count || stats.earned >= s.unlock.count;
      if (s.unlock.type === "duels") return stats.duelsWon >= s.unlock.count;
      return true;
    }
    const u = s.unlock;
    if (u.series === "prev") {
      const idx = SERIES.findIndex((x) => x.id === s.id);
      if (idx <= 0) return true;
      const prev = SERIES[idx - 1];
      return seriesOwned(prev.id) / seriesTotal(prev.id) >= u.pct / 100;
    }
    if (u.series === "any")
      return SERIES.some((o) => o.id !== s.id && seriesOwned(o.id) / seriesTotal(o.id) >= u.pct / 100);
    return seriesOwned(u.series) / seriesTotal(u.series) >= u.pct / 100;
  };

  const unlockLabel = (s: SeriesDef): string | null => {
    if (!s.unlock) return null;
    if ("type" in s.unlock) {
      if (s.unlock.type === "packs") return `Ouvrir ${s.unlock.count} packs (${Math.min(stats.packs, s.unlock.count)}/${s.unlock.count})`;
      if (s.unlock.type === "maxcards") return `Obtenir ${s.unlock.count} cartes Ultra-Rare (${collection.filter((c) => c.rarity === "Ultra-Rare" || c.rarity === "Gold").length}/${s.unlock.count})`;
      if (s.unlock.type === "zenis") return `Gagner ${s.unlock.count} Zenis au total (${Math.min(stats.earned, s.unlock.count)}/${s.unlock.count})`;
      if (s.unlock.type === "duels") return `Gagner ${s.unlock.count} duels (${Math.min(stats.duelsWon, s.unlock.count)}/${s.unlock.count})`;
      return null;
    }
    const u = s.unlock;
    if (u.series === "prev") {
      const idx = SERIES.findIndex((x) => x.id === s.id);
      if (idx <= 0) return null;
      const prev = SERIES[idx - 1];
      const pct = Math.min(100, Math.round((seriesOwned(prev.id) / seriesTotal(prev.id)) * 100));
      return `Compléter ${prev.short} à ${u.pct}% (${pct}/${u.pct}%)`;
    }
    return null;
  };

  const missingCombos = () => {
    const out: { series: string; card: CardDef; rarity: Rarity; variant: Variant }[] = [];
    for (const s of SERIES)
      for (const c of s.cards)
        for (const rar of BINDER_RARITIES)
          for (const v of ["Normale", "Prisme", "Laser"] as Variant[])
            if (!collection.some((o) => o.series === s.id && o.id === c.id && o.rarity === rar && o.variant === v))
              out.push({ series: s.id, card: c, rarity: rar, variant: v });
    return out;
  };

  const refreshMarket = (silent = false) => {
    const missing = missingCombos();
    if (missing.length === 0) {
      setMarketStock([]);
      if (!silent) setMessage("Collection complète ! Le marché n'a plus rien à vendre 🎉");
      return;
    }
    const stock = [...missing].sort(() => Math.random() - 0.5).slice(0, 6);
    setMarketStock(stock.map((m) => `${m.series}|${m.card.id}|${m.rarity}|${m.variant}`));
    if (!silent) setMessage("Marché renouvelé !");
  };

  const marketPrice = (rar: Rarity, variant: Variant) =>
    Math.round(RARITIES[rar].market * VARIANT_MULT[variant]);

  const addCards = (results: OpenedCard[]) => {
    setCollection((prev) => {
      const next = prev.map((c) => ({ ...c }));
      for (const res of results) {
        const existing = next.find((c) => key(c) === key(res));
        if (existing) existing.count += 1;
        else next.push({ ...res, count: 1 });
      }
      return next;
    });
  };

  const bumpQuest = (stat: "packs" | "sells" | "buys") =>
    setQuests((q) => ({ ...q, [stat]: (q as unknown as Record<string, number>)[stat] + 1 }));

  const dispense = () => {
    if (zenis < series.cost) {
      setMessage(`Pas assez de Zenis ! Il vous faut ${series.cost} 💰`);
      return;
    }
    if (ki <= 0) {
      setMessage(`💢 Pas assez de Ki ! Attendez la régénération (1 Ki / 2 min).`);
      return;
    }
    setKi((k) => k - 1);
    setMessage(null);
    setBallMessage(null);
    setZenis((z) => z - series.cost);
    setStats((s) => ({ ...s, spent: s.spent + series.cost }));
    playSound("coin");
    setPhase("dispensing");
    setTimeout(() => {
      playSound("katchunk");
      setPhase("dispensed");
    }, 1000);
  };

  const openDispensedPack = () => {
    setRipping(true);
    playSound("rip");
    setTimeout(() => setRipping(false), 700);
    const results: OpenedCard[] = [];
    const moonOdds = fullMoon
      ? { ...series.odds, "Ultra-Rare": (series.odds["Ultra-Rare"] || 0.5) * 2, Gold: (series.odds.Gold || 0.5) * 2, "Peel-off": (series.odds["Peel-off"] || 3.5) * 1.5, Commun: Math.max(10, (series.odds.Commun || 58) - 10) }
      : series.odds;
    for (let i = 0; i < 5; i++) {
      const def = series.cards[Math.floor(Math.random() * series.cards.length)];
      results.push({
        ...def,
        rarity: rollRarity(moonOdds),
        variant: rollVariant(),
        series: series.id,
      });
    }
    // jingle selon la meilleure carte du pack
    const best = results.reduce((a, b) => (RARITY_ORDER.indexOf(a.rarity) <= RARITY_ORDER.indexOf(b.rarity) ? a : b));
    if (best.rarity === "Gold") {
      playSound("gold");
      setRareEffect("max");
      setTimeout(() => setRareEffect(null), 2500);
    } else if (best.rarity === "Ultra-Rare") {
      playSound("max");
      setRareEffect("max");
      setTimeout(() => setRareEffect(null), 2000);
    } else if (best.rarity === "Peel-off" || best.rarity === "Prism") {
      playSound("rare");
      setRareEffect("rare");
      setTimeout(() => setRareEffect(null), 1800);
    }
    // Dragon Ball : 45% de chance par pack
    if (balls.length < 7 && Math.random() < 0.45) {
      const missing = [1, 2, 3, 4, 5, 6, 7].filter((n) => !balls.includes(n));
      const found = missing[Math.floor(Math.random() * missing.length)];
      setBalls((b) => [...b, found]);
      setStats((s) => ({ ...s, ballsFound: s.ballsFound + 1 }));
      setBallMessage(
        `🌟 Une Dragon Ball est apparue dans le pack ! Vous trouvez la boule à ${found} étoile${found > 1 ? "s" : ""} ! (${balls.length + 1}/7)`
      );
      setBallEffect(true);
      playSound("max");
      setTimeout(() => setBallEffect(false), 2500);
    }
    addCards(results);
    setOpened((prev) => [...results.reverse(), ...prev].slice(0, 5));
    setLastPack(results.reverse());
    // Prizm Peel : si une carte prisme est tirée dans Super Battle, proposer l'effet
    if (results.some((r) => r.variant === "Prisme")) {
      const peelCard = results.find((r) => r.variant === "Prisme");
      if (peelCard) {
        setPeelCard({ ...peelCard });
        setTimeout(() => setPeelCard(null), 4000);
      }
    }
    setStats((s) => ({ ...s, packs: s.packs + 1 }));
    bumpQuest("packs");
    setPhase("idle");
  };

  const sellDupe = (card: OwnedCard) => {
    const price = RARITIES[card.rarity].sell * VARIANT_MULT[card.variant];
    setCollection((prev) =>
      prev.map((c) => (key(c) === key(card) ? { ...c, count: c.count - 1 } : c)).filter((c) => c.count > 0)
    );
    setZenis((z) => z + price);
    setStats((s) => ({ ...s, earned: s.earned + price, sells: s.sells + 1 }));
    bumpQuest("sells");
    setMessage(`+${price} 💰 pour la vente de ${card.name} (${card.rarity} ${card.variant})`);
  };

  const buyFromMarket = (k: string) => {
    const [sid, cid, rar, variant] = k.split("|");
    const price = marketPrice(rar as Rarity, variant as Variant);
    if (zenis < price) {
      setMessage(`Pas assez de Zenis ! Cette carte coûte ${price} 💰`);
      return;
    }
    const s = seriesOf(sid);
    const def = s.cards.find((c) => c.id === cid)!;
    playSound("buy");
    setZenis((z) => z - price);
    setStats((st) => ({ ...st, spent: st.spent + price, buys: st.buys + 1 }));
    bumpQuest("buys");
    addCards([{ ...def, rarity: rar as Rarity, variant: variant as Variant, series: sid }]);
    setMarketStock((prev) => prev.filter((x) => x !== k));
    setMessage(`Acheté : ${def.name} (${rar} ${variant}) pour ${price} Zenis !`);
  };

  const summonShenron = () => {
    playSound("shenron");
    setSummoning(true);
    setWishPhase(false);
    setTimeout(() => {
      setSummoning(false);
      setWishPhase(true);
    }, 2600);
  };

  const makeWish = (sid: string, cid: string, rar: Rarity) => {
    const s = seriesOf(sid);
    const def = s.cards.find((c) => c.id === cid)!;
    // 10% de chance que le vœu soit détourné (culotte d'Oolong)
    if (Math.random() < 0.10) {
      const allSeries = SERIES.filter((sx) => isUnlocked(sx));
      const randomSeries = allSeries[Math.floor(Math.random() * allSeries.length)];
      const randomCard = randomSeries.cards[Math.floor(Math.random() * randomSeries.cards.length)];
      const randomRar: Rarity = (["Prism", "Peel-off", "Ultra-Rare"] as Rarity[])[Math.floor(Math.random() * 3)];
      addCards([{ ...randomCard, rarity: randomRar, variant: "Prisme", series: randomSeries.id }]);
      setBalls([]);
      setWishPhase(false);
      setWishGranted({ ...randomCard, rarity: randomRar, variant: "Prisme", series: randomSeries.id });
      setStats((st) => ({ ...st, wishes: st.wishes + 1 }));
      playSound("rare");
      setMessage(`🩲 Oolong a détourné votre vœu ! Shenron vous donne une carte aléatoire : ${randomCard.name} (${randomRar} Prisme) !`);
      return;
    }
    addCards([{ ...def, rarity: rar, variant: "Prisme", series: sid }]);
    setBalls([]);
    setWishPhase(false);
    setWishGranted({ ...def, rarity: rar, variant: "Prisme", series: sid });
    setStats((s) => ({ ...s, wishes: s.wishes + 1 }));
    playSound("max");
    setMessage(`🐉 Shenron a exaucé votre vœu : ${def.name} (${rar} Prisme) !`);
  };

  const claimQuest = (q: (typeof QUESTS)[number]) => {
    if (quests.claimed.includes(q.id)) return;
    if ((quests as unknown as Record<string, number>)[q.stat] < q.goal) return;
    setQuests((qs) => ({ ...qs, claimed: [...qs.claimed, q.id] }));
    setZenis((z) => z + q.reward);
    setStats((s) => ({ ...s, earned: s.earned + q.reward }));
    playSound("coin");
    setMessage(`Quête accomplie ! +${q.reward} Zenis 🎉`);
  };

  const resetGame = () => {
    setCollection([]);
    setBalls([]);
    setZenis(500);
    setStats({ packs: 0, spent: 0, earned: 0, sells: 0, buys: 0, wishes: 0, ballsFound: 0, duelsWon: 0 });
    setQuests({ date: new Date().toISOString().slice(0, 10), packs: 0, sells: 0, buys: 0, claimed: [] });
    setMarketStock([]);
    setOpened([]);
    setWishGranted(null);
    setKi(5);
    setMaxKi(5);
    setPromosClaimed([]);
    setMessage("Nouvelle partie !");
  };

  // --- Export / Import sauvegarde ---
  const exportSave = (): string => {
    return JSON.stringify({ zenis, collection, balls, stats, quests, audioPref, theme, ki, maxKi, promosClaimed });
  };

  const importSave = (data: string) => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.zenis !== undefined) setZenis(parsed.zenis);
      if (parsed.collection) setCollection(parsed.collection);
      if (parsed.balls) setBalls(parsed.balls);
      if (parsed.stats) setStats(parsed.stats);
      if (parsed.quests) setQuests(parsed.quests);
      if (parsed.audioPref !== undefined) setAudioPref(parsed.audioPref);
      if (parsed.theme) setTheme(parsed.theme);
      if (parsed.ki !== undefined) setKi(parsed.ki);
      if (parsed.maxKi !== undefined) setMaxKi(parsed.maxKi);
      if (parsed.promosClaimed) setPromosClaimed(parsed.promosClaimed);
      setMessage("✓ Sauvegarde importée avec succès !");
    } catch {
      setMessage("Erreur : code de sauvegarde invalide.");
    }
  };

  // --- Duel callbacks ---
  const duelWin = (reward: number) => {
    setZenis((z) => z + reward);
    setStats((s) => ({ ...s, earned: s.earned + reward, duelsWon: s.duelsWon + 1 }));
    setMessage(`🏆 Victoire ! +${reward} Zenis`);
  };
  const duelLose = (cost: number) => {
    setZenis((z) => z - cost);
    setStats((s) => ({ ...s, spent: s.spent + cost }));
  };

  // --- Capsule Corp fusion ---
  const fuseCards = (consumed: OwnedCard[], _result: { name: string; emoji: string; rarity: Rarity; variant: Variant }) => {
    setCollection((prev) => {
      let next = prev.map((c) => ({ ...c }));
      for (const card of consumed) {
        const existing = next.find((c) => key(c) === key(card));
        if (existing) existing.count -= 1;
      }
      return next.filter((c) => c.count > 0);
    });
    setMessage("🎁 Capsule ouverte ! Carte obtenue !");
  };

  // --- Chambre à Gravité (upgrade variant) ---
  const gravityTrain = (card: OwnedCard): { success: boolean; newVariant: Variant } => {
    const cost = 300;
    if (zenis < cost) return { success: false, newVariant: card.variant };
    setZenis((z) => z - cost);
    setStats((s) => ({ ...s, spent: s.spent + cost }));
    if (card.variant === "Normale") {
      const newVariant: Variant = Math.random() < 0.6 ? "Prisme" : (Math.random() < 0.3 ? "Laser" : "Normale");
      if (newVariant !== "Normale") {
        setCollection((prev) => prev.map((c) =>
          key(c) === key(card) && c.count > 0
            ? { ...c, count: c.count - 1 }
            : c
        ).filter((c) => c.count > 0));
        addCards([{ ...card, variant: newVariant, count: 1 } as unknown as OpenedCard]);
        return { success: true, newVariant };
      }
      return { success: false, newVariant: "Normale" };
    }
    if (card.variant === "Prisme") {
      if (Math.random() < 0.4) {
        setCollection((prev) => prev.map((c) =>
          key(c) === key(card) && c.count > 0
            ? { ...c, count: c.count - 1 }
            : c
        ).filter((c) => c.count > 0));
        addCards([{ ...card, variant: "Laser", count: 1 } as unknown as OpenedCard]);
        return { success: true, newVariant: "Laser" };
      }
      return { success: false, newVariant: "Prisme" };
    }
    return { success: false, newVariant: card.variant };
  };

  // --- Récompense promo 100% série ---
  const claimPromo = (seriesId: string) => {
    if (promosClaimed.includes(seriesId)) return;
    const s = seriesOf(seriesId);
    if (seriesOwned(seriesId) < seriesTotal(seriesId)) return;
    const promoCard = s.cards[s.cards.length - 1];
    addCards([{ ...promoCard, rarity: "Gold", variant: "Laser", series: seriesId }]);
    setPromosClaimed((p) => [...p, seriesId]);
    playSound("max");
    setMessage(`🎉 Promo exclusive débloquée : ${promoCard.name} (Gold Laser) !`);
  };

  const seriesDataForCapsule = SERIES.map((s) => ({
    id: s.id,
    name: s.name,
    short: s.short,
    cards: s.cards.map((c) => ({ id: c.id, name: c.name, emoji: c.emoji })),
  }));

  // --- Achievements ---
  const seriesCompleted = SERIES.filter((s) => seriesOwned(s.id) >= seriesTotal(s.id)).length;
  const achievementData = {
    stats,
    collectionCount: collection.length,
    seriesCompleted,
    ballsFound: stats.ballsFound,
    wishes: stats.wishes,
    totalCards,
  };
  const unlockedAchievements = ACHIEVEMENTS.filter((a) => a.check(achievementData));

  return (
    <div className="min-h-screen p-6 text-white" style={{ background: T.bgStyle }}>
      <AnimatePresence>
        {showTitle && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            <TitleScreen
              zenis={zenis}
              collectionCount={collection.length}
              totalCards={totalCards}
              ballsCount={balls.length}
              stats={stats}
              seriesProgress={SERIES.map((s) => ({
                name: s.name,
                short: s.short,
                owned: seriesOwned(s.id),
                total: seriesTotal(s.id),
                pct: (seriesOwned(s.id) / seriesTotal(s.id)) * 100,
              }))}
              onStart={() => setShowTitle(false)}
              onExport={() => navigator.clipboard?.writeText(exportSave()).catch(() => {})}
              onImport={importSave}
              onReset={resetGame}
              hasSave={loaded != null}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="mx-auto flex max-w-4xl flex-col gap-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-4xl tracking-wide text-yellow-400 text-shadow-db">
              DRAGON BALL
            </h1>
            <h2 className="font-heading text-lg tracking-widest text-red-500">
              NOSTALGIC CARDDASS
            </h2>
            <p className="text-xs text-white/50">
              Distributeur officiel · hommage aux Carddass Bandai 1989–1997
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex flex-wrap justify-end gap-1.5">
              {/* Pastille Zenis */}
              <div className="flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-gradient-to-br from-amber-500/30 to-orange-700/20 px-2.5 py-1 shadow-md">
                <span className="text-base">💰</span>
                <span className="font-heading text-sm text-amber-200">{zenis}</span>
                <button
                  onClick={() => setZenis((z) => z + 500)}
                  className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400/40 text-[10px] font-black text-amber-100 hover:bg-amber-400/70"
                  title="Ajouter 500 Zenis"
                >
                  +
                </button>
              </div>
              {/* Pastille Cartes */}
              <div className="flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-gradient-to-br from-cyan-500/25 to-blue-700/15 px-2.5 py-1 shadow-md">
                <span className="text-base">⚡</span>
                <span className="font-heading text-sm text-cyan-200">{collection.length}<span className="text-white/40">/{totalCards}</span></span>
              </div>
              {/* Pastille Boules */}
              <div className="flex items-center gap-1.5 rounded-full border border-orange-400/40 bg-gradient-to-br from-orange-500/25 to-red-700/15 px-2.5 py-1 shadow-md">
                <span className="text-base">🌟</span>
                <span className="font-heading text-sm text-orange-200">{balls.length}/7</span>
              </div>
              {/* Pastille Ki */}
              <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-gradient-to-br from-emerald-500/25 to-green-700/15 px-2.5 py-1 shadow-md" title={`Ki: ${ki}/${maxKi} · Régénération 1 Ki / 2 min`}>
                <span className="text-base">⚡</span>
                <span className="font-heading text-sm text-emerald-200">{ki}/{maxKi}</span>
              </div>
              {/* Bouton son */}
              <button
                onClick={() => setAudioPref((a) => !a)}
                className="flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-base hover:bg-white/20"
                title="Activer/couper le son"
              >
                {audioPref ? "🔊" : "🔇"}
              </button>
            </div>
            {/* Sélecteur de thème */}
            <div className="flex gap-1">
              {Object.entries(THEMES).map(([id, t]) => (
                <button
                  key={id}
                  onClick={() => setTheme(id)}
                  title={t.label}
                  className={`rounded-full px-1.5 py-0.5 text-[10px] transition hover:scale-110 ${
                    theme === id ? "bg-white/25 ring-1 ring-white/60" : "bg-white/5"
                  }`}
                >
                  {t.icon}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* ------- QUÊTES DU JOUR ------- */}
        <div className="rounded-xl border border-white/10 bg-black/30 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold text-amber-200">📅 Quêtes du jour</span>
            <button
              onClick={() => {
                if (quests.claimed.includes("bonus")) return;
                setQuests((q) => ({ ...q, claimed: [...q.claimed, "bonus"] }));
                setZenis((z) => z + 200);
                setStats((s) => ({ ...s, earned: s.earned + 200 }));
                playSound("coin");
                setMessage("Bonus quotidien réclamé ! +200 Zenis 🎁");
              }}
              disabled={quests.claimed.includes("bonus")}
              className={`rounded-lg border px-2 py-1 text-[10px] font-bold transition ${
                quests.claimed.includes("bonus")
                  ? "border-white/10 bg-white/5 text-white/40"
                  : "border-emerald-300 bg-emerald-500/30 text-emerald-100 hover:scale-105"
              }`}
            >
              {quests.claimed.includes("bonus") ? "✓ Bonus réclamé" : "🎁 Bonus du jour +200 💰"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {QUESTS.map((q) => {
              const done = (quests as unknown as Record<string, number>)[q.stat] >= q.goal;
              const claimed = quests.claimed.includes(q.id);
              return (
                <button
                  key={q.id}
                  onClick={() => claimQuest(q)}
                  disabled={claimed || !done}
                  className={`rounded-lg border px-3 py-1.5 text-[11px] font-bold transition ${
                    claimed
                      ? "border-green-400/40 bg-green-500/20 text-green-300"
                      : done
                      ? "border-amber-300 bg-amber-500/30 text-amber-100 hover:scale-105"
                      : "border-white/10 bg-white/5 text-white/50"
                  }`}
                >
                  {claimed ? "✓ Réclamé" : done ? `🎁 Réclamer +${q.reward}` : `${q.label} — ${Math.min((quests as unknown as Record<string, number>)[q.stat], q.goal)}/${q.goal}`}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-1 border-b-2 border-white/10 pb-0">
          {([
            { id: "machine", label: "🏧", name: "DISTRIBUTEUR" },
            { id: "album", label: "📖", name: "ALBUM" },
            { id: "market", label: "🛒", name: "MARCHÉ" },
            { id: "shenron", label: "🐉", name: "SHENRON" },
            { id: "duel", label: "⚔️", name: "DUEL" },
            { id: "capsule", label: "🔬", name: "CAPSULE" },
            { id: "stats", label: "📊", name: "STATS" },
          ] as { id: typeof tab; label: string; name: string }[]).map((t) => (
            <button
              key={t.id}
              onClick={() => {
                if (t.id === "market" && marketStock.length === 0) refreshMarket(true);
                setTab(t.id);
              }}
              className={`binder-tab flex items-center gap-1.5 border-b-2 px-3 py-2 font-heading text-[11px] tracking-wide transition ${
                tab === t.id
                  ? "active border-transparent text-amber-300"
                  : "border-transparent text-white/50 hover:text-white/80"
              }`}
            >
              <span className="text-sm">{t.label}</span>
              <span>{t.name}</span>
              {t.id === "shenron" && ballsComplete && <span className="text-[10px]">✨</span>}
            </button>
          ))}
          <div className="ml-auto flex gap-1 pb-1">
            <Button variant="outline" size="sm" className="text-xs" onClick={() => setShowTitle(true)}>
              🏠 Menu
            </Button>
            <Button variant="outline" size="sm" className="text-xs" onClick={resetGame}>
              ↺ Reset
            </Button>
          </div>
        </div>

        {/* Barre de progression avec paliers */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between text-[10px] text-white/50">
            <span className="font-heading">NIV. {playerLevel}</span>
            <span>{collection.length}/{totalCards} cartes · {pctComplete.toFixed(1)}%</span>
            <span className="font-heading text-amber-300">{levelTitle}</span>
          </div>
          <div className="relative h-4 overflow-hidden rounded-full border border-white/10 bg-black/50">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pctComplete}%`,
                background: "linear-gradient(to right, #16a34a, #f97316, #fcd34d)",
                boxShadow: "0 0 12px rgba(252,211,77,0.5)",
              }}
            />
            {/* Paliers */}
            {[25, 50, 75].map((p) => (
              <div
                key={p}
                className="absolute top-0 h-full w-0.5 bg-white/30"
                style={{ left: `${p}%` }}
              />
            ))}
          </div>
        </div>

        {moonMessage && (
          <div className="rounded-lg border border-yellow-400/50 bg-yellow-500/10 px-3 py-2 text-center text-sm font-bold text-yellow-200">
            {moonMessage}
          </div>
        )}

        {message && <p className="text-center text-sm font-bold text-amber-300">{message}</p>}
        {ballMessage && <p className="text-center text-sm font-bold text-yellow-200">🌟 {ballMessage}</p>}

        {tab === "machine" && (
          <div className="flex flex-col gap-5">
            {/* ------- VITRINE PERSONNALISABLE ------- */}
            <div className="rounded-xl border border-white/10 bg-black/30 p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-heading text-xs tracking-widest text-amber-200">🏆 MA VITRINE · TOPLOADER MAGNÉTIQUE</h3>
                <span className="text-[10px] text-white/40">3 cartes favorites · survolez pour incliner</span>
              </div>
              {showcase.length === 0 ? (
                <div className="flex gap-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      onClick={() => {
                        if (collection.length > 0) {
                          const sorted = [...collection].sort((a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity));
                          setShowcase(sorted.slice(0, 3).map((c) => key(c)));
                        }
                      }}
                      className="flex h-32 w-24 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-white/20 bg-black/40 text-white/20 hover:border-amber-400/50 hover:text-amber-400/40"
                    >
                      <div className="text-center text-[10px]">
                        <div className="text-2xl">➕</div>
                        Auto
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="toploader-case flex flex-wrap justify-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4">
                  <div className="toploader-reflection" />
                  {showcase.map((k) => {
                    const card = collection.find((c) => key(c) === k);
                    if (!card) return null;
                    return (
                      <div key={k} className="toploader-card relative">
                        <CardFace card={card} onZoom={() => setZoom(card)} />
                        <button
                          onClick={() => setShowcase(showcase.filter((x) => x !== k))}
                          className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] text-white hover:bg-red-500"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                  {showcase.length < 3 && (
                    <div
                      onClick={() => {
                        const available = collection.filter((c) => !showcase.includes(key(c)));
                        if (available.length > 0) {
                          const sorted = [...available].sort((a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity));
                          setShowcase([...showcase, key(sorted[0])]);
                        }
                      }}
                      className="flex h-44 w-32 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-white/20 bg-black/40 text-white/20 hover:border-amber-400/50"
                    >
                      <div className="text-center text-[10px]"><div className="text-2xl">➕</div>Ajouter</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ------- HISTORIQUE DERNIER PACK ------- */}
            {lastPack.length > 0 && (
              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <h3 className="mb-2 font-heading text-xs tracking-widest text-cyan-200">📋 DERNIER PACK OUVERT</h3>
                <div className="flex flex-wrap gap-2">
                  {lastPack.map((card, i) => (
                    <CardFace key={i} card={card} size="sm" onZoom={() => setZoom(card)} />
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-2">
              {SERIES.map((s) => {
                const unlocked = isUnlocked(s);
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      if (!unlocked) {
                        setMessage(`🔒 ${s.name} verrouillée : ${unlockLabel(s) ?? "condition non remplie"}`);
                        return;
                      }
                      setActiveSeries(s.id);
                      setPhase("idle");
                    }}
                    className={`rounded-lg border px-3 py-2 text-left transition ${
                      activeSeries === s.id && unlocked
                        ? "border-orange-400 bg-orange-500/20"
                        : unlocked
                        ? "border-white/10 bg-white/5 hover:bg-white/10"
                        : "border-white/5 bg-black/40 opacity-50"
                    }`}
                  >
                    <div className="flex items-center gap-1 text-sm font-black">
                      {!unlocked && "🔒"} {s.universeIcon} {s.short}
                    </div>
                    <div className="text-[9px] font-bold text-orange-300/80">{s.universe}</div>
                    <div className="text-[10px] text-white/50">{s.era}</div>
                    <div className="text-[10px] text-white/40">{s.years}</div>
                    <div className={`text-[10px] ${unlocked ? "text-amber-300" : "text-white/40"}`}>
                      {unlocked ? `💰 ${s.cost} · 5 cartes` : (unlockLabel(s) ?? "Verrouillée")}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* ------- DISTRIBUTEUR ------- */}
            <div className="flex justify-center">
              <div
                className="relative w-80 overflow-hidden rounded-2xl border-4"
                style={{
                  background: artGradient(T.machineArt, "180deg"),
                  borderColor: series.machineColor || "#b45309",
                  boxShadow: `0 0 50px ${T.glowColor}, 0 0 20px ${series.machineColor}44`,
                }}
              >
                {/* En-tête distributeur */}
                <div className="bg-black/80 px-3 py-2 text-center">
                  <div className="font-heading text-[9px] tracking-[0.4em] text-white/60">
                    BANDAI · CARDDASS MACHINE
                  </div>
                  <div className="font-display text-2xl tracking-wide text-yellow-400 text-shadow-gold">
                    DRAGON BALL
                  </div>
                  <div className="font-heading text-[10px] tracking-[0.3em] text-orange-400">
                    {series.name.toUpperCase()}
                  </div>
                </div>

                {/* Vitrine : dos de cartes en rangées */}
                <div className="relative mx-4 mt-3 h-44 overflow-hidden rounded-lg border-2 border-white/20 bg-black/50">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_15%,rgba(255,255,255,0.18),transparent)]" />
                  {/* Logo de la série au centre */}
                  {series.logo ? (
                    <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
                      <img
                        src={series.logo.slice(4)}
                        alt={series.name}
                        className="h-20 w-auto opacity-80 drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                  ) : (
                    <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 text-center">
                      <div className="text-4xl opacity-70">{series.universeIcon}</div>
                      <div className="font-heading text-[10px] tracking-widest text-white/60">{series.short}</div>
                    </div>
                  )}
                  <div className="flex h-full flex-col justify-center gap-2 p-2">
                    {[0, 1].map((row) => (
                      <div key={row} className="flex justify-center gap-1.5">
                        {[0, 1, 2, 3].map((col) => (
                          <motion.div
                            key={col}
                            animate={phase === "dispensing" ? { y: [0, -6, 0] } : {}}
                            transition={{ duration: 0.4, delay: (row * 4 + col) * 0.06, repeat: 2 }}
                            className="h-16 w-11 rounded-sm ring-1 ring-white/25"
                          >
                            {series.cardBack ? (
                              <div
                                className="h-full w-full rounded-sm opacity-85 ring-2 ring-black/60"
                                style={{
                                  backgroundImage: `url('${series.cardBack.slice(4)}')`,
                                  backgroundSize: "cover",
                                  backgroundPosition: "center",
                                }}
                              />
                            ) : (
                              <div
                                className="flex h-full w-full flex-col items-center justify-center rounded-sm opacity-90 ring-2 ring-black/60"
                                style={{ background: artGradient(series.art) }}
                              >
                                <span className="text-lg opacity-60">{series.universeIcon}</span>
                                <span className="font-heading text-[6px] tracking-widest text-white/50">{series.short}</span>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="absolute left-1 top-1 rounded bg-black/60 px-1 font-heading text-[8px] text-amber-200">
                    {series.universeIcon} {series.short}
                  </div>
                </div>

                {/* Bouton + molette */}
                <div className="flex items-center justify-between px-5 py-3">
                  <button
                    onClick={dispense}
                    disabled={phase !== "idle"}
                    className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-amber-300 bg-gradient-to-br from-amber-500 to-orange-700 text-lg font-black text-black shadow-lg transition hover:scale-105 disabled:opacity-50"
                  >
                    💰
                  </button>
                  <motion.div
                    animate={phase === "dispensing" ? { rotate: 720 } : { rotate: 0 }}
                    transition={{ duration: 1 }}
                    className="flex h-10 w-10 items-center justify-center rounded-full border-4 border-amber-300 bg-red-950 text-amber-300 shadow-inner"
                  >
                    ⟳
                  </motion.div>
                </div>
                <div className="px-5 text-center font-body text-[10px] text-white/60">
                  Insérez {series.cost} Zenis — {series.name}
                </div>

                {/* Bac avec booster pack */}
                <div className="relative mx-4 mb-4 mt-2 h-24 overflow-hidden rounded-b-xl border-t-4 border-amber-950 bg-black/60">
                  <AnimatePresence>
                    {phase === "dispensed" && (
                      <motion.button
                        initial={{ y: -60, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                        onClick={openDispensedPack}
                        whileHover={{ scale: 1.05 }}
                        className="absolute inset-x-8 top-3 h-16 overflow-hidden rounded-lg ring-2 ring-amber-400/60"
                        style={{ background: artGradient(series.art) }}
                      >
                        {/* Design booster pack */}
                        <div className="relative flex h-full w-full items-center justify-center">
                          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
                          <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-yellow-400 via-amber-300 to-orange-500" />
                          <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-300 to-yellow-400" />
                          <div className="relative z-10 flex flex-col items-center">
                            <span className="font-display text-sm tracking-wide text-yellow-300 text-shadow-db">
                              DRAGON BALL
                            </span>
                            <span className="font-heading text-[8px] tracking-widest text-white/80">
                              {series.short}
                            </span>
                            <span className="font-heading text-[7px] tracking-[0.3em] text-amber-300/80">
                              CARDDASS · 5 CARDS
                            </span>
                          </div>
                          <span className="absolute right-1 top-1 text-xs">🐉</span>
                        </div>
                      </motion.button>
                    )}
                  </AnimatePresence>
                  <div className="absolute bottom-1 w-full text-center font-body text-[8px] text-white/40">
                    {phase === "idle" ? "Bac vide" : phase === "dispensing" ? "Distribution..." : "Votre pack est prêt !"}
                  </div>
                </div>
              </div>
            </div>

            {/* Effet flash à l'ouverture du booster */}
            <AnimatePresence>
              {ripping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center"
                >
                  <motion.div
                    className="absolute inset-0 bg-white"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.8, 0] }}
                    transition={{ duration: 0.3 }}
                  />
                  <motion.div
                    className="absolute left-1/2 top-1/2 h-1 w-96 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-yellow-300 to-transparent"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: [0, 1, 1], opacity: [1, 1, 0] }}
                    transition={{ duration: 0.6 }}
                    style={{ boxShadow: "0 0 30px rgba(253,224,71,0.8)" }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Animation Dragon Ball trouvée */}
            <AnimatePresence>
              {ballEffect && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center"
                >
                  <motion.div
                    className="absolute inset-0 bg-[radial-gradient(circle,rgba(253,224,71,0.3),transparent_60%)]"
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 0.6, repeat: Infinity }}
                  />
                  <motion.div
                    initial={{ scale: 0, rotate: 0 }}
                    animate={{ scale: [0, 1.5, 1.2, 1.4], rotate: [0, 360, 720] }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="relative"
                  >
                    <div
                      className="flex h-32 w-32 items-center justify-center rounded-full"
                      style={{
                        background: "radial-gradient(circle at 35% 30%, #fde047, #f59e0b 60%, #b45309)",
                        boxShadow: "0 0 60px rgba(245,158,11,0.9), inset 0 0 20px rgba(120,53,15,0.5)",
                      }}
                    >
                      <span className="text-4xl">🌟</span>
                    </div>
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div
                        key={i}
                        className="float-up absolute h-2 w-2 rounded-full bg-yellow-300"
                        style={{
                          left: "50%",
                          top: "50%",
                          boxShadow: "0 0 8px #fde047",
                          transform: `rotate(${i * 30}deg) translateY(-40px)`,
                          animationDelay: `${i * 0.06}s`,
                        }}
                      />
                    ))}
                  </motion.div>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute bottom-32 font-display text-xl tracking-wide text-yellow-300 text-shadow-gold"
                  >
                    DRAGON BALL !
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Effet Prizm Peel */}
            <AnimatePresence>
              {peelCard && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-45 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
                >
                  <div className="flex flex-col items-center gap-3">
                    <p className="font-display text-lg tracking-wide text-yellow-400 text-shadow-gold">
                      ✨ PRIZM PEEL ✨
                    </p>
                    <p className="text-xs text-white/60">Décollez l'autocollant pour révéler la carte prisme !</p>
                    <PrizmPeel onReveal={() => playSound("rare")}>
                      <CardFace card={peelCard} size="lg" />
                    </PrizmPeel>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {opened.length > 0 && (
                <motion.div
                  key={opened.map((c) => key(c)).join()}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative flex flex-wrap justify-center gap-3 rounded-xl border border-white/10 bg-black/30 p-4"
                >
                  {/* Effet particules pour cartes rares */}
                  {rareEffect && (
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div
                          key={i}
                          className="float-up absolute h-2 w-2 rounded-full"
                          style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 80}%`,
                            background: rareEffect === "max" ? "#fde047" : "#f59e0b",
                            boxShadow: `0 0 8px ${rareEffect === "max" ? "#fde047" : "#f59e0b"}`,
                            animationDelay: `${i * 0.08}s`,
                          }}
                        />
                      ))}
                      {/* Éclat doré central */}
                      <div
                        className="gold-burst absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full"
                        style={{
                          background: `radial-gradient(circle, ${
                            rareEffect === "max" ? "rgba(253,224,71,0.8)" : "rgba(245,158,11,0.7)"
                          }, transparent 70%)`,
                        }}
                      />
                    </div>
                  )}
                  {opened.map((card, i) => (
                    <motion.div
                      key={key(card) + i}
                      initial={{ rotateY: 180, opacity: 0 }}
                      animate={{ rotateY: 0, opacity: 1 }}
                      transition={{ delay: i * 0.25, duration: 0.4 }}
                    >
                      <CardFace card={card} onZoom={() => setZoom(card)} />
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {dupes.length > 0 && (
              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <h3 className="mb-2 text-sm font-bold text-amber-200">
                  💰 Doublons ({dupeCount}) — vendre pour acheter plus de packs
                </h3>
                <div className="flex flex-wrap gap-2">
                  {dupes.map((card) => (
                    <Button key={key(card)} size="sm" variant="outline" onClick={() => sellDupe(card)}>
                      {card.emoji} {card.name} ×{card.count - 1} (+{RARITIES[card.rarity].sell * VARIANT_MULT[card.variant]})
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "album" && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setAlbumSeries("all")}
                className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${
                  albumSeries === "all" ? "border-orange-400 bg-orange-500/20" : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                Toutes ({collection.length})
              </button>
              {SERIES.map((s) => {
                const n = seriesOwned(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => setAlbumSeries(s.id)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-bold ${
                      albumSeries === s.id ? "border-orange-400 bg-orange-500/20" : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    {s.short} · {s.years} ({n}/{s.cards.length * 15})
                  </button>
                );
              })}
            </div>
            {albumSeries === "all" ? (
              <div className="flex flex-col gap-3">
                {/* Filtres */}
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-black/30 p-3">
                  <input
                    type="text"
                    value={albumSearch}
                    onChange={(e) => setAlbumSearch(e.target.value)}
                    placeholder="🔍 Rechercher un personnage..."
                    className="h-8 flex-1 min-w-40 rounded-lg border border-white/20 bg-black/50 px-2 text-xs text-white outline-none focus:border-amber-400"
                  />
                  <div className="flex gap-1">
                    {(["all", "Gold", "Ultra-Rare", "Peel-off", "Prism", "Uncommon", "Commun"] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setAlbumRarity(r as Rarity | "all")}
                        className={`rounded-lg px-2 py-1 text-[10px] font-bold transition ${
                          albumRarity === r ? "bg-amber-500/30 text-amber-200 ring-1 ring-amber-400" : "bg-white/5 text-white/50 hover:bg-white/10"
                        }`}
                      >
                        {r === "all" ? "Toutes" : r}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    {(["all", "Normale", "Prisme", "Laser"] as const).map((v) => (
                      <button
                        key={v}
                        onClick={() => setAlbumVariant(v as Variant | "all")}
                        className={`rounded-lg px-2 py-1 text-[10px] font-bold transition ${
                          albumVariant === v ? "bg-fuchsia-500/30 text-fuchsia-200 ring-1 ring-fuchsia-400" : "bg-white/5 text-white/50 hover:bg-white/10"
                        }`}
                      >
                        {v === "all" ? "Toutes" : v}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Grille filtrée */}
                <div className="flex flex-wrap gap-3 rounded-xl border border-white/10 bg-black/30 p-4">
                  {(() => {
                    let filtered = [...shownCollection];
                    if (albumRarity !== "all") filtered = filtered.filter((c) => c.rarity === albumRarity);
                    if (albumVariant !== "all") filtered = filtered.filter((c) => c.variant === albumVariant);
                    if (albumSearch.trim()) {
                      const q = albumSearch.toLowerCase();
                      filtered = filtered.filter((c) => c.name.toLowerCase().includes(q));
                    }
                    filtered.sort((a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity));
                    if (filtered.length === 0) return (
                      <p className="w-full py-10 text-center text-white/40">
                        Aucune carte ne correspond à ces filtres.
                      </p>
                    );
                    return filtered.map((card) => (
                      <CardFace key={key(card)} card={card} onZoom={() => setZoom(card)} />
                    ));
                  })()}
                </div>
              </div>
            ) : (() => {
              const s = seriesOf(albumSeries);
              const n = seriesOwned(s.id);
              return (
                <div
                  className="rounded-2xl border-4 p-4 shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
                  style={{ background: artGradient(T.binderArt), borderColor: T.binderBorderColor }}
                >
                  <div className="mb-4 border-b border-amber-900/40 pb-3 text-center">
                    {s.logo ? (
                      <div className="mb-2 flex justify-center">
                        <img
                          src={s.logo.slice(4)}
                          alt={s.name}
                          className="h-20 w-auto drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
                          style={{ objectFit: "contain" }}
                        />
                      </div>
                    ) : (
                      <div className="font-display text-lg tracking-[0.25em] text-amber-300 drop-shadow">
                        {s.short}
                      </div>
                    )}
                    <div className="font-heading text-[10px] text-orange-300/80">
                      {s.universeIcon} {s.universe}
                    </div>
                    <div className="text-[10px] text-white/50">
                      {s.name} · {s.era} · {s.years}
                    </div>
                    <div className="mt-1 text-[11px] text-white/70">
                      Classeur : <b className="text-amber-200">{n}</b> / {s.cards.length * 15} cartes
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    {s.cards.map((def) => (
                      <div key={def.id} className="rounded-lg border border-white/10 bg-black/40 p-2">
                        <div className="mb-1.5 text-[11px] font-bold text-white/80">
                          {def.emoji} {def.name} <span className="text-white/40">— {def.powerLevel}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {BINDER_RARITIES.map((rar) => {
                            const ownedVariants = (["Normale", "Prisme", "Laser"] as Variant[]).map((v) => {
                              const o = collection.find(
                                (c) => c.series === s.id && c.id === def.id && c.rarity === rar && c.variant === v
                              );
                              return { v, o };
                            });
                            const best = ownedVariants
                              .filter((x) => x.o)
                              .sort((a, b) => VARIANT_RANK[b.v] - VARIANT_RANK[a.v])[0];
                            return (
                              <div key={rar} className="flex flex-col items-center gap-1">
                                {best ? (
                                  <CardFace card={best.o!} size="sm" onZoom={() => setZoom(best.o!)} />
                                ) : (
                                  <div
                                    className={`flex shrink-0 items-center justify-center rounded-xl border-2 border-dashed bg-black/60 text-lg text-white/15 ${
                                      def.layout === "landscape" ? "h-28 w-40" : "h-32 w-[5.5rem]"
                                    }`}
                                    style={{ borderColor: `${RARITIES[rar].glow}33` }}
                                  >
                                    ?
                                  </div>
                                )}
                                <div className="flex gap-0.5">
                                  {(["Normale", "Prisme", "Laser"] as Variant[]).map((v) => (
                                    <span
                                      key={v}
                                      className={`h-1.5 w-1.5 rounded-full ${
                                        ownedVariants.find((x) => x.v === v)!.o
                                          ? v === "Laser"
                                            ? "bg-cyan-300"
                                            : v === "Prisme"
                                            ? "bg-fuchsia-400"
                                            : "bg-slate-300"
                                          : "bg-white/10"
                                      }`}
                                      title={`${rar} ${v}`}
                                    />
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {tab === "market" && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/30 p-4">
              <div>
                <h2 className="font-bold text-amber-200">🛒 Marché aux cartes</h2>
                <p className="text-xs text-white/60">
                  Prix = base rareté × variante (Prisme ×2, Laser ×4) · ex. Ultra Rare Laser : 2000 Zenis
                </p>
              </div>
              <Button variant="outline" onClick={() => refreshMarket()}>↻ Renouveler le stand</Button>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {marketStock.length === 0 && (
                <p className="col-span-full py-8 text-center text-white/40">
                  Rien en stock — renouvelez le stand ou collection complète !
                </p>
              )}
              {marketStock.map((k) => {
                const [sid, cid, rar, variant] = k.split("|");
                const s = seriesOf(sid);
                const def = s.cards.find((c) => c.id === cid)!;
                const oc: OpenedCard = { ...def, rarity: rar as Rarity, variant: variant as Variant, series: sid };
                const price = marketPrice(rar as Rarity, variant as Variant);
                return (
                  <div key={k} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-2">
                    <div className="flex items-center gap-2">
                      <CardFace card={oc} size="sm" onZoom={() => setZoom(oc)} />
                      <div>
                        <div className="text-sm font-bold">{def.name}</div>
                        <div className="text-[10px] text-white/50">
                          {s.short} · {rar} · {variant}
                        </div>
                        <div className="text-[10px] text-amber-300">💰 {price} Zenis</div>
                      </div>
                    </div>
                    <Button size="sm" disabled={zenis < price} onClick={() => buyFromMarket(k)}>
                      Acheter
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === "shenron" && (
          <div className="flex flex-col gap-4">
            <div className="relative overflow-hidden rounded-xl border border-white/10">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRf9MnTe_9Kb6H2eazCqRkXRN6-EBP0QWSLNlDX_07WkA&s=10"
                alt="Shenron"
                className="h-40 w-full object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black/80" />
              <div className="absolute bottom-0 left-0 w-full p-4 text-center">
                <div className="font-display text-2xl tracking-wide text-yellow-400 text-shadow-gold">
                  SHENRON
                </div>
                <p className="text-xs text-white/70">
                  Réunissez les 7 Dragon Balls pour invoquer Shenron et exaucer un vœu
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-center">
              <div className="mb-3 flex justify-center gap-2">
                {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                  <div key={n} className="flex flex-col items-center gap-1">
                    <DragonBallIcon stars={n} owned={balls.includes(n)} />
                    <span className="text-[8px] text-white/40">{n}★</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-white/60">
                Chaque pack a 45% de chance de contenir une Dragon Ball. Réunissez les 7 pour invoquer
                Shenron : une Ultra Rare ou MAX <b>version Prisme</b> gratuite !
              </p>
            </div>

            {wishGranted && (
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                className="flex items-center justify-center gap-4 rounded-xl border border-amber-400/50 bg-amber-500/10 p-4"
              >
                <CardFace card={wishGranted} size="lg" />
                <div>
                  <p className="font-black text-amber-300">🐉 Vœu exaucé !</p>
                  <p className="text-sm">
                    {wishGranted.name} — <b>{wishGranted.rarity} Prisme</b>
                  </p>
                  <p className="text-xs text-white/50">{seriesOf(wishGranted.series).name}</p>
                </div>
              </motion.div>
            )}

            {ballsComplete && !wishPhase && (
              <Button className="mx-auto w-fit text-lg" onClick={summonShenron}>
                🐉 INVOQUER SHENRON
              </Button>
            )}

            {wishPhase && (
              <div className="rounded-xl border border-amber-400/50 bg-black/40 p-4">
                <h2 className="mb-3 text-center text-lg font-black text-amber-300">
                  FAITES UN VŒU — CHOISISSEZ VOTRE CARTE
                </h2>
                <div className="flex flex-wrap justify-center gap-2">
                  {missingCombos()
                    .filter((m) => (m.rarity === "Peel-off" || m.rarity === "Ultra-Rare" || m.rarity === "Gold") && m.variant === "Normale")
                    .slice(0, 40)
                    .map((m) => (
                      <Button
                        key={`${m.series}|${m.card.id}|${m.rarity}`}
                        variant="outline"
                        onClick={() => makeWish(m.series, m.card.id, m.rarity)}
                      >
                        {m.card.emoji} {m.card.name}
                        <span className="ml-1 text-[10px] text-amber-300">{m.rarity === "Gold" ? "GOLD" : m.rarity === "Ultra-Rare" ? "UR" : "UR"}</span>
                        <span className="text-white/40">({seriesOf(m.series).short})</span>
                      </Button>
                    ))}
                </div>
              </div>
            )}

            {!ballsComplete && (
              <p className="text-center text-sm text-white/40">
                Il vous manque {7 - balls.length} boule{7 - balls.length > 1 ? "s" : ""} pour invoquer Shenron...
              </p>
            )}
          </div>
        )}

        {tab === "duel" && (
          <Duel
            collection={collection}
            zenis={zenis}
            onWin={duelWin}
            onLose={duelLose}
            playSound={playSound}
            playerLevel={playerLevel}
          />
        )}

        {tab === "capsule" && (
          <CapsuleCorp
            collection={collection}
            onFuse={fuseCards}
            onAddCard={(card) => addCards([card])}
            playSound={playSound}
            seriesData={seriesDataForCapsule}
            renderCard={(card, size) => <CardFace card={card} size={size} />}
            onZoomCard={(card) => setZoom(card)}
            zenis={zenis}
            onGravityTrain={gravityTrain}
          />
        )}

        {tab === "stats" && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: "Packs ouverts", value: stats.packs, icon: "🎴" },
                { label: "Zenis dépensés", value: stats.spent, icon: "💸" },
                { label: "Zenis gagnés", value: stats.earned, icon: "💰" },
                { label: "Doublons vendus", value: stats.sells, icon: "🔄" },
                { label: "Achats marché", value: stats.buys, icon: "🛒" },
                { label: "Vœux exaucés", value: stats.wishes, icon: "🐉" },
                { label: "Boules trouvées", value: stats.ballsFound, icon: "🌟" },
                { label: "Cartes Gold", value: collection.filter((c) => c.rarity === "Gold").length, icon: "👑" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-white/10 bg-black/30 p-3 text-center">
                  <div className="text-2xl">{s.icon}</div>
                  <div className="text-lg font-black text-amber-200">{s.value}</div>
                  <div className="text-[10px] text-white/50">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-4">
              <h3 className="mb-3 text-sm font-bold text-amber-200">🏆 Succès ({unlockedAchievements.length}/{ACHIEVEMENTS.length})</h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {ACHIEVEMENTS.map((a) => {
                  const unlocked = unlockedAchievements.includes(a);
                  return (
                    <div
                      key={a.id}
                      className={`flex items-center gap-2 rounded-lg border p-2 transition ${
                        unlocked
                          ? "border-amber-400/50 bg-amber-500/10"
                          : "border-white/10 bg-black/40 opacity-40"
                      }`}
                    >
                      <span className={`text-xl ${unlocked ? "" : "grayscale"}`}>{a.icon}</span>
                      <div className="min-w-0">
                        <div className="truncate text-[10px] font-bold text-white/80">{a.name}</div>
                        <div className="truncate text-[8px] text-white/50">{a.desc}</div>
                      </div>
                      {unlocked && <span className="ml-auto text-[10px] text-amber-400">✓</span>}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-4">
              <h3 className="mb-3 text-sm font-bold text-amber-200">📊 Complétion par série</h3>
              <div className="flex flex-col gap-3">
                {SERIES.map((s) => {
                  const pct = (seriesOwned(s.id) / seriesTotal(s.id)) * 100;
                  const complete = pct >= 100;
                  const promoClaimed = promosClaimed.includes(s.id);
                  return (
                    <div key={s.id}>
                      <div className="mb-1 flex justify-between text-[11px]">
                        <span className="font-bold">{s.short}</span>
                        <span className="text-white/60">
                          {seriesOwned(s.id)}/{seriesTotal(s.id)} ({pct.toFixed(0)}%)
                        </span>
                      </div>
                      <Progress value={pct} className="h-2" />
                      {complete && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={promoClaimed}
                          onClick={() => claimPromo(s.id)}
                          className="mt-1 w-full text-[10px]"
                        >
                          {promoClaimed ? "✓ Promo réclamée" : "🎁 Réclamer la carte promo exclusive !"}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ------- ZOOM CARTE (avec retournement 3D) ------- */}
        <AnimatePresence>
          {zoom && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
              onClick={() => { setZoom(null); setCardFlipped(false); }}
            >
              <motion.div
                initial={{ scale: 0.6, rotate: -6 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0.7, opacity: 0 }}
                transition={{ type: "spring", bounce: 0.35 }}
                className="flex max-h-full flex-col items-center gap-4 overflow-auto p-4 sm:flex-row"
                onClick={(e) => e.stopPropagation()}
              >
                {/* 3D Flip Card */}
                <div className="flip-card" style={{ width: zoom.layout === "landscape" ? 320 : 224, height: zoom.layout === "landscape" ? 224 : 320 }}>
                  <div
                    className={`flip-card-inner ${cardFlipped ? "flipped" : ""}`}
                    onClick={() => setCardFlipped((f) => !f)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="flip-card-face">
                      <CardFace card={zoom} size="lg" />
                    </div>
                    <div className="flip-card-face flip-card-back">
                      <CardBack card={zoom} size="lg" />
                    </div>
                  </div>
                </div>
                <div className="w-56 rounded-xl border border-white/10 bg-black/60 p-4">
                  <h3 className="text-lg font-black text-white">{zoom.name}</h3>
                  <p className="mt-1 text-[10px] text-amber-300/60">Cliquez la carte pour la retourner ↔️</p>
                  <div className="mt-2 space-y-1 text-xs text-white/70">
                    <p>
                      <span className="text-white/40">Série :</span> {seriesOf(zoom.series).name}
                    </p>
                    <p className="text-white/40">{seriesOf(zoom.series).era}</p>
                    <p>
                      <span className="text-white/40">Rareté :</span>{" "}
                      <b className={RARITIES[zoom.rarity].badge.split(" ")[1]}>{zoom.rarity}</b>
                    </p>
                    <p>
                      <span className="text-white/40">Version :</span>{" "}
                      <b className={zoom.variant === "Laser" ? "text-cyan-200" : zoom.variant === "Prisme" ? "text-fuchsia-200" : "text-slate-200"}>
                        {zoom.variant}
                      </b>
                    </p>
                    <p>
                      <span className="text-white/40">Capacité :</span> {zoom.power}
                    </p>
                    <p className="text-amber-200">{zoom.powerLevel}</p>
                    {"count" in zoom && (
                      <p>
                        <span className="text-white/40">Possédées :</span> ×{zoom.count}
                      </p>
                    )}
                  </div>
                  {"count" in zoom && zoom.count > 1 && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3 w-full"
                      onClick={() => {
                        sellDupe(zoom as OwnedCard);
                        setZoom(null);
                      }}
                    >
                      Vendre 1 doublon (+{RARITIES[zoom.rarity].sell * VARIANT_MULT[zoom.variant]} 💰)
                    </Button>
                  )}
                  <Button size="sm" className="mt-2 w-full" variant="outline" onClick={() => { setZoom(null); setCardFlipped(false); }}>
                    Fermer
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ------- INVOCATION SHENRON ------- */}
        <AnimatePresence>
          {summoning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-black/95"
            >
              <motion.div
                className="absolute inset-0"
                style={{
                  background: "radial-gradient(circle, rgba(34,197,94,0.35), transparent 60%)",
                }}
                animate={{ opacity: [0.2, 0.7, 0.2] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
              {/* Éclairs */}
              <motion.div
                className="absolute inset-x-0 h-40 bg-white/70"
                animate={{ opacity: [0, 0.8, 0], scaleY: [0.2, 1, 0.2] }}
                transition={{ duration: 0.25, repeat: 3, repeatDelay: 0.6 }}
              />
              <motion.div
                initial={{ y: 300, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="relative z-10 flex flex-col items-center gap-2"
              >
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRf9MnTe_9Kb6H2eazCqRkXRN6-EBP0QWSLNlDX_07WkA&s=10"
                  alt="Shenron"
                  className="h-64 w-auto object-contain drop-shadow-[0_0_40px_rgba(34,197,94,0.8)]"
                />
                <motion.span
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="font-display text-3xl tracking-widest text-yellow-400 text-shadow-gold"
                >
                  SHENRON !
                </motion.span>
                <span className="font-body text-xs text-white/50">
                  « Dis-moi ton vœu... je t'exaucerai n'importe lequel ! »
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <footer className="mx-auto mt-4 max-w-4xl px-2 pb-6 text-center">
        <p className="font-body text-[10px] leading-relaxed text-white/40">
          Dragon Ball Nostalgic Carddass est un projet de fan, entièrement gratuit.
          <br />
          La licence Dragon Ball appartient à la Shueisha.
        </p>
        <p className="mt-2 font-body text-[9px] leading-relaxed text-white/30">
          Un grand merci à ces sites qui ont permis d'alimenter ce jeu :
          <br />
          <a href="http://dbzcollection.fr" className="text-amber-400/50 hover:text-amber-400/80">dbzcollection.fr</a>
          {" · "}
          <a href="https://retroballz.net" className="text-amber-400/50 hover:text-amber-400/80">retroballz.net</a>
          {" · "}
          <a href="https://adali.fr" className="text-amber-400/50 hover:text-amber-400/80">adali.fr</a>
          {" · "}
          <a href="https://www.jaw-collectibles.com" className="text-amber-400/50 hover:text-amber-400/80">jaw-collectibles.com</a>
        </p>
      </footer>
    </div>
  );
}
