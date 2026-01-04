import { NextResponse } from "next/server"
import { getDailyGameId, getGameById, getWordMeta } from "../_store"

export async function POST() {
  const gameId = getDailyGameId()
  const game = getGameById(gameId)

  if (!game) {
    return NextResponse.json({ error: "Game not found" }, { status: 404 })
  }

  return NextResponse.json({
    gameId: game.gameId,
    words: getWordMeta(game),
  })
}


