import React, { useState, useEffect } from "react";
import { createDeck, drawCards } from "./api";

export default function Mesa() {
    const [deckId, setDeckId] = useState(null);
    const [player, setPlayer] = useState([]);
    const [dealer, setDealer] = useState([]);
    const [hidden, setHidden] = useState(null);
    const [message, setMessage] = useState("");
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);

    // Calcular el valor total de una mano
    const getValue = (hand) => {
        let total = 0;
        let aces = 0;
        for (const c of hand) {
            if (["KING", "QUEEN", "JACK"].includes(c.value)) total += 10;
            else if (c.value === "ACE") {
                total += 11;
                aces++;
            } else total += parseInt(c.value);
        }
        while (total > 21 && aces > 0) {
            total -= 10;
            aces--;
        }
        return total;
    };

    // Inicializar mazo y repartir
    useEffect(() => {
        async function initGame() {
            const deck = await createDeck(1);
            setDeckId(deck.deck_id);
            const draw = await drawCards(deck.deck_id, 4);
            const cards = draw.cards;
            setPlayer([cards[0], cards[2]]);
            setDealer([cards[1]]);
            setHidden(cards[3]);
        }
        initGame();
    }, []);

    const handleHit = async () => {
        if (!deckId || !isPlayerTurn) return;
        const res = await drawCards(deckId, 1);
        const newCard = res.cards[0];
        const newHand = [...player, newCard];
        setPlayer(newHand);

        if (getValue(newHand) > 21) {
            setMessage("Te pasaste. Pierdes.");
            setIsPlayerTurn(false);
        }
    };

    const handleStand = async () => {
        if (!deckId) return;
        setIsPlayerTurn(false);
        let dealerHand = [...dealer, hidden];
        setHidden(null);
        while (getValue(dealerHand) < 17) {
            const res = await drawCards(deckId, 1);
            dealerHand.push(res.cards[0]);
        }
        setDealer(dealerHand);

        const p = getValue(player);
        const d = getValue(dealerHand);

        if (d > 21 || p > d) setMessage("Ganaste!");
        else if (p < d) setMessage("Gana el crupier.");
        else setMessage("Empate.");
    };

    return (
        <div>
            <h2>Mesa</h2>
            <p>Jugador: {getValue(player)}</p>
            <div>
                {player.map((c) => (
                    <img key={c.code} src={c.image} alt={c.value} width={80} />
                ))}
            </div>

            <hr />

            <p>Crupier: {isPlayerTurn ? "?" : getValue([...dealer, hidden].filter(Boolean))}</p>
            <div>
                {dealer.map((c) => (
                    <img key={c.code} src={c.image} alt={c.value} width={80} />
                ))}
                {hidden && isPlayerTurn && <img src="https://deckofcardsapi.com/static/img/back.png" width={80} />}
                {!isPlayerTurn && hidden && (
                    <img src={hidden.image} alt={hidden.value} width={80} />
                )}
            </div>

            <div style={{ marginTop: "1rem" }}>
                {isPlayerTurn ? (
                    <>
                        <button onClick={handleHit}>Pedir carta</button>
                        <button onClick={handleStand}>Plantarse</button>
                    </>
                ) : (
                    <p>{message}</p>
                )}
            </div>
        </div>
    );
}
