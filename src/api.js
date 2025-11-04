// src/api.js
const BASE = 'https://deckofcardsapi.com/api/deck';

/**
* Crea y mezcla un mazo con deckCount mazos (por defecto 1)
* Devuelve el objeto JSON completo (incluye deck_id y remaining)
*/
export async function createDeck(deckCount = 1) {
    const url = `${BASE}/new/shuffle/?deck_count=${encodeURIComponent(deckCount)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`createDeck failed: ${res.status}`);
    return res.json();
}

/**
* Dibuja `count` cartas del mazo identificado por deck_id.
* Devuelve el JSON (cards[], remaining, deck_id, success)
*/
export async function drawCards(deck_id, count = 1) {
    const url = `${BASE}/${encodeURIComponent(deck_id)}/draw/?count=${encodeURIComponent(count)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`drawCards failed: ${res.status}`);
    return res.json();
}

/**
* Re-mezcla el mazo. Si remaining=true solo mezcla las cartas restantes.
* Devuelve el JSON resultante.
*/
export async function shuffleDeck(deck_id, remaining = false) {
    const q = remaining ? '?remaining=true' : '';
    const url = `${BASE}/${encodeURIComponent(deck_id)}/shuffle/${q}`;
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) throw new Error(`shuffleDeck failed: ${res.status}`);
    return res.json();
}

/**
* Si quieres crear y dibujar en una sola llamada puedes usar:
* drawFromNew(count, deckCount)
* (util para economizar llamadas durante pruebas)
*/
export async function drawFromNew(count = 1, deckCount = 1) {
    const url = `${BASE}/new/shuffle/?deck_count=${encodeURIComponent(deckCount)}&count=${encodeURIComponent(count)}`;
    // Nota: la API permite usar "new" para crear+draw en la misma request (ver TIP)
    const res = await fetch(`${BASE}/new/draw/?count=${encodeURIComponent(count)}&deck_count=${encodeURIComponent(deckCount)}`);
    // A veces la ruta con ambos params no funciona consistentemente; fallback:
    if (res.ok) return res.json();
    // fallback: crear mazo y luego draw
    const deck = await createDeck(deckCount);
    return await drawCards(deck.deck_id, count);
}
