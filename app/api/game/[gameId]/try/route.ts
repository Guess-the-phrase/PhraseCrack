import { NextResponse } from "next/server"
import { checkWord, getGameById, pseudoSimilarityPercent } from "../../_store"

export async function POST(req: Request, ctx: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await ctx.params
  const parsedId = Number.parseInt(gameId, 10)
  const game = getGameById(parsedId)

  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const word = typeof (body as any)?.word === "string" ? ((body as any).word as string).trim() : ""
  if (!word) {
    return NextResponse.json({ error: "Missing word" }, { status: 400 })
  }

  const { reveals } = checkWord(game, word)
  const similarity = reveals.length > 0 ? 100 : pseudoSimilarityPercent(word, game.phrase)

  if (reveals.length > 0) {
    return NextResponse.json({
      isCorrect: true,
      similarity,
      reveals,
    })
  }

  return NextResponse.json({
    isCorrect: false,
    similarity,
  })
}


