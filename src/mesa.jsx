import React, { useState, useEffect } from "react";
import { createDeck, drawCards } from "./api";
import Mano from "./mano.jsx";
import Controles from "./controles.jsx";

export default function Mesa({ config = { deckCount: 1 } }) {
    const [deckId, setDeckId] = useState(null);
    const [player, setPlayer] = useState([]);
    const [dealer, setDealer] = useState([]);
    const [hiddenCard, setHiddenCard] = useState(null);
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [gameOver, setGameOver] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const calculateHandValue = (hand) => {
        let value = 0;
        let aces = 0;
        for (const card of hand) {
            if (["KING", "QUEEN", "JACK"].includes(card.value)) value += 10;
            else if (card.value === "ACE") {
                value += 11;
                aces += 1;
            } else value += parseInt(card.value);
        }
        while (value > 21 && aces > 0) {
            value -= 10;
            aces -= 1;
        }
        return value;
    };

    const isBlackjack = (hand) =>
        hand.length === 2 && calculateHandValue(hand) === 21;

    const initGame = async () => {
        setLoading(true);
        setMessage("");
        setGameOver(false);
        setIsPlayerTurn(true);
        try {
            const deck = await createDeck(config.deckCount || 1);
            setDeckId(deck.deck_id);
            const draw = await drawCards(deck.deck_id, 4);
            const cards = draw.cards;
            const playerHand = [cards[0], cards[2]];
            const dealerHand = [cards[1]];
            setHiddenCard(cards[3]);
            setPlayer(playerHand);
            setDealer(dealerHand);

            if (isBlackjack(playerHand)) {
                setDealer([...dealerHand, cards[3]]);
                setHiddenCard(null);
                setMessage("¡Blackjack! Ganaste 🎉");
                setIsPlayerTurn(false);
                setGameOver(true);
            }
        } catch (err) {
            console.error(err);
            setMessage("Error al inicializar el mazo.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        initGame();
    }, []);

    const hit = async () => {
        if (!isPlayerTurn || gameOver) return;
        const res = await drawCards(deckId, 1);
        const newHand = [...player, res.cards[0]];
        setPlayer(newHand);
        if (calculateHandValue(newHand) > 21) {
            setMessage("Te pasaste 😢");
            setIsPlayerTurn(false);
            setGameOver(true);
        }
    };

    const stand = async () => {
        if (!isPlayerTurn || gameOver) return;
        setIsPlayerTurn(false);
        let dealerHand = [...dealer, hiddenCard];
        let dealerValue = calculateHandValue(dealerHand);
        while (dealerValue < 17) {
            const res = await drawCards(deckId, 1);
            dealerHand.push(res.cards[0]);
            dealerValue = calculateHandValue(dealerHand);
        }
        setDealer(dealerHand);
        setHiddenCard(null);
        const playerValue = calculateHandValue(player);
        let msg = "";
        if (dealerValue > 21) msg = "El crupier se pasó. ¡Ganaste! 🎉";
        else if (dealerValue === playerValue) msg = "Empate 🤝";
        else if (playerValue > dealerValue) msg = "Ganaste 🎉";
        else msg = "Perdiste 😔";
        setMessage(msg);
        setGameOver(true);
    };

    const restart = () => {
        setPlayer([]);
        setDealer([]);
        setHiddenCard(null);
        initGame();
    };

    return (
        <div
            style={{
                textAlign: "center",
                padding: "2rem",
                background: "#1b1b1b",
                color: "#fff",
                minHeight: "100vh",
            }}
        >
            <h2 style={{ marginBottom: "1.5rem" }}>♣️ Mesa de Blackjack ♠️</h2>
            {loading ? (
                <p>Cargando mazo...</p>
            ) : (
                <>
                    <Mano
                        title="Crupier"
                        cards={dealer}
                        hiddenCard={!gameOver ? hiddenCard : null}
                        showValue={gameOver}
                        value={calculateHandValue(dealer)}
                    />
                    <Mano
                        title="Jugador"
                        cards={player}
                        value={calculateHandValue(player)}
                        showValue={true}
                    />
                    {message && <h4 style={{ margin: "1rem 0" }}>{message}</h4>}
                    <Controles
                        onHit={hit}
                        onStand={stand}
                        onRestart={restart}
                        disabled={!isPlayerTurn}
                        gameOver={gameOver}
                    />
                </>
            )}
        </div>
    );
}
