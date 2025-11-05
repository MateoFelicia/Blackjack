
import React from "react";
import './styles.css';

export default function Controles({ hit, stand, newGame, isPlayerTurn, gameOver }) {
    return (
        <div className="controles">
            <button className="control-btn btn-hit" onClick={hit} disabled={!isPlayerTurn || gameOver}>
                Pedir carta
            </button>
            <button className="control-btn btn-stand" onClick={stand} disabled={!isPlayerTurn || gameOver}>
                Plantarse
            </button>
            <button className="control-btn btn-new" onClick={newGame}>
                Nuevo juego
            </button>
        </div>
    );
}
