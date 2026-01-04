import { NextResponse } from "next/server"
import { getGame } from "../../_store"

export async function GET(_req: Request, ctx: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await ctx.params
  const game = getGame(gameId)

  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 })
  }

  return NextResponse.json({ phrase: game.phrase })
}


