type Game = {
  id: string
  phrase: string
  words: string[]
  normalizedWords: string[]
  createdAt: number
}

const SAMPLE_PHRASES = [
  "This is a funny phrase!",
  "The quick brown fox jumps over the lazy dog",
  "Ship small batches and iterate quickly",
]

const games = new Map<string, Game>()

function normalizeWord(word: string) {
  // Lowercase and trim punctuation on both ends (keeps inner apostrophes/hyphens).
  return word.toLowerCase().replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, "")
}

export function createGame(id: string) {
  const phrase = SAMPLE_PHRASES[Math.floor(Math.random() * SAMPLE_PHRASES.length)]
  const words = phrase.split(" ")
  const normalizedWords = words.map(normalizeWord)

  const game: Game = {
    id,
    phrase,
    words,
    normalizedWords,
    createdAt: Date.now(),
  }

  games.set(id, game)
  return game
}

export function getGame(id: string) {
  return games.get(id) ?? null
}

export function getMaskedWords(game: Game) {
  return game.words.map((w, position) => ({
    position,
    revealed: false,
    display: "•".repeat(Math.max(1, w.length)),
  }))
}

export function checkWord(game: Game, word: string) {
  const normalizedGuess = normalizeWord(word)
  const reveals: Array<{ position: number; word: string }> = []

  for (let i = 0; i < game.normalizedWords.length; i++) {
    if (game.normalizedWords[i] && game.normalizedWords[i] === normalizedGuess) {
      reveals.push({ position: i, word: game.words[i] })
    }
  }

  return { normalizedGuess, reveals }
}

function hashToUnitInterval(input: string) {
  // Simple deterministic hash -> [0,1)
  let h = 5381
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) + h) ^ input.charCodeAt(i)
  }
  return (h >>> 0) / 2 ** 32
}

export function pseudoSimilarityPercent(guess: string, phrase: string) {
  // Deterministic "demo" similarity in [10, 90] to feel game-like.
  const u = hashToUnitInterval(`${guess}::${phrase}`)
  return Math.round(10 + u * 80)
}


