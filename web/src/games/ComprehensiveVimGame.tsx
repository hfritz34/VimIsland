import React, { useEffect, useRef, useState, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import { GameEngine } from './GameEngine'
import { generateComprehensiveChallenge } from './challenges/comprehensiveChallenges'
import { initEnhancedVimMode } from '../utils/enhancedVimMode'
import { GameStats } from '../types/game.types'

interface ComprehensiveVimGameProps {
  onComplete?: (result: any) => void
  difficulty?: 'easy' | 'medium' | 'hard'
}

const ComprehensiveVimGame: React.FC<ComprehensiveVimGameProps> = ({ onComplete, difficulty = 'medium' }) => {
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)
  const gameEngineRef = useRef<GameEngine | null>(null)
  const taskMarkersRef = useRef<any[]>([])

  const [challenge, setChallenge] = useState(() => generateComprehensiveChallenge(difficulty))
  const [isCountingDown, setIsCountingDown] = useState(false)
  const [countdownValue, setCountdownValue] = useState(3)
  const [isActive, setIsActive] = useState(false)
  const [stats, setStats] = useState<GameStats | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [currentTask, setCurrentTask] = useState(0)
  const [currentText, setCurrentText] = useState(challenge.initialText)
  const [vimMode, setVimMode] = useState('NORMAL')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [isRestarting, setIsRestarting] = useState(false)

  const resetGame = useCallback(() => {
    const newChallenge = generateComprehensiveChallenge(difficulty)
    setChallenge(newChallenge)
    setCurrentText(newChallenge.initialText)
    setShowSuccess(false)
    setIsActive(false)
    setIsCountingDown(false)
    setCountdownValue(3)
    setStats(null)
    setCurrentTask(0)
    setCommandHistory([])
    setVimMode('NORMAL')
    setIsRestarting(false)

    if (editorRef.current && newChallenge.initialCursorPosition) {
      editorRef.current.setValue(newChallenge.initialText)
      editorRef.current.setPosition({
        lineNumber: newChallenge.initialCursorPosition.line,
        column: newChallenge.initialCursorPosition.column
      })
      editorRef.current.focus()
    }
  }, [difficulty])

  // Global key handler for R restart
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'R' && !isRestarting) {
        e.preventDefault()
        setIsRestarting(true)

        // End current game if active
        if (gameEngineRef.current && isActive) {
          gameEngineRef.current.endGame(false)
        }

        // Reset after a short delay to ensure game engine cleanup
        setTimeout(() => {
          resetGame()
        }, 100)
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [isActive, isRestarting, resetGame])

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

    // Set up enhanced vim mode
    initEnhancedVimMode(editor, monaco, (command: string, mode: string) => {
      setVimMode(mode)
      setCommandHistory(prev => [...prev.slice(-20), command]) // Keep last 20 commands

      if (gameEngineRef.current && isActive) {
        gameEngineRef.current.executeCommand({
          command,
          timestamp: Date.now(),
          position: {
            line: editor.getPosition().lineNumber,
            column: editor.getPosition().column
          },
          mode: mode as any
        })
      }
    })

    // Listen for content changes
    editor.onDidChangeModelContent(() => {
      const newText = editor.getValue()
      setCurrentText(newText)

      // Check if challenge completed
      if (isActive && newText === challenge.targetText) {
        handleChallengeComplete()
      }
    })

    // Add task markers
    addTaskMarkers(monaco, editor)

    // Focus the editor
    editor.focus()
  }

  const addTaskMarkers = (monaco: any, editor: any) => {
    // Clear previous markers
    if (taskMarkersRef.current.length > 0) {
      editor.deltaDecorations(taskMarkersRef.current, [])
    }

    const decorations: any[] = []

    // Highlight current task target if applicable
    const task = challenge.tasks[currentTask]
    if (task && task.targetPosition) {
      decorations.push({
        range: new monaco.Range(
          task.targetPosition.line,
          task.targetPosition.column,
          task.targetPosition.line,
          task.targetPosition.column + 1
        ),
        options: {
          className: 'current-task-target',
          inlineClassName: 'current-task-highlight',
          hoverMessage: { value: task.description }
        }
      })
    }

    taskMarkersRef.current = editor.deltaDecorations([], decorations)
  }

  const handleChallengeComplete = () => {
    if (gameEngineRef.current) {
      gameEngineRef.current.endGame(true)
    }
  }

  const startGame = () => {
    setShowSuccess(false)
    setIsCountingDown(true)
    setCurrentTask(0)
    if (gameEngineRef.current) {
      gameEngineRef.current.startGame('comprehensive-vim', challenge)
    }
  }

  const getCurrentTaskDescription = () => {
    if (currentTask < challenge.tasks.length) {
      return challenge.tasks[currentTask].description
    }
    return 'Complete the transformation!'
  }

  const getTaskProgress = () => {
    return `${Math.min(currentTask + 1, challenge.tasks.length)}/${challenge.tasks.length}`
  }

  return (
    <div className="relative">
      {/* Game header */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-xl font-bold">Complete Vim Challenge</h2>
          <div className="text-right">
            <div className="text-sm text-gray-600">Task {getTaskProgress()}</div>
            <div className="text-xs text-gray-500">Press R to restart anytime</div>
          </div>
        </div>

        <div className="mb-3">
          <div className="text-sm font-medium text-blue-600 mb-1">Current Task:</div>
          <div className="text-gray-700">{getCurrentTaskDescription()}</div>
        </div>

        {/* Task progress bar */}
        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-600">Progress:</div>
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${(currentTask / challenge.tasks.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Restart notification */}
      {isRestarting && (
        <div className="absolute inset-0 bg-yellow-500 bg-opacity-90 flex items-center justify-center z-30 rounded-lg">
          <div className="text-white text-center">
            <div className="text-2xl font-bold mb-2">Restarting...</div>
            <div className="text-sm">Generating new challenge</div>
          </div>
        </div>
      )}

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
            <div className="text-4xl font-bold mb-4">Challenge Complete!</div>
            {stats && (
              <div className="text-lg mb-4">
                <div>Time: {stats.timeElapsed.toFixed(2)}s</div>
                <div>Commands: {stats.commandsExecuted}</div>
                <div>CPM: {stats.commandsPerMinute}</div>
                <div>Efficiency: {stats.efficiency}%</div>
              </div>
            )}
            <div className="text-sm">Press R for new challenge</div>
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="relative">
        <Editor
          height="500px"
          defaultLanguage="javascript"
          value={currentText}
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
            cursorStyle: vimMode === 'INSERT' ? 'line' : 'block',
            cursorBlinking: 'solid',
            readOnly: false
          }}
        />

        {/* Mode and position indicator */}
        <div className="absolute top-2 right-2 space-y-1">
          <div className={`px-2 py-1 rounded text-xs font-mono text-white ${
            vimMode === 'NORMAL' ? 'bg-blue-600' :
            vimMode === 'INSERT' ? 'bg-green-600' :
            vimMode.startsWith('VISUAL') ? 'bg-purple-600' : 'bg-gray-600'
          }`}>
            {vimMode}
          </div>
          {editorRef.current && (
            <div className="bg-black text-white px-2 py-1 rounded text-xs font-mono">
              {editorRef.current.getPosition()?.lineNumber || 1}:
              {editorRef.current.getPosition()?.column || 1}
            </div>
          )}
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

      {/* Control buttons and command history */}
      <div className="mt-4 flex gap-4">
        <div className="flex-1">
          {!isActive && !isCountingDown && !showSuccess && (
            <button
              onClick={startGame}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Start Challenge
            </button>
          )}

          <div className="mt-2 text-xs text-gray-600">
            Last commands: {commandHistory.slice(-5).join(' → ') || 'None'}
          </div>
        </div>

        {/* Quick reference */}
        <div className="w-64 p-3 bg-gray-50 rounded text-xs">
          <div className="font-bold mb-2">Vim Reference</div>
          <div className="space-y-1">
            <div><span className="font-mono">hjkl</span> - Move cursor</div>
            <div><span className="font-mono">w/b/e</span> - Word motions</div>
            <div><span className="font-mono">0/$</span> - Line start/end</div>
            <div><span className="font-mono">f/F/t/T</span> - Find/till char</div>
            <div><span className="font-mono">i/a/o</span> - Insert modes</div>
            <div><span className="font-mono">v/V</span> - Visual mode</div>
            <div><span className="font-mono">d/y/p</span> - Delete/yank/paste</div>
            <div><span className="font-mono">u/.</span> - Undo/repeat</div>
            <div className="font-bold text-red-600 mt-2">
              <span className="font-mono">R</span> - Restart challenge
            </div>
          </div>
        </div>
      </div>

      {/* Add styles for task markers */}
      <style>{`
        .current-task-target {
          background-color: rgba(59, 130, 246, 0.3);
        }
        .current-task-highlight {
          background-color: rgba(59, 130, 246, 0.5);
          color: white !important;
          font-weight: bold;
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  )
}

export default ComprehensiveVimGame