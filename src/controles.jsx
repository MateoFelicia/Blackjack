import React from "react";

export default function Controls({ onHit, onStand, onRestart, disabled, gameOver }) {
    return (
        <div style={{ marginTop: "1rem" }}>
            <button
                onClick={onHit}
                disabled={disabled || gameOver}
                style={{
                    margin: "0 5px",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    backgroundColor: "#2196f3",
                    color: "white",
                    border: "none",
                    cursor: disabled ? "not-allowed" : "pointer",
                }}
            >
                Pedir carta
            </button>

            <button
                onClick={onStand}
                disabled={disabled || gameOver}
                style={{
                    margin: "0 5px",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    backgroundColor: "#4caf50",
                    color: "white",
                    border: "none",
                    cursor: disabled ? "not-allowed" : "pointer",
                }}
            >
                Plantarse
            </button>

            <button
                onClick={onRestart}
                style={{
                    margin: "0 5px",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    backgroundColor: "#9c27b0",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                }}
            >
                Nueva partida
            </button>
        </div>
    );
}
