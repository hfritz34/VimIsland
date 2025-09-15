import React, { useState, useEffect, useRef } from 'react'
import ComprehensiveVimGame from '../games/ComprehensiveVimGame'
import { useGame } from '../contexts/GameContext'
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation'
import { GameResult } from '../types/game.types'

const PracticePage: React.FC = () => {
  const {
    currentSession,
    startSession,
    endSession,
    addGameResult,
    getBestScore,
    getTotalGamesPlayed,
    getAverageStats
  } = useGame()

  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
  const [showResults, setShowResults] = useState(false)
  const [lastResult, setLastResult] = useState<GameResult | null>(null)
  const [gameKey, setGameKey] = useState(0)
  const pageRef = useRef<HTMLDivElement>(null)

  const { setContainer, focusFirst, focusEditor } = useKeyboardNavigation(true)

  useEffect(() => {
    if (pageRef.current) {
      setContainer(pageRef.current)
    }
  }, [setContainer])

  useEffect(() => {
    if (!currentSession) {
      startSession()
    }
  }, [currentSession, startSession])

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere with game editor
      if (document.activeElement?.classList.contains('monaco-editor')) return

      if (e.key === 'Escape') {
        e.preventDefault()
        focusFirst()
      } else if (e.key === 'Enter' && e.target === document.body) {
        e.preventDefault()
        focusEditor()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [focusFirst, focusEditor])

  const handleGameComplete = (result: GameResult) => {
    addGameResult(result)
    setLastResult(result)
    setShowResults(true)
  }

  const handleStartNewGame = () => {
    setShowResults(false)
    setLastResult(null)
    setGameKey(prev => prev + 1) // Force re-render of game component
  }

  const averageStats = getAverageStats()

  return (
    <div ref={pageRef} className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main game area */}
        <div className="lg:col-span-3">
          {/* Page header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Vim Challenge</h2>
            <p className="text-gray-600 mb-4">
              Complete comprehensive vim tasks combining navigation, editing, and text manipulation.
            </p>

            {/* Keyboard navigation help */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
              <div className="text-sm">
                <div className="font-medium text-blue-800 mb-1">⌨️ Keyboard Navigation:</div>
                <div className="text-blue-700 space-y-1">
                  <div><span className="font-mono">Tab</span> or <span className="font-mono">j/k</span> - Navigate controls</div>
                  <div><span className="font-mono">Enter</span> - Start game / Activate button</div>
                  <div><span className="font-mono">Esc</span> - Return to page navigation</div>
                  <div><span className="font-mono">R</span> - Restart challenge anytime</div>
                </div>
              </div>
            </div>
          </div>

          {/* Difficulty selector */}
          <div className="mb-6 flex items-center gap-4">
            <span className="font-bold">Difficulty:</span>
            <div className="flex gap-2">
              {(['easy', 'medium', 'hard'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => {
                    setDifficulty(level)
                    setGameKey(prev => prev + 1)
                  }}
                  className={`px-4 py-2 rounded-lg capitalize focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    difficulty === level
                      ? 'bg-black text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Results overlay */}
          {showResults && lastResult && (
            <div className="mb-6 p-6 bg-green-50 border-2 border-green-500 rounded-lg">
              <h3 className="text-xl font-bold mb-4">Challenge Complete! 🎉</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-600">Time</div>
                  <div className="text-lg font-bold">{lastResult.completionTime.toFixed(2)}s</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Score</div>
                  <div className="text-lg font-bold">{lastResult.score}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">CPM</div>
                  <div className="text-lg font-bold">{lastResult.commandsPerMinute}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Efficiency</div>
                  <div className="text-lg font-bold">{lastResult.efficiency}%</div>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleStartNewGame}
                  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  New Challenge
                </button>
                <button
                  onClick={() => setShowResults(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Continue Current
                </button>
              </div>
            </div>
          )}

          {/* Game component */}
          {!showResults && (
            <ComprehensiveVimGame
              key={gameKey}
              onComplete={handleGameComplete}
              difficulty={difficulty}
            />
          )}
        </div>

        {/* Stats sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Session stats */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-bold mb-3">Current Session</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Challenges</span>
                <span className="font-bold">{currentSession?.games.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Score</span>
                <span className="font-bold">{currentSession?.totalScore || 0}</span>
              </div>
              {currentSession && currentSession.games.length > 0 && (
                <div className="flex justify-between">
                  <span>Avg CPM</span>
                  <span className="font-bold">
                    {Math.round(currentSession.games.reduce((sum, game) => sum + game.commandsPerMinute, 0) / currentSession.games.length)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Overall stats */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-bold mb-3">Overall Progress</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Challenges</span>
                <span className="font-bold">{getTotalGamesPlayed()}</span>
              </div>
              <div className="flex justify-between">
                <span>Best Score</span>
                <span className="font-bold">{getBestScore()}</span>
              </div>
              <div className="flex justify-between">
                <span>Avg CPM</span>
                <span className="font-bold">{averageStats.cpm}</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Accuracy</span>
                <span className="font-bold">{averageStats.accuracy}%</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Efficiency</span>
                <span className="font-bold">{averageStats.efficiency}%</span>
              </div>
            </div>
          </div>

          {/* Session controls */}
          <div className="space-y-2">
            <button
              onClick={() => {
                endSession()
                startSession()
                setShowResults(false)
                setGameKey(prev => prev + 1)
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              New Session
            </button>
          </div>

          {/* Quick help */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-bold mb-2">Quick Tips</h3>
            <div className="space-y-1 text-xs text-gray-600">
              <div>• Read each task carefully</div>
              <div>• Use efficient vim motions</div>
              <div>• Practice visual mode selections</div>
              <div>• Master insert/append modes</div>
              <div>• Combine commands for speed</div>
              <div className="pt-2 border-t border-gray-300">
                <div className="font-medium text-red-600">
                  Press <span className="font-mono">R</span> to restart anytime
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PracticePage