type BackendBaseUrl = string | undefined

function getBackendBaseUrl(): BackendBaseUrl {
  return process.env.NEXT_PUBLIC_PHRASECRACK_BACKEND_URL
}

function buildUrl(localPath: string, remotePath: string) {
  const baseUrl = getBackendBaseUrl()
  // If a future external backend is configured, prefer it; otherwise use Next.js local routes.
  return baseUrl ? `${baseUrl}${remotePath}` : localPath
}

async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init)
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return (await res.json()) as T
}

export type GameWord = {
  position: number
  revealed: boolean
  display: string
}

export type StartGameResponse = {
  gameId: string
  words: GameWord[]
}

export async function startGame(): Promise<StartGameResponse> {
  const url = buildUrl("/api/game/start", "/game/start")
  return await fetchJson<StartGameResponse>(url, { method: "POST" })
}

export type RevealPhraseResponse = {
  phrase: string
}

export async function revealPhrase(gameId: string): Promise<RevealPhraseResponse> {
  const url = buildUrl(`/api/game/${gameId}/phrase`, `/game/${gameId}/phrase`)
  return await fetchJson<RevealPhraseResponse>(url)
}

export type SubmitGuessResponse =
  | {
      isCorrect: true
      reveals: Array<{ position: number; word: string }>
    }
  | {
      isCorrect: false
      similarity: number
    }

export async function submitGuess(gameId: string, word: string): Promise<SubmitGuessResponse> {
  const url = buildUrl(`/api/game/${gameId}/try`, `/game/${gameId}/try`)
  return await fetchJson<SubmitGuessResponse>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ word }),
  })
}


