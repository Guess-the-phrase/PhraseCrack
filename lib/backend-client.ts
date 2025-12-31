export type SimilarityRequest = {
  guess: string
  phrase: string
}

export type SimilarityResponse = {
  /**
   * Similarity score in the range [0, 1]
   */
  similarity: number
}

/**
 * Placeholder client for external backend.
 *
 * TODO: Replace the URL/path/payload with real backend contract.
 * TODO: Add auth headers (JWT/session/API key) as needed.
 * TODO: Add request timeout/retry and better error mapping if desired.
 */
export async function fetchSimilarity(req: SimilarityRequest): Promise<SimilarityResponse> {
  // TODO: set this env var in deployment
  const baseUrl = process.env.NEXT_PUBLIC_PHRASECRACK_BACKEND_URL

  if (!baseUrl) {
    // Intentionally fail so UI can fall back to the demo behavior.
    throw new Error("TODO: configure NEXT_PUBLIC_PHRASECRACK_BACKEND_URL to point to backend")
  }

  // TODO: confirm endpoint path with backend repo.
  const res = await fetch(`${baseUrl}/similarity`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  })

  if (!res.ok) {
    throw new Error(`Backend error: ${res.status}`)
  }

  // TODO: validate response shape (zod) if you want hard guarantees.
  return (await res.json()) as SimilarityResponse
}


