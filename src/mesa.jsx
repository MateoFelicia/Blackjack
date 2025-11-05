// src/Mesa.jsx
import React, { useState, useEffect } from "react";
import Mano from "./mano.jsx";
import Controles from "./controles.jsx";
import Scoreboard from "./puntaje.jsx";
import { createDeck, drawCards } from "./api";
import "./styles.css";

export default function Mesa({ config, onRestart }) {
    const [deckId, setDeckId] = useState(null);
    const [player, setPlayer] = useState([]);
    const [dealer, setDealer] = useState([]);
    const [hiddenCard, setHiddenCard] = useState(null);
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(() =>
        JSON.parse(localStorage.getItem("score")) || { player: 0, dealer: 0, draw: 0 }
    );

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

    const updateScore = (result) => {
        const newScore = { ...score };
        if (result === "win") newScore.player++;
        else if (result === "lose") newScore.dealer++;
        else if (result === "draw") newScore.draw++;
        setScore(newScore);
        localStorage.setItem("score", JSON.stringify(newScore));
    };

    const isBlackjack = (hand) => hand.length === 2 && calculateHandValue(hand) === 21;

    const initGame = async () => {
        setLoading(true);
        setGameOver(false);
        setIsPlayerTurn(true);
        setMessage("");
        try {
            const deck = await createDeck(config.deckCount || 1);
            setDeckId(deck.deck_id);
            const draw = await drawCards(deck.deck_id, 4);
            const cards = draw.cards;
            const p = [cards[0], cards[2]];
            const d = [cards[1]];
            setHiddenCard(cards[3]);
            setPlayer(p);
            setDealer(d);

            if (isBlackjack(p)) {
                setDealer([...d, cards[3]]);
                setIsPlayerTurn(false);
                resolveGame(p, [...d, cards[3]]);
            }
        } catch (err) {
            console.error(err);
            setMessage("Error al iniciar el juego.");
        } finally {
            setLoading(false);
        }
    };

    const hit = async () => {
        if (!isPlayerTurn || gameOver) return;
        const res = await drawCards(deckId, 1);
        const newHand = [...player, res.cards[0]];
        setPlayer(newHand);
        const total = calculateHandValue(newHand);
        if (total > 21) {
            setMessage("Te pasaste! Pierdes.");
            setIsPlayerTurn(false);
            setGameOver(true);
            updateScore("lose");
        }
    };

    const dealerTurn = async () => {
        let dealerHand = [...dealer, hiddenCard];
        let dealerValue = calculateHandValue(dealerHand);

        while (true) {
            const soft17 =
                dealerValue === 17 &&
                dealerHand.some((c) => c.value === "ACE" && dealerValue - 10 <= 11);

            const shouldHit =
                (config.difficulty === "easy" && dealerValue < 16) ||
                (config.difficulty === "normal" && dealerValue < 17) ||
                (config.difficulty === "hard" && (dealerValue < 17 || soft17));

            if (!shouldHit) break;

            const draw = await drawCards(deckId, 1);
            dealerHand.push(draw.cards[0]);
            dealerValue = calculateHandValue(dealerHand);
            await new Promise((r) => setTimeout(r, 400));
        }

        setDealer(dealerHand);
        resolveGame(player, dealerHand);
    };

    const stand = async () => {
        if (gameOver) return;
        setIsPlayerTurn(false);
        await dealerTurn();
    };

    const resolveGame = (playerHand, dealerHand) => {
        const playerValue = calculateHandValue(playerHand);
        const dealerValue = calculateHandValue(dealerHand);
        let result = "";

        if (playerValue > 21) result = "lose";
        else if (dealerValue > 21) result = "win";
        else if (playerValue > dealerValue) result = "win";
        else if (playerValue < dealerValue) result = "lose";
        else result = "draw";

        const msg =
            result === "win"
                ? "Ganas 🎉"
                : result === "lose"
                    ? "Pierdes 😢"
                    : "Empate 🤝";
        setMessage(msg);
        setGameOver(true);
        updateScore(result);
    };

    useEffect(() => {
        initGame();
    }, []);

    return (
        <div className="mesa-container">
            <h1>Blackjack</h1>
            <Scoreboard score={score} onRestart={onRestart} />

            {loading ? (
                <p>Cargando...</p>
            ) : (
                <>
                    <div className="dealer-section">
                        <h2>Crupier</h2>
                        <Mano
                            hand={dealer}
                            hiddenCard={isPlayerTurn ? hiddenCard : null}
                        />
                    </div>

                    <div className="player-section">
                        <h2>Jugador</h2>
                        <Mano hand={player} />
                    </div>

                    <p className="message">{message}</p>

                    <Controles
                        hit={hit}
                        stand={stand}
                        newGame={initGame}
                        isPlayerTurn={isPlayerTurn}
                        gameOver={gameOver}
                    />
                </>
            )}
        </div>
    );
}
