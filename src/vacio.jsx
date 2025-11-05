// 🂡 Mesa.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Hand from './Hand.jsx';
import Controls from './Controls.jsx';
import Scoreboard from './Scoreboard.jsx';
import { createDeck, drawCards, shuffleDeck } from '../api';
import '../styles.css';

export default function Mesa({ config = { deckCount: 1 } }) {
    const [deckId, setDeckId] = useState(null);
    const [player, setPlayer] = useState([]);
    const [dealer, setDealer] = useState([]);
    const [hiddenCard, setHiddenCard] = useState(null);
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [gameOver, setGameOver] = useState(false);

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

    const isBlackjack = (hand) => hand.length === 2 && calculateHandValue(hand) === 21;

    const initGame = async () => {
        setLoading(true);
        setGameOver(false);
        setIsPlayerTurn(true);
        setMessage('');
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
            setMessage('Error al iniciar el juego.');
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
            setMessage('Te pasaste! Pierdes.');
            setIsPlayerTurn(false);
            setGameOver(true);
            updateScore('dealer');
        }
    };

    const stand = async () => {
        if (gameOver) return;
        setIsPlayerTurn(false);
        let dealerHand = [...dealer, hiddenCard];
        let dealerValue = calculateHandValue(dealerHand);
        while (dealerValue < 17) {
            const draw = await drawCards(deckId, 1);
            dealerHand.push(draw.cards[0]);
            dealerValue = calculateHandValue(dealerHand);
        }
        setDealer(dealerHand);
        resolveGame(player, dealerHand);
    };

    const resolveGame = (playerHand, dealerHand) => {
        const playerValue = calculateHandValue(playerHand);
        const dealerValue = calculateHandValue(dealerHand);
        let result = '';
        if (playerValue > 21) result = 'Pierdes';
        else if (dealerValue > 21) result = 'Ganas!';
        else if (playerValue > dealerValue) result = 'Ganas!';
        else if (playerValue < dealerValue) result = 'Pierdes';
        else result = 'Empate';
        setMessage(result);
        setGameOver(true);
        updateScore(result === 'Ganas!' ? 'player' : result === 'Empate' ? 'draw' : 'dealer');
    };

    const updateScore = (winner) => {
        const score = JSON.parse(localStorage.getItem('score')) || { player: 0, dealer: 0, draw: 0 };
        score[winner]++;
        localStorage.setItem('score', JSON.stringify(score));
    };

    useEffect(() => { initGame(); }, []);

    return (
        <div className="mesa-container">
            <h1>Blackjack</h1>
            <Scoreboard />
            {loading ? (
                <p>Cargando...</p>
            ) : (
                <>
                    <div className="dealer-section">
                        <h2>Crupier</h2>
                        <Hand hand={dealer} hiddenCard={isPlayerTurn ? hiddenCard : null} />
                    </div>

                    <div className="player-section">
                        <h2>Jugador</h2>
                        <Hand hand={player} />
                    </div>

                    <p className="message">{message}</p>

                    <Controls
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

// 🂢 Hand.jsx
import React from 'react';
import { motion } from 'framer-motion';

export default function Hand({ hand, hiddenCard }) {
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
            {hiddenCard && <img src="/cards/back.png" alt="hidden" className="card" />}
        </div>
    );
}

// 🂣 Controls.jsx
import React from 'react';

export default function Controls({ hit, stand, newGame, isPlayerTurn, gameOver }) {
    return (
        <div className="controls">
            <button onClick={hit} disabled={!isPlayerTurn || gameOver}>Pedir carta</button>
            <button onClick={stand} disabled={!isPlayerTurn || gameOver}>Plantarse</button>
            <button onClick={newGame}>Nueva partida</button>
        </div>
    );
}

// 🂤 Scoreboard.jsx
import React, { useState, useEffect } from 'react';

export default function Scoreboard() {
    const [score, setScore] = useState({ player: 0, dealer: 0, draw: 0 });
    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('score'));
        if (stored) setScore(stored);
    }, []);

    return (
        <div className="scoreboard">
            <p>Jugador: {score.player}</p>
            <p>Crupier: {score.dealer}</p>
            <p>Empates: {score.draw}</p>
        </div>
    );
}

/* 🎨 styles.css
body {
  background-color: #0b6623;
  color: #fff;
  text-align: center;
  font-family: sans-serif;
}

.mesa-container {
  padding: 2rem;
}

.hand {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.card {
  width: 80px;
  border-radius: 8px;
  box-shadow: 0 0 5px rgba(0,0,0,0.3);
}

.controls button {
  margin: 0.5rem;
  padding: 0.5rem 1rem;
  background: #228b22;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
}
.controls button:disabled {
  background: #555;
  cursor: not-allowed;
}

.message {
  font-size: 1.2rem;
  margin: 1rem;
}

.scoreboard {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}*/
