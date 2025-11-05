import React from 'react';
import { motion } from 'framer-motion';

export default function Hand({ hand, hiddenCard, revealHidden }) {
    return (
        <div className="hand">
            {hand.map((card, i) => (
                <motion.img
                    key={i}
                    src={card.image}
                    alt={card.code}
                    className="card"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                />
            ))}

            {/* Si hay una carta oculta */}
            {hiddenCard && (
                <motion.img
                    key="hidden"
                    src={
                        revealHidden
                            ? hiddenCard.image
                            : 'https://deckofcardsapi.com/static/img/back.png'
                    }
                    alt={revealHidden ? hiddenCard.code : 'hidden'}
                    className="card"
                    initial={{ opacity: 0, rotateY: 180 }}
                    animate={{
                        opacity: 1,
                        rotateY: revealHidden ? 0 : 180,
                        transition: { duration: 0.6 },
                    }}
                />
            )}
        </div>
    );
}
