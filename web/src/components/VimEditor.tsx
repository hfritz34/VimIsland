import React, { useRef, useEffect, useState } from 'react'
import Editor from '@monaco-editor/react'
import { initVimMode } from '../utils/vimMode'

interface VimEditorProps {
  initialText: string
  onCommandExecuted?: (command: string) => void
}

const VimEditor: React.FC<VimEditorProps> = ({ initialText, onCommandExecuted }) => {
  const editorRef = useRef<any>(null)
  const [vimMode, setVimMode] = useState<string>('NORMAL')
  const [commandHistory, setCommandHistory] = useState<string[]>([])

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor
    
    // Focus the editor
    editor.focus()
    
    // Set up vim mode simulation
    initVimMode(editor, monaco, (command: string, mode: string) => {
      setVimMode(mode)
      setCommandHistory(prev => [...prev, command])
      if (onCommandExecuted) {
        onCommandExecuted(command)
      }
    })
  }

  return (
    <div className="relative">
      <div className="absolute top-2 right-2 z-10 bg-black text-white px-2 py-1 rounded text-xs font-mono">
        {vimMode}
      </div>
      
      <Editor
        height="400px"
        defaultLanguage="javascript"
        defaultValue={initialText}
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
        }}
      />
      
      <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono text-gray-600">
        Last command: {commandHistory[commandHistory.length - 1] || 'none'}
      </div>
    </div>
  )
}

export default VimEditor