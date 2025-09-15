import React, { useEffect, useRef, useState } from 'react'
import Editor from '@monaco-editor/react'
import { GameEngine } from './GameEngine'
import { generateMotionRaceChallenge } from './challenges/motionRaceChallenges'
import { GameStats } from '../types/game.types'

interface MotionRaceProps {
  onComplete?: (result: any) => void
  difficulty?: 'easy' | 'medium' | 'hard'
}

const MotionRace: React.FC<MotionRaceProps> = ({ onComplete, difficulty = 'medium' }) => {
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)
  const gameEngineRef = useRef<GameEngine | null>(null)
  const targetMarkerRef = useRef<any>(null)

  const [challenge, setChallenge] = useState(() => generateMotionRaceChallenge(difficulty))
  const [isCountingDown, setIsCountingDown] = useState(false)
  const [countdownValue, setCountdownValue] = useState(3)
  const [isActive, setIsActive] = useState(false)
  const [stats, setStats] = useState<GameStats | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [currentPosition, setCurrentPosition] = useState({ line: 1, column: 1 })

  useEffect(() => {
    if (!gameEngineRef.current) {
      gameEngineRef.current = new GameEngine()

      gameEngineRef.current.on('countdown', (value: number) => {
        setCountdownValue(value)
      })

      gameEngineRef.current.on('gameStart', () => {
        setIsCountingDown(false)
        setIsActive(true)
      })

      gameEngineRef.current.on('statsUpdate', (newStats: GameStats) => {
        setStats(newStats)
      })

      gameEngineRef.current.on('gameEnd', ({ result }: any) => {
        setIsActive(false)
        setShowSuccess(true)
        if (onComplete) {
          onComplete(result)
        }
      })
    }

    return () => {
      if (gameEngineRef.current) {
        gameEngineRef.current.destroy()
        gameEngineRef.current = null
      }
    }
  }, [onComplete])

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor
    monacoRef.current = monaco

    // Set initial cursor position
    editor.setPosition({
      lineNumber: challenge.initialCursorPosition.line,
      column: challenge.initialCursorPosition.column
    })

    // Add target marker
    if (challenge.targetCursorPosition) {
      addTargetMarker(
        monaco,
        editor,
        challenge.targetCursorPosition.line,
        challenge.targetCursorPosition.column
      )
    }

    // Listen for cursor position changes
    editor.onDidChangeCursorPosition((e: any) => {
      const position = e.position
      setCurrentPosition({ line: position.lineNumber, column: position.column })

      // Check if target reached
      if (
        isActive &&
        challenge.targetCursorPosition &&
        position.lineNumber === challenge.targetCursorPosition.line &&
        position.column === challenge.targetCursorPosition.column
      ) {
        handleTargetReached()
      }
    })

    // Set up vim key bindings
    setupVimBindings(editor, monaco)

    // Focus the editor
    editor.focus()
  }

  const addTargetMarker = (monaco: any, editor: any, line: number, column: number) => {
    // Clear previous marker
    if (targetMarkerRef.current) {
      editor.deltaDecorations([targetMarkerRef.current], [])
    }

    // Add green highlight for target position
    const decorations = editor.deltaDecorations([], [
      {
        range: new monaco.Range(line, column, line, column + 1),
        options: {
          className: 'target-position',
          inlineClassName: 'target-character'
        }
      }
    ])

    targetMarkerRef.current = decorations[0]
  }

  const setupVimBindings = (editor: any, _monaco: any) => {
    let mode = 'NORMAL'

    editor.onKeyDown((e: any) => {
      if (!isActive) return

      if (mode === 'NORMAL') {
        e.preventDefault()
        const key = e.browserEvent.key

        // Track commands
        if (gameEngineRef.current) {
          gameEngineRef.current.executeCommand({
            command: key,
            timestamp: Date.now(),
            position: {
              line: editor.getPosition().lineNumber,
              column: editor.getPosition().column
            },
            mode: 'NORMAL'
          })
        }

        // Handle basic vim motions
        const position = editor.getPosition()
        const model = editor.getModel()

        switch (key) {
          case 'h':
            editor.setPosition({
              lineNumber: position.lineNumber,
              column: Math.max(1, position.column - 1)
            })
            break
          case 'j':
            editor.setPosition({
              lineNumber: Math.min(model.getLineCount(), position.lineNumber + 1),
              column: position.column
            })
            break
          case 'k':
            editor.setPosition({
              lineNumber: Math.max(1, position.lineNumber - 1),
              column: position.column
            })
            break
          case 'l':
            editor.setPosition({
              lineNumber: position.lineNumber,
              column: Math.min(model.getLineMaxColumn(position.lineNumber), position.column + 1)
            })
            break
          case 'w':
            editor.trigger('vim', 'cursorWordRight', null)
            break
          case 'b':
            editor.trigger('vim', 'cursorWordLeft', null)
            break
          case 'e':
            editor.trigger('vim', 'cursorWordEndRight', null)
            break
          case '0':
            editor.setPosition({
              lineNumber: position.lineNumber,
              column: 1
            })
            break
          case '$':
            editor.setPosition({
              lineNumber: position.lineNumber,
              column: model.getLineMaxColumn(position.lineNumber)
            })
            break
        }
      }
    })
  }

  const handleTargetReached = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.endGame(true)
    }
  }

  const startGame = () => {
    setShowSuccess(false)
    setIsCountingDown(true)
    if (gameEngineRef.current) {
      gameEngineRef.current.startGame('motion-race', challenge)
    }
  }

  const resetGame = () => {
    setChallenge(generateMotionRaceChallenge(difficulty))
    setShowSuccess(false)
    setIsActive(false)
    setIsCountingDown(false)
    setCountdownValue(3)
    setStats(null)

    if (editorRef.current && challenge.initialCursorPosition) {
      editorRef.current.setPosition({
        lineNumber: challenge.initialCursorPosition.line,
        column: challenge.initialCursorPosition.column
      })
    }
  }

  return (
    <div className="relative">
      {/* Game header */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Motion Race</h2>
        <p className="text-gray-600 mb-2">{challenge.description}</p>
        {challenge.targetCursorPosition && (
          <div className="text-sm font-mono">
            Target: Line {challenge.targetCursorPosition.line}, Column {challenge.targetCursorPosition.column}
          </div>
        )}
      </div>

      {/* Countdown overlay */}
      {isCountingDown && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20 rounded-lg">
          <div className="text-white text-6xl font-bold animate-pulse">{countdownValue}</div>
        </div>
      )}

      {/* Success overlay */}
      {showSuccess && (
        <div className="absolute inset-0 bg-green-500 bg-opacity-90 flex items-center justify-center z-20 rounded-lg">
          <div className="text-white text-center">
            <div className="text-4xl font-bold mb-4">Target Reached!</div>
            {stats && (
              <div className="text-lg">
                <div>Time: {stats.timeElapsed.toFixed(2)}s</div>
                <div>Commands: {stats.commandsExecuted}</div>
                <div>CPM: {stats.commandsPerMinute}</div>
                <div>Efficiency: {stats.efficiency}%</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="relative">
        <Editor
          height="400px"
          defaultLanguage="javascript"
          value={challenge.initialText}
          onMount={handleEditorDidMount}
          theme="vs"
          options={{
            fontSize: 14,
            fontFamily: 'JetBrains Mono, Fira Code, monospace',
            lineNumbers: 'on',
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'off',
            renderWhitespace: 'none',
            cursorStyle: 'block',
            cursorBlinking: 'solid',
            readOnly: true,
            domReadOnly: true
          }}
        />

        {/* Current position indicator */}
        <div className="absolute top-2 right-2 bg-black text-white px-2 py-1 rounded text-xs font-mono">
          Line {currentPosition.line}, Col {currentPosition.column}
        </div>
      </div>

      {/* Stats display */}
      {isActive && stats && (
        <div className="mt-4 grid grid-cols-4 gap-4">
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="text-xs text-gray-600">Time</div>
            <div className="text-lg font-bold">{stats.timeElapsed.toFixed(1)}s</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="text-xs text-gray-600">Commands</div>
            <div className="text-lg font-bold">{stats.commandsExecuted}</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="text-xs text-gray-600">CPM</div>
            <div className="text-lg font-bold">{stats.commandsPerMinute}</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="text-xs text-gray-600">Efficiency</div>
            <div className="text-lg font-bold">{stats.efficiency}%</div>
          </div>
        </div>
      )}

      {/* Control buttons */}
      <div className="mt-4 flex gap-4">
        {!isActive && !isCountingDown && (
          <button
            onClick={startGame}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Start Game
          </button>
        )}
        <button
          onClick={resetGame}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          New Challenge
        </button>
      </div>

      {/* Add styles for target marker */}
      <style>{`
        .target-position {
          background-color: rgba(34, 197, 94, 0.3);
        }
        .target-character {
          background-color: rgba(34, 197, 94, 0.5);
          color: white !important;
          font-weight: bold;
        }
      `}</style>
    </div>
  )
}

export default MotionRace