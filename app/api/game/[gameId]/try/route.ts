import { NextResponse } from "next/server"
import { checkWord, getGame, pseudoSimilarityPercent } from "../../_store"

export async function POST(req: Request, ctx: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await ctx.params
  const game = getGame(gameId)

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

  if (reveals.length > 0) {
    return NextResponse.json({
      isCorrect: true,
      reveals,
    })
  }

  return NextResponse.json({
    isCorrect: false,
    similarity: pseudoSimilarityPercent(word, game.phrase),
  })
}


