import React from "react";

export default function Hand({ title, cards, hiddenCard, showValue, value }) {
    return (
        <div style={{ marginBottom: "1rem" }}>
            <h3>{title}</h3>
            <div>
                {cards.map((card, i) => (
                    <img
                        key={i}
                        src={card.image}
                        alt={card.code}
                        style={{
                            width: "80px",
                            margin: "0 4px",
                            borderRadius: "6px",
                            boxShadow: "0 0 6px rgba(0,0,0,0.3)",
                        }}
                    />
                ))}
                {/* Si hay una carta oculta (solo para el dealer mientras el juego está activo) */}
                {hiddenCard && (
                    <img
                        src="https://deckofcardsapi.com/static/img/back.png"
                        alt="oculta"
                        style={{
                            width: "80px",
                            margin: "0 4px",
                            borderRadius: "6px",
                            boxShadow: "0 0 6px rgba(0,0,0,0.3)",
                        }}
                    />
                )}
            </div>
            {showValue && <p>Valor: {value}</p>}
        </div>
    );
}
