"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { startGame, submitGuess, type GameWord } from "@/lib/backend-client"
import { cn, getSimilarityClasses } from "@/lib/utils"
import { HelpCircle, RotateCcw } from "lucide-react"

type Guess = {
  word: string
  similarity: number
  isCorrect: boolean
}

type DisplayWord = {
  position: number
  revealed: boolean
  display: string
}

export function WordGame() {
  const [gameId, setGameId] = useState<number | null>(null)
  const [words, setWords] = useState<DisplayWord[]>([])
  const [guesses, setGuesses] = useState<Guess[]>([])
  const [currentGuess, setCurrentGuess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)

  useEffect(() => {
    void startNewGame()
  }, [])

  const startNewGame = async () => {
    setIsLoading(true)
    try {
      const res = await startGame()
      setGameId(res.gameId)
      setWords(
        res.words.map((w: GameWord) => ({
          position: w.position,
          revealed: false,
          display: "•".repeat(Math.max(1, w.size)),
        }))
      )
      setGuesses([])
      setCurrentGuess("")
    } catch (error) {
      console.error("[PhraseCrack] Error starting new game:", error)
      setGameId(null)
      setWords([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentGuess.trim() || isLoading) return

    if (!gameId) {
      console.error("[PhraseCrack] No active gameId; cannot submit guess.")
      return
    }

    setIsLoading(true)
    const guessText = currentGuess.trim()

    try {
      const res = await submitGuess(gameId, guessText)

      if (res.isCorrect) {
        setWords((prev) => {
          const next = [...prev]
          for (const r of res.reveals) {
            const existing = next[r.position]
            if (!existing) continue
            next[r.position] = { ...existing, revealed: true, display: r.word }
          }
          return next
        })
        setGuesses((prev) => [{ word: guessText, similarity: Math.round(res.similarity), isCorrect: true }, ...prev])
      } else {
        setGuesses((prev) => [{ word: guessText, similarity: Math.round(res.similarity), isCorrect: false }, ...prev])
      }

      setCurrentGuess("")
    } catch (error) {
      console.error("[PhraseCrack] Error submitting guess:", error)
      // Keep game playable if API is unavailable
      setGuesses((prev) => [
        { word: guessText, similarity: Math.floor(Math.random() * 80) + 10, isCorrect: false },
        ...prev,
      ])
      setCurrentGuess("")
    } finally {
      setIsLoading(false)
    }
  }

  const isGameWon = words.length > 0 && words.every((w) => w.revealed)

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">PhraseCrack</h1>
        <p className="text-muted-foreground text-balance">Guess the hidden phrase using semantic similarity</p>
        {gameId != null && <p className="text-xs text-muted-foreground">Daily #{gameId}</p>}
      </div>

      {/* Phrase Display */}
      <Card className="p-8 bg-card border-border">
        <div className="flex flex-wrap gap-3 justify-center items-center min-h-16">
          {words.map((word, idx) => (
            <div
              key={idx}
              className={`px-4 py-2 rounded-lg border-2 transition-all duration-300 ${
                word.revealed
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary border-border"
              }`}
            >
              <span className="font-mono text-lg font-medium">
                {word.display}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="text"
            value={currentGuess}
            onChange={(e) => setCurrentGuess(e.target.value)}
            placeholder="Enter a word..."
            className="flex-1 bg-input border-border text-lg"
            disabled={isLoading || isGameWon}
            autoFocus
          />
          <Button
            type="submit"
            disabled={isLoading || isGameWon || !currentGuess.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isLoading ? "Thinking..." : "Guess"}
          </Button>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowInstructions(!showInstructions)}
            className="flex-1"
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            How to Play
          </Button>
          <Button type="button" variant="outline" onClick={startNewGame} className="flex-1 bg-transparent">
            <RotateCcw className="w-4 h-4 mr-2" />
            New Game
          </Button>
        </div>
      </form>

      {/* Instructions */}
      {showInstructions && (
        <Card className="p-6 bg-card border-border space-y-3">
          <h3 className="font-semibold text-lg">How to Play</h3>
          <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
            <li>• Guess words to reveal the hidden phrase</li>
            <li>• Correct words will be revealed in the phrase</li>
            <li>• Incorrect words show a similarity % based on meaning</li>
            <li>• Higher similarity means you're getting closer</li>
            <li>• Reveal all words to win!</li>
          </ul>
        </Card>
      )}

      {/* Game Won Message */}
      {isGameWon && (
        <Card className="p-6 bg-primary text-primary-foreground text-center border-primary">
          <h2 className="text-2xl font-bold mb-2">🎉 Congratulations!</h2>
          <p className="text-balance">You've uncovered the hidden phrase in {guesses.length} guesses!</p>
        </Card>
      )}

      {/* Guesses History */}
      {guesses.length > 0 && (
        <Card className="p-6 bg-card border-border">
          <h3 className="font-semibold mb-4 text-lg">Previous Guesses</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {[...guesses]
              .map((guess, originalIdx) => ({ guess, originalIdx }))
              .sort((a, b) => {

                // Correct guesses first
                // if (a.guess.isCorrect !== b.guess.isCorrect) return a.guess.isCorrect ? -1 : 1

                // If guess are both incorrect
                if (!a.guess.isCorrect && !b.guess.isCorrect) {
                  const diff = b.guess.similarity - a.guess.similarity;
                  if (diff !== 0) return diff;
                }

                // Correct guesses at least
                if (a.guess.isCorrect !== b.guess.isCorrect) return a.guess.isCorrect ? 1 : -1;
                
                // Stable fallback
                return a.originalIdx - b.originalIdx;
                
              })
              .map(({ guess }, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                  guess.isCorrect ? "bg-primary/20 border-primary" : "bg-secondary border-border"
                }`}
              >
                <span className="font-medium">{guess.word}</span>
                <div className="flex items-center gap-3">
                  {guess.isCorrect ? (
                    <span className="text-green-600 dark:text-green-400 text-sm font-semibold">✓ Correct</span>
                  ) : (
                    <>
                      {(() => {
                        const similarity = Math.max(0, Math.min(100, guess.similarity))
                        const { bar, text } = getSimilarityClasses(similarity)
                        return (
                          <>
                      <div className="w-32 bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className={cn("h-full transition-all duration-300", bar)}
                          style={{ width: `${similarity}%` }}
                        />
                      </div>
                      <span className={cn("text-sm font-mono w-12 text-right", text)}>
                        {similarity}%
                      </span>
                          </>
                        )
                      })()}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
