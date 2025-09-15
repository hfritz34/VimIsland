import React, { useEffect, useRef, useState } from 'react'
import Editor from '@monaco-editor/react'
import { GameEngine } from './GameEngine'
import { generateDeleteDerbyChallenge } from './challenges/deleteDerbyChallenges'
import { GameStats } from '../types/game.types'

interface DeleteDerbyProps {
  onComplete?: (result: any) => void
  difficulty?: 'easy' | 'medium' | 'hard'
}

const DeleteDerby: React.FC<DeleteDerbyProps> = ({ onComplete, difficulty = 'medium' }) => {
  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)
  const gameEngineRef = useRef<GameEngine | null>(null)
  const deleteMarkersRef = useRef<any[]>([])

  const [challenge, setChallenge] = useState(() => generateDeleteDerbyChallenge(difficulty))
  const [isCountingDown, setIsCountingDown] = useState(false)
  const [countdownValue, setCountdownValue] = useState(3)
  const [isActive, setIsActive] = useState(false)
  const [stats, setStats] = useState<GameStats | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [deletedCount, setDeletedCount] = useState(0)
  const [currentText, setCurrentText] = useState(challenge.initialText)

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

    // Add markers for delete targets
    if (challenge.deleteTargets) {
      addDeleteMarkers(monaco, editor)
    }

    // Set up vim key bindings
    setupVimBindings(editor, monaco)

    // Listen for content changes
    editor.onDidChangeModelContent(() => {
      const newText = editor.getValue()
      setCurrentText(newText)

      // Check if target reached
      if (isActive && newText === challenge.targetText) {
        handleTargetReached()
      }
    })

    // Focus the editor
    editor.focus()
  }

  const addDeleteMarkers = (monaco: any, editor: any) => {
    // Clear previous markers
    if (deleteMarkersRef.current.length > 0) {
      editor.deltaDecorations(deleteMarkersRef.current, [])
    }

    // Add red highlight for lines to delete
    const decorations = challenge.deleteTargets.map(target => ({
      range: new monaco.Range(
        target.line,
        target.startColumn,
        target.line,
        target.endColumn
      ),
      options: {
        isWholeLine: target.command === 'dd',
        className: 'delete-target-line',
        inlineClassName: target.command !== 'dd' ? 'delete-target-text' : '',
        hoverMessage: { value: `Delete with: ${target.command}` }
      }
    }))

    deleteMarkersRef.current = editor.deltaDecorations([], decorations)
  }

  const setupVimBindings = (editor: any, monaco: any) => {
    let mode = 'NORMAL'
    let commandBuffer = ''

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

        const position = editor.getPosition()
        const model = editor.getModel()

        // Build command buffer
        commandBuffer += key

        // Check for dd command
        if (commandBuffer === 'dd') {
          // Delete current line
          editor.executeEdits('vim', [{
            range: new monaco.Range(position.lineNumber, 1, position.lineNumber + 1, 1),
            text: ''
          }])

          setDeletedCount(prev => prev + 1)
          commandBuffer = ''
        } else if (commandBuffer === 'dw') {
          // Delete word
          editor.trigger('vim', 'deleteWordRight', null)
          setDeletedCount(prev => prev + 1)
          commandBuffer = ''
        } else if (key === 'D') {
          // Delete to end of line
          editor.executeEdits('vim', [{
            range: new monaco.Range(
              position.lineNumber,
              position.column,
              position.lineNumber,
              model.getLineMaxColumn(position.lineNumber)
            ),
            text: ''
          }])
          setDeletedCount(prev => prev + 1)
          commandBuffer = ''
        } else if (key === 'x') {
          // Delete character
          editor.executeEdits('vim', [{
            range: new monaco.Range(
              position.lineNumber,
              position.column,
              position.lineNumber,
              position.column + 1
            ),
            text: ''
          }])
          commandBuffer = ''
        } else if ('hjkl0$wbeWBE'.includes(key)) {
          // Navigation commands
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
          commandBuffer = ''
        } else if (commandBuffer.length > 2) {
          commandBuffer = ''
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
    setDeletedCount(0)
    if (gameEngineRef.current) {
      gameEngineRef.current.startGame('delete-derby', challenge)
    }
  }

  const resetGame = () => {
    const newChallenge = generateDeleteDerbyChallenge(difficulty)
    setChallenge(newChallenge)
    setCurrentText(newChallenge.initialText)
    setShowSuccess(false)
    setIsActive(false)
    setIsCountingDown(false)
    setCountdownValue(3)
    setStats(null)
    setDeletedCount(0)

    if (editorRef.current && newChallenge.initialCursorPosition) {
      editorRef.current.setValue(newChallenge.initialText)
      editorRef.current.setPosition({
        lineNumber: newChallenge.initialCursorPosition.line,
        column: newChallenge.initialCursorPosition.column
      })
    }
  }

  const totalTargets = challenge.deleteTargets?.length || 0
  const progress = totalTargets > 0 ? (deletedCount / totalTargets) * 100 : 0

  return (
    <div className="relative">
      {/* Game header */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Delete Derby</h2>
        <p className="text-gray-600 mb-2">{challenge.description}</p>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            Progress: {deletedCount}/{totalTargets} deletions
          </div>
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-red-500 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
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
            <div className="text-4xl font-bold mb-4">Perfect Deletion!</div>
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
            cursorStyle: 'block',
            cursorBlinking: 'solid',
            readOnly: false
          }}
        />

        {/* Mode indicator */}
        <div className="absolute top-2 right-2 bg-black text-white px-2 py-1 rounded text-xs font-mono">
          NORMAL
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
            <div className="text-xs text-gray-600">Deletions</div>
            <div className="text-lg font-bold">{deletedCount}</div>
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

      {/* Add styles for delete markers */}
      <style>{`
        .delete-target-line {
          background-color: rgba(239, 68, 68, 0.2);
        }
        .delete-target-text {
          background-color: rgba(239, 68, 68, 0.3);
          text-decoration: line-through;
        }
      `}</style>
    </div>
  )
}

export default DeleteDerby