import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Stats } from "../types";

type Props = {
  zenis: number;
  collectionCount: number;
  totalCards: number;
  ballsCount: number;
  stats: Stats;
  seriesProgress: { name: string; short: string; owned: number; total: number; pct: number }[];
  onStart: () => void;
  onExport: () => void;
  onImport: (data: string) => void;
  onReset: () => void;
  hasSave: boolean;
};

export default function TitleScreen({
  zenis,
  collectionCount,
  totalCards,
  ballsCount,
  stats,
  seriesProgress,
  onStart,
  onExport,
  onImport,
  onReset,
  hasSave,
}: Props) {
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAllSeries, setShowAllSeries] = useState(false);

  const handleCopy = () => {
    onExport();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = () => {
    onImport(importText);
    setImportText("");
    setShowImport(false);
  };

  return (
    <div className="min-h-screen p-6 text-white" style={{ background: "radial-gradient(circle at top, #14532d, #020617)" }}>
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 py-8">
        {/* Titre */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="text-center"
        >
          <div className="mb-2 text-6xl">🐉</div>
          <h1 className="font-display text-5xl tracking-wide text-yellow-400 text-shadow-db">
            DRAGON BALL
          </h1>
          <h2 className="font-heading text-xl tracking-widest text-red-500">
            NOSTALGIC CARDDASS
          </h2>
          <p className="mt-2 font-body text-sm text-white/50">
            Hommage aux Carddass Bandai 1989–1997
          </p>
        </motion.div>

        {/* Résumé de la sauvegarde */}
        {hasSave ? (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-lg rounded-xl border border-white/10 bg-black/40 p-5"
          >
            <div className="mb-4 flex flex-wrap justify-center gap-2">
              <Badge className="bg-yellow-500/20 text-amber-200">💰 {zenis} Zenis</Badge>
              <Badge className="bg-white/10 text-white">⚡ {collectionCount}/{totalCards} cartes</Badge>
              <Badge className="bg-orange-500/20 text-orange-200">🌟 {ballsCount}/7 boules</Badge>
              <Badge className="bg-green-500/20 text-green-200">🎴 {stats.packs} packs</Badge>
              <Badge className="bg-blue-500/20 text-blue-200">🐉 {stats.wishes} vœux</Badge>
            </div>

            <Button className="mb-4 w-full text-lg" onClick={onStart}>
              <span className="font-heading">▶ CONTINUER</span>
            </Button>

            <div className="mb-1 flex items-center justify-between">
              <h3 className="font-heading text-xs tracking-widest text-amber-200">📊 COMPLÉTION DES SÉRIES</h3>
              <button
                type="button"
                onClick={() => setShowAllSeries((value) => !value)}
                className="text-[10px] font-bold text-cyan-300 transition hover:text-cyan-100"
              >
                {showAllSeries ? "Réduire" : `Voir les ${seriesProgress.length}`}
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto pr-1">
              {(showAllSeries ? seriesProgress : seriesProgress.slice(0, 6)).map((s) => (
                <div key={s.short} className="mb-2">
                  <div className="mb-0.5 flex justify-between text-[10px]">
                    <span className="font-bold">{s.short}</span>
                    <span className="text-white/60">{s.owned}/{s.total} ({s.pct.toFixed(0)}%)</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-black/60">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${s.pct}%`,
                        background: s.pct === 100 ? "linear-gradient(to right,#22c55e,#16a34a)" : "linear-gradient(to right,#f97316,#fcd34d)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-lg rounded-xl border border-white/10 bg-black/40 p-5 text-center"
          >
            <p className="font-body text-sm text-white/60">
              Aucune sauvegarde trouvée. Commencez une nouvelle partie !
            </p>
            <Button className="mt-4 w-full text-lg" onClick={onStart}>
              <span className="font-heading">▶ NOUVELLE PARTIE</span>
            </Button>
          </motion.div>
        )}

        {/* Gestion de sauvegarde */}
        <div className="flex flex-wrap justify-center gap-2">
          {hasSave && (
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? "✓ Copié !" : "📋 Copier la sauvegarde"}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => setShowImport(!showImport)}>
            📥 Importer une sauvegarde
          </Button>
          {hasSave && (
            <Button
              variant="outline"
              size="sm"
              className="border-red-400/50 text-red-300 hover:bg-red-500/20"
              onClick={() => setConfirmReset(!confirmReset)}
            >
              ↺ Réinitialiser
            </Button>
          )}
        </div>

        {/* Zone d'import */}
        {showImport && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="w-full max-w-lg rounded-xl border border-white/10 bg-black/40 p-4"
          >
            <h3 className="mb-2 font-heading text-xs tracking-widest text-amber-200">
              COLLER LE CODE DE SAUVEGARDE
            </h3>
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Collez ici le code de sauvegarde..."
              className="h-24 w-full rounded-lg border border-white/20 bg-black/60 p-2 text-xs text-white/80 outline-none focus:border-amber-400"
            />
            <Button size="sm" className="mt-2 w-full" onClick={handleImport} disabled={!importText.trim()}>
              Importer
            </Button>
          </motion.div>
        )}

        {/* Confirmation reset */}
        {confirmReset && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg rounded-xl border border-red-400/50 bg-red-500/10 p-4 text-center"
          >
            <p className="mb-3 font-body text-sm text-red-200">
              Êtes-vous sûr ? Toute votre collection sera définitivement perdue.
            </p>
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-red-400 text-red-300"
                onClick={() => { onReset(); setConfirmReset(false); }}
              >
                Oui, réinitialiser
              </Button>
              <Button variant="outline" size="sm" onClick={() => setConfirmReset(false)}>
                Annuler
              </Button>
            </div>
          </motion.div>
        )}

        <p className="font-body text-[10px] text-white/30">
          Dragon Ball Nostalgic Carddass · Prototype non commercial · Hommage
        </p>
      </div>
    </div>
  );
}
