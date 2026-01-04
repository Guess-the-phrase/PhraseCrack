import { NextResponse } from "next/server"
import { getGameById } from "../../_store"

export async function GET(_req: Request, ctx: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await ctx.params
  const parsedId = Number.parseInt(gameId, 10)
  const game = getGameById(parsedId)

  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 })
  }

  return NextResponse.json({ phrase: game.phrase })
}


