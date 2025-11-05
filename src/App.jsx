import Mesa from "./mesa.jsx";
import './styles.css';
import React, { useState } from "react";
import PantallaInicio from "./PantallaInicio.jsx";
import { AnimatePresence, motion } from "framer-motion";


export default function App() {
  const [config, setConfig] = useState(null);

  return (
    <div className="app-container">
      <AnimatePresence mode="wait">
        {!config ? (
          <motion.div
            key="start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
          >
            <PantallaInicio onStart={setConfig} />
          </motion.div>
        ) : (
          <motion.div
            key="mesa"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
          >
            <Mesa config={config} onRestart={() => setConfig(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
