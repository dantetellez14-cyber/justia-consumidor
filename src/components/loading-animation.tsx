"use client";

import { motion } from "framer-motion";
import { Scale } from "lucide-react";

export function LoadingAnimation() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <Scale className="h-12 w-12 text-blue-500" />
      </motion.div>
      <motion.p
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="mt-4 text-sm font-medium text-slate-500"
      >
        Analizando tu caso con IA...
      </motion.p>
      <div className="mt-3 flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{
              repeat: Infinity,
              duration: 0.6,
              delay: i * 0.2,
            }}
            className="h-2 w-2 rounded-full bg-blue-400"
          />
        ))}
      </div>
    </div>
  );
}
