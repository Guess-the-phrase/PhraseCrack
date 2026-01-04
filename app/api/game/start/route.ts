import { NextResponse } from "next/server"
import { createGame, getMaskedWords } from "../_store"

export async function POST() {
  const id = crypto.randomUUID()
  const game = createGame(id)

  return NextResponse.json({
    gameId: game.id,
    words: getMaskedWords(game),
  })
}


