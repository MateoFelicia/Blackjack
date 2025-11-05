import React, { useState } from "react";

export default function StartScreen({ onStart }) {
    const [deckCount, setDeckCount] = useState(1);
    const [difficulty, setDifficulty] = useState("normal");

    const handleStart = () => {
        onStart({ deckCount, difficulty });
    };

    return (
        <div className="start-container">
            <h1>🃏 Blackjack React</h1>
            <div className="config">
                <label>
                    Número de mazos:
                    <input
                        type="number"
                        min="1"
                        max="8"
                        value={deckCount}
                        onChange={(e) => setDeckCount(Number(e.target.value))}
                    />
                </label>

                <label>
                    Dificultad:
                    <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                    >
                        <option value="easy">Fácil</option>
                        <option value="normal">Normal</option>
                        <option value="hard">Difícil</option>
                    </select>
                </label>
            </div>

            <button className="start-btn" onClick={handleStart}>
                Comenzar partida
            </button>
        </div>
    );
}
