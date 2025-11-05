import React from "react";

export default function Scoreboard({ score, onRestart }) {
    return (
        <div className="scoreboard">
            <div>Jugador: {score.player}</div>
            <div>Crupier: {score.dealer}</div>
            <div>Empates: {score.draw}</div>
            <button onClick={onRestart}>🏠 Volver al inicio</button>
        </div>
    );
}
