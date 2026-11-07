import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { OwnedCard, Rarity, Variant } from "../types";

type Props = {
  collection: OwnedCard[];
  onFuse: (consumed: OwnedCard[], result: { name: string; emoji: string; rarity: Rarity; variant: Variant }) => void;
  onAddCard: (card: OwnedCard) => void;
  playSound: (type: string) => void;
  seriesData: { id: string; name: string; short: string; cards: { id: string; name: string; emoji: string }[] }[];
  renderCard: (card: OwnedCard, size?: "sm" | "md" | "lg") => React.ReactNode;
  onZoomCard: (card: OwnedCard) => void;
  zenis: number;
  onGravityTrain: (card: OwnedCard) => { success: boolean; newVariant: Variant };
};

const FUSE_COST = 3;
const GRAVITY_COST = 300;

export default function CapsuleCorp({ collection, onFuse, onAddCard, playSound, seriesData, renderCard, onZoomCard, zenis, onGravityTrain }: Props) {
  const [selected, setSelected] = useState<OwnedCard[]>([]);
  const [result, setResult] = useState<OwnedCard | null>(null);
  const [fusing, setFusing] = useState(false);
  const [mode, setMode] = useState<"fusion" | "gravity">("fusion");
  const [gravityCard, setGravityCard] = useState<OwnedCard | null>(null);
  const [gravityResult, setGravityResult] = useState<{ success: boolean; newVariant: Variant } | null>(null);
  const [training, setTraining] = useState(false);

  const dupes = collection.filter((c) => c.count > 1);

  const toggleCard = (card: OwnedCard) => {
    if (selected.find((c) => c.id === card.id && c.series === card.series && c.rarity === card.rarity && c.variant === card.variant)) {
      setSelected(selected.filter((c) => !(c.id === card.id && c.series === card.series && c.rarity === card.rarity && c.variant === card.variant)));
    } else if (selected.length < FUSE_COST) {
      setSelected([...selected, card]);
    }
  };

  const canFuse = selected.length === FUSE_COST;

  const fuse = () => {
    if (!canFuse) return;
    setFusing(true);
    playSound("katchunk");

    const isAllCommon = selected.every((c) => c.rarity === "Commun" || c.rarity === "Uncommon");
    const rewardRarity: Rarity = isAllCommon ? "Prism" : "Peel-off";
    const rewardVariant: Variant = Math.random() < 0.5 ? "Prisme" : "Normale";

    const allCards = seriesData.flatMap((s) =>
      s.cards.map((c) => ({ ...c, series: s.id, rarity: rewardRarity, variant: rewardVariant, count: 1, art: "", power: "", powerLevel: "" }))
    );
    const reward = allCards[Math.floor(Math.random() * allCards.length)] as OwnedCard;

    setTimeout(() => {
      setFusing(false);
      setResult(reward);
      onFuse(selected, { name: reward.name, emoji: reward.emoji, rarity: reward.rarity, variant: reward.variant });
      onAddCard(reward);
      playSound("max");
      setSelected([]);
    }, 1500);
  };

  const startGravity = () => {
    if (!gravityCard || zenis < GRAVITY_COST) return;
    setTraining(true);
    playSound("katchunk");
    setTimeout(() => {
      const res = onGravityTrain(gravityCard);
      setTraining(false);
      setGravityResult(res);
      if (res.success) playSound("max");
      else playSound("rare");
    }, 1200);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Mode selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode("fusion")}
          className={`flex-1 rounded-lg border px-3 py-2 text-xs font-bold transition ${
            mode === "fusion" ? "border-cyan-400 bg-cyan-500/20 text-cyan-200" : "border-white/10 bg-white/5 text-white/50"
          }`}
        >
          🔄 Recyclage (3 doublons)
        </button>
        <button
          onClick={() => setMode("gravity")}
          className={`flex-1 rounded-lg border px-3 py-2 text-xs font-bold transition ${
            mode === "gravity" ? "border-orange-400 bg-orange-500/20 text-orange-200" : "border-white/10 bg-white/5 text-white/50"
          }`}
        >
          💪 Chambre à Gravité (300 💰)
        </button>
      </div>

      {mode === "fusion" && (
        <>
          <div className="rounded-xl border border-cyan-400/30 bg-black/30 p-4">
            <h2 className="font-heading text-sm tracking-widest text-cyan-300">🔬 RECYCLAGE CAPSULE</h2>
            <p className="mt-1 text-xs text-white/60">
              Fusionnez {FUSE_COST} doublons pour obtenir une <b className="text-amber-300">capsule</b> avec une carte garantie
              <b className="text-purple-300">Prism</b> ou <b className="text-amber-300">Peel-off</b>, 50% <b className="text-fuchsia-300">Prisme</b>.
            </p>
            <div className="mt-2 flex gap-2 text-[10px]">
              <span className="rounded bg-cyan-500/20 px-2 py-0.5 text-cyan-200">Sélection : {selected.length}/{FUSE_COST}</span>
              <span className="rounded bg-amber-500/20 px-2 py-0.5 text-amber-200">Doublons : {dupes.length}</span>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/30 p-4">
            <div className="mb-3 flex items-center justify-center gap-2">
              {Array.from({ length: FUSE_COST }).map((_, i) => (
                <div
                  key={i}
                  className={`flex h-16 w-12 items-center justify-center rounded-lg border-2 ${
                    selected[i] ? "border-amber-400 bg-amber-500/10" : "border-dashed border-white/20 bg-black/40"
                  }`}
                >
                  {selected[i] ? (
                    <div className="text-center">
                      <div className="text-xl">{selected[i].emoji}</div>
                      <div className="text-[7px] text-white/70">{selected[i].name.slice(0, 8)}</div>
                    </div>
                  ) : (
                    <span className="text-white/20">?</span>
                  )}
                </div>
              ))}
              <span className="text-2xl text-amber-400">→</span>
              <div className="flex h-16 w-12 items-center justify-center rounded-lg border-2 border-cyan-400/50 bg-gradient-to-br from-cyan-500/20 to-blue-700/10">
                {fusing ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} className="text-xl">⚙️</motion.div>
                ) : result ? (
                  <div className="text-center">
                    <div className="text-xl">{result.emoji}</div>
                    <div className="text-[7px] text-amber-300">{result.rarity === "Peel-off" ? "PO" : "PR"}</div>
                  </div>
                ) : (
                  <span className="text-cyan-400/40">🎁</span>
                )}
              </div>
            </div>

            <Button className="w-full" disabled={!canFuse || fusing} onClick={fuse}>
              <span className="font-heading text-xs">⚙️ FUSIONNER</span>
            </Button>

            {result && !fusing && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mt-4 flex flex-col items-center gap-3 rounded-lg border border-amber-400/50 bg-amber-500/10 p-4"
              >
                <p className="font-display text-lg tracking-wide text-yellow-400 text-shadow-gold">🎁 CAPSULE OUVERTE !</p>
                <div onClick={() => onZoomCard(result)} className="cursor-zoom-in">
                  {renderCard(result, "md")}
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-white">{result.emoji} {result.name}</p>
                  <p className="text-[10px] text-amber-300">{result.rarity} · {result.variant}</p>
                  <p className="text-[9px] text-white/40 mt-0.5">Cliquez la carte pour plus de détails</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => setResult(null)}>Continuer</Button>
              </motion.div>
            )}
          </div>

          <div className="rounded-xl border border-white/10 bg-black/30 p-4">
            <h3 className="mb-3 font-heading text-xs tracking-widest text-amber-200">📦 DOUBLONS DISPONIBLES ({dupes.length})</h3>
            {dupes.length === 0 ? (
              <p className="py-6 text-center text-white/40">Aucun doublon à recycler. Ouvrez des packs pour en obtenir !</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {dupes.map((card) => {
                  const isSelected = selected.find((c) => c.id === card.id && c.series === card.series && c.rarity === card.rarity && c.variant === card.variant);
                  return (
                    <button
                      key={`${card.series}|${card.id}|${card.rarity}|${card.variant}`}
                      onClick={() => toggleCard(card)}
                      className={`flex items-center gap-1.5 rounded-lg border p-1.5 text-left transition ${
                        isSelected ? "border-amber-400 bg-amber-500/20" : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <span className="text-base">{card.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[10px] font-bold">{card.name}</div>
                        <div className="text-[9px] text-white/50">{card.rarity} · ×{card.count - 1}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {mode === "gravity" && (
        <>
          <div className="rounded-xl border border-orange-400/30 bg-black/30 p-4">
            <h2 className="font-heading text-sm tracking-widest text-orange-300">💪 CHAMBRE À GRAVITÉ</h2>
            <p className="mt-1 text-xs text-white/60">
              Entraînez une carte (300 Zenis) pour tenter de l'améliorer en <b className="text-fuchsia-300">Prisme</b> ou <b className="text-cyan-300">Laser</b>.
              <br />
              <span className="text-[10px] text-white/40">Normale → 60% Prisme, 30% Laser, 10% échec. Prisme → 40% Laser, 60% échec.</span>
            </p>
            <div className="mt-2 flex gap-2 text-[10px]">
              <span className="rounded bg-amber-500/20 px-2 py-0.5 text-amber-200">💰 {zenis} Zenis</span>
              <span className="rounded bg-orange-500/20 px-2 py-0.5 text-orange-200">Coût : {GRAVITY_COST} 💰</span>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/30 p-4">
            <h3 className="mb-3 font-heading text-xs tracking-widest text-amber-200">1. CHOISIR UNE CARTE</h3>
            {collection.length === 0 ? (
              <p className="py-6 text-center text-white/40">Aucune carte à entraîner.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {collection.map((card) => {
                  const isSelected = gravityCard?.id === card.id && gravityCard?.series === card.series && gravityCard?.rarity === card.rarity && gravityCard?.variant === card.variant;
                  const isMaxVariant = card.variant === "Laser";
                  return (
                    <button
                      key={`${card.series}|${card.id}|${card.rarity}|${card.variant}`}
                      onClick={() => { setGravityCard(card); setGravityResult(null); }}
                      disabled={isMaxVariant}
                      className={`flex items-center gap-1.5 rounded-lg border p-1.5 text-left transition ${
                        isMaxVariant ? "border-white/5 bg-black/40 opacity-30" :
                        isSelected ? "border-orange-400 bg-orange-500/20" : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <span className="text-base">{card.emoji}</span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[10px] font-bold">{card.name}</div>
                        <div className="text-[9px] text-white/50">{card.rarity} · {card.variant}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {gravityCard && (
            <div className="rounded-xl border border-white/10 bg-black/30 p-4">
              <h3 className="mb-3 font-heading text-xs tracking-widest text-amber-200">2. ENTRAÎNER</h3>
              <div className="flex items-center justify-center gap-4">
                <div onClick={() => onZoomCard(gravityCard)} className="cursor-zoom-in">
                  {renderCard(gravityCard, "sm")}
                </div>
                <span className="text-2xl text-orange-400">→</span>
                <div className="flex h-32 w-[5.5rem] items-center justify-center rounded-xl border-2 border-dashed border-orange-400/40 bg-black/40">
                  {training ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.6, repeat: Infinity, ease: "linear" }} className="text-2xl">🌀</motion.div>
                  ) : gravityResult ? (
                    <div className="text-center">
                      <div className="text-xl">{gravityCard.emoji}</div>
                      <div className="text-[8px] text-amber-300">{gravityResult.newVariant}</div>
                    </div>
                  ) : (
                    <span className="text-orange-400/40 text-2xl">?</span>
                  )}
                </div>
              </div>

              <Button
                className="mt-3 w-full"
                disabled={!gravityCard || zenis < GRAVITY_COST || training || gravityCard.variant === "Laser"}
                onClick={startGravity}
              >
                <span className="font-heading text-xs">💪 ENTRAÎNER ({GRAVITY_COST} 💰)</span>
              </Button>

              {gravityResult && !training && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`mt-3 rounded-lg border p-3 text-center ${
                    gravityResult.success ? "border-green-400/50 bg-green-500/10" : "border-red-400/50 bg-red-500/10"
                  }`}
                >
                  <p className="font-display text-base">
                    {gravityResult.success ? `✨ AMÉLIORATION RÉUSSIE ! ${gravityCard.name} est maintenant ${gravityResult.newVariant} !` : "💀 ÉCHEC... La carte n'a pas évolué."}
                  </p>
                  <Button size="sm" variant="outline" className="mt-2" onClick={() => { setGravityResult(null); setGravityCard(null); }}>
                    Continuer
                  </Button>
                </motion.div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
