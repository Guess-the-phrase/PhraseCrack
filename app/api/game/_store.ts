type Game = {
  gameId: number
  phrase: string
  tokens: string[]
  normalizedTokens: string[]
}

const SAMPLE_PHRASES = [
  "I want to play Minecraft!",
  "The quick brown fox jumps over the lazy dog",
  "Ship small batches and iterate quickly",
]

const MS_PER_DAY = 24 * 60 * 60 * 1000
// Chosen to keep `gameId` small and human-friendly. Can be overridden in a real backend.
const GAME_EPOCH_UTC_MS = Date.UTC(2026, 0, 1) // 2026-01-01 UTC => Day 1

function normalizeWord(word: string) {
  // Lowercase and trim punctuation on both ends (keeps inner apostrophes/hyphens).
  return word.toLowerCase().replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, "")
}

export function getDailyGameId(nowMs: number = Date.now()): number {
  const todayUtcDay = Math.floor(nowMs / MS_PER_DAY)
  const epochUtcDay = Math.floor(GAME_EPOCH_UTC_MS / MS_PER_DAY)
  const id = todayUtcDay - epochUtcDay + 1
  return Math.max(1, id)
}

export function getGameById(gameId: number): Game | null {
  if (!Number.isFinite(gameId) || gameId <= 0) return null

  const phrase = SAMPLE_PHRASES[(gameId - 1) % SAMPLE_PHRASES.length]
  const tokens = phrase.split(" ")
  const normalizedTokens = tokens.map(normalizeWord)

  return { gameId, phrase, tokens, normalizedTokens }
}

export function getWordMeta(game: Game) {
  return game.tokens.map((token, position) => ({
    position,
    size: token.length,
  }))
}

export function checkWord(game: Game, word: string) {
  const normalizedGuess = normalizeWord(word)
  const reveals: Array<{ position: number; word: string }> = []

  for (let i = 0; i < game.normalizedTokens.length; i++) {
    if (game.normalizedTokens[i] && game.normalizedTokens[i] === normalizedGuess) {
      reveals.push({ position: i, word: game.tokens[i] })
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
  // Deterministic "demo" similarity in [0, 100] to match the contract.
  const u = hashToUnitInterval(`${guess}::${phrase}`)
  return Math.round(u * 100)
}


