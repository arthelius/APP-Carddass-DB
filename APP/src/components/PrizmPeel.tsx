import { useState } from "react";
import { motion } from "framer-motion";

type Props = {
  children: React.ReactNode;
  onReveal: () => void;
};

/**
 * Effet "Prizm Peel" : un autocollant que l'on décolle pour révéler une carte prisme.
 * Inspiré des Carddass Super Battle où un premier autocollant cachait la version prisme.
 */
export default function PrizmPeel({ children, onReveal }: Props) {
  const [peeled, setPeeled] = useState(false);
  const [peeling, setPeeling] = useState(false);

  const handlePeel = () => {
    if (peeled) return;
    setPeeling(true);
    setTimeout(() => {
      setPeeled(true);
      setPeeling(false);
      onReveal();
    }, 600);
  };

  return (
    <div className="relative">
      {children}
      {!peeled && (
        <motion.div
          className="absolute inset-0 z-20 flex cursor-pointer items-center justify-center overflow-hidden rounded-xl"
          onClick={handlePeel}
          initial={false}
          animate={peeling ? { y: -40, rotateZ: -8, opacity: 0 } : { y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{
            background: "linear-gradient(135deg, #d97706, #f59e0b, #fcd34d, #f59e0b, #d97706)",
            boxShadow: "inset 0 0 20px rgba(0,0,0,0.3)",
          }}
        >
          {/* Texture d'autocollant */}
          <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(255,255,255,0.15)_4px,rgba(255,255,255,0.15)_8px)]" />
          <div className="relative text-center">
            <div className="text-2xl">✨</div>
            <div className="font-display text-sm tracking-wide text-orange-900 text-shadow-db">
              PEEL TO REVEAL
            </div>
            <div className="font-heading text-[8px] tracking-widest text-orange-950/70">
              DÉCOLLEZ-MOI
            </div>
          </div>
          {/* Coin décollé */}
          <div className="absolute bottom-0 right-0 h-6 w-6 rounded-tl-lg bg-gradient-to-br from-amber-200 to-amber-500 shadow-lg" />
        </motion.div>
      )}
      {peeling && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-30"
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(253,224,71,0.4),transparent_70%)]" />
        </motion.div>
      )}
    </div>
  );
}
