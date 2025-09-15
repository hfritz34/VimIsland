export function initEnhancedVimMode(editor: any, monaco: any, onCommand: (command: string, mode: string) => void) {
  let mode = 'NORMAL'
  let commandBuffer = ''
  let visualStart: any = null
  let yankBuffer = ''
  let lastCommand = ''
  let repeatCount = 1

  const executeCommand = (command: string) => {
    const position = editor.getPosition()
    const model = editor.getModel()

    // Handle repeat count
    if (/^\d+$/.test(command)) {
      repeatCount = parseInt(command)
      return
    }

    for (let i = 0; i < repeatCount; i++) {
      executeVimCommand(command, position, model)
    }

    repeatCount = 1
    lastCommand = command
    onCommand(command, mode)
  }

  const executeVimCommand = (command: string, position: any, model: any) => {
    switch (command) {
      // Basic movements
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

      // Word movements
      case 'w':
        editor.trigger('vim', 'cursorWordRight', null)
        break
      case 'W':
        editor.trigger('vim', 'cursorWordRightEnd', null)
        break
      case 'b':
        editor.trigger('vim', 'cursorWordLeft', null)
        break
      case 'B':
        editor.trigger('vim', 'cursorWordLeftEnd', null)
        break
      case 'e':
        editor.trigger('vim', 'cursorWordEndRight', null)
        break
      case 'E':
        editor.trigger('vim', 'cursorWordEndRightEnd', null)
        break

      // Line movements
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
      case '^':
        const hatLineContent = model.getLineContent(position.lineNumber)
        const firstNonWhitespace = hatLineContent.search(/\S/) + 1
        editor.setPosition({
          lineNumber: position.lineNumber,
          column: firstNonWhitespace || 1
        })
        break

      // Page movements
      case 'gg':
        editor.setPosition({ lineNumber: 1, column: 1 })
        break
      case 'G':
        editor.setPosition({ lineNumber: model.getLineCount(), column: 1 })
        break

      // Delete operations
      case 'x':
        editor.executeEdits('vim', [{
          range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column + 1),
          text: ''
        }])
        break
      case 'X':
        editor.executeEdits('vim', [{
          range: new monaco.Range(position.lineNumber, Math.max(1, position.column - 1), position.lineNumber, position.column),
          text: ''
        }])
        break
      case 'dd':
        const ddLineContent = model.getLineContent(position.lineNumber)
        yankBuffer = ddLineContent + '\n'
        editor.executeEdits('vim', [{
          range: new monaco.Range(position.lineNumber, 1, position.lineNumber + 1, 1),
          text: ''
        }])
        break
      case 'D':
        const restOfLine = model.getValueInRange(new monaco.Range(
          position.lineNumber, position.column,
          position.lineNumber, model.getLineMaxColumn(position.lineNumber)
        ))
        yankBuffer = restOfLine
        editor.executeEdits('vim', [{
          range: new monaco.Range(
            position.lineNumber, position.column,
            position.lineNumber, model.getLineMaxColumn(position.lineNumber)
          ),
          text: ''
        }])
        break
      case 'dw':
        editor.trigger('vim', 'deleteWordRight', null)
        break
      case 'db':
        editor.trigger('vim', 'deleteWordLeft', null)
        break

      // Yank operations
      case 'yy':
        const yyLineContent = model.getLineContent(position.lineNumber)
        yankBuffer = yyLineContent + '\n'
        break
      case 'yw':
        // Get word under cursor
        const wordRange = editor.getModel().getWordAtPosition(position)
        if (wordRange) {
          yankBuffer = model.getValueInRange(new monaco.Range(
            position.lineNumber, wordRange.startColumn,
            position.lineNumber, wordRange.endColumn
          ))
        }
        break

      // Put operations
      case 'p':
        if (yankBuffer) {
          if (yankBuffer.includes('\n')) {
            // Line paste
            editor.executeEdits('vim', [{
              range: new monaco.Range(position.lineNumber + 1, 1, position.lineNumber + 1, 1),
              text: yankBuffer
            }])
          } else {
            // Character paste
            editor.executeEdits('vim', [{
              range: new monaco.Range(position.lineNumber, position.column + 1, position.lineNumber, position.column + 1),
              text: yankBuffer
            }])
          }
        }
        break
      case 'P':
        if (yankBuffer) {
          if (yankBuffer.includes('\n')) {
            // Line paste before
            editor.executeEdits('vim', [{
              range: new monaco.Range(position.lineNumber, 1, position.lineNumber, 1),
              text: yankBuffer
            }])
          } else {
            // Character paste before
            editor.executeEdits('vim', [{
              range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
              text: yankBuffer
            }])
          }
        }
        break

      // Insert modes
      case 'i':
        mode = 'INSERT'
        editor.updateOptions({ cursorStyle: 'line' })
        break
      case 'I':
        mode = 'INSERT'
        editor.updateOptions({ cursorStyle: 'line' })
        // Move to beginning of line
        editor.setPosition({
          lineNumber: position.lineNumber,
          column: 1
        })
        break
      case 'a':
        mode = 'INSERT'
        editor.updateOptions({ cursorStyle: 'line' })
        editor.setPosition({
          lineNumber: position.lineNumber,
          column: position.column + 1
        })
        break
      case 'A':
        mode = 'INSERT'
        editor.updateOptions({ cursorStyle: 'line' })
        editor.setPosition({
          lineNumber: position.lineNumber,
          column: model.getLineMaxColumn(position.lineNumber)
        })
        break
      case 'o':
        mode = 'INSERT'
        editor.updateOptions({ cursorStyle: 'line' })
        editor.executeEdits('vim', [{
          range: new monaco.Range(
            position.lineNumber,
            model.getLineMaxColumn(position.lineNumber),
            position.lineNumber,
            model.getLineMaxColumn(position.lineNumber)
          ),
          text: '\n'
        }])
        editor.setPosition({ lineNumber: position.lineNumber + 1, column: 1 })
        break
      case 'O':
        mode = 'INSERT'
        editor.updateOptions({ cursorStyle: 'line' })
        editor.executeEdits('vim', [{
          range: new monaco.Range(position.lineNumber, 1, position.lineNumber, 1),
          text: '\n'
        }])
        editor.setPosition({ lineNumber: position.lineNumber, column: 1 })
        break

      // Visual mode
      case 'v':
        mode = 'VISUAL'
        visualStart = position
        break
      case 'V':
        mode = 'VISUAL_LINE'
        visualStart = position
        break

      // Other commands
      case 'u':
        editor.trigger('vim', 'undo', null)
        break
      case 'r':
        editor.trigger('vim', 'redo', null)
        break
      case '.':
        if (lastCommand) {
          executeVimCommand(lastCommand, editor.getPosition(), editor.getModel())
        }
        break
    }
  }

  const handleVisualMode = (key: string) => {
    const currentPos = editor.getPosition()

    if (key === 'Escape') {
      mode = 'NORMAL'
      visualStart = null
      editor.setSelection(new monaco.Range(currentPos.lineNumber, currentPos.column, currentPos.lineNumber, currentPos.column))
      return
    }

    // Handle movement in visual mode
    if ('hjklwbeWBE0$'.includes(key)) {
      executeVimCommand(key, currentPos, editor.getModel())
      const newPos = editor.getPosition()

      if (mode === 'VISUAL') {
        editor.setSelection(new monaco.Range(
          visualStart.lineNumber, visualStart.column,
          newPos.lineNumber, newPos.column
        ))
      } else if (mode === 'VISUAL_LINE') {
        editor.setSelection(new monaco.Range(
          Math.min(visualStart.lineNumber, newPos.lineNumber), 1,
          Math.max(visualStart.lineNumber, newPos.lineNumber), editor.getModel().getLineMaxColumn(Math.max(visualStart.lineNumber, newPos.lineNumber))
        ))
      }
    }

    // Handle operations in visual mode
    if (key === 'd') {
      const selection = editor.getSelection()
      const selectedText = editor.getModel().getValueInRange(selection)
      yankBuffer = selectedText
      editor.executeEdits('vim', [{ range: selection, text: '' }])
      mode = 'NORMAL'
      visualStart = null
    } else if (key === 'y') {
      const selection = editor.getSelection()
      yankBuffer = editor.getModel().getValueInRange(selection)
      mode = 'NORMAL'
      visualStart = null
      editor.setSelection(new monaco.Range(currentPos.lineNumber, currentPos.column, currentPos.lineNumber, currentPos.column))
    }
  }

  // Main key handler
  editor.onKeyDown((e: any) => {
    const key = e.browserEvent.key

    if (mode === 'INSERT') {
      if (key === 'Escape') {
        e.preventDefault()
        mode = 'NORMAL'
        editor.updateOptions({ cursorStyle: 'block' })
        // Move cursor back one position when exiting insert mode
        const pos = editor.getPosition()
        editor.setPosition({
          lineNumber: pos.lineNumber,
          column: Math.max(1, pos.column - 1)
        })
        onCommand('ESC', mode)
      }
      return // Let normal typing work in insert mode
    }

    if (mode === 'VISUAL' || mode === 'VISUAL_LINE') {
      e.preventDefault()
      handleVisualMode(key)
      onCommand(key, mode)
      return
    }

    if (mode === 'NORMAL') {
      e.preventDefault()

      // Handle numbers for repeat count
      if (/^\d$/.test(key) && commandBuffer === '') {
        commandBuffer = key
        return
      }

      commandBuffer += key

      // Multi-character commands
      if (commandBuffer === 'dd' || commandBuffer === 'yy' || commandBuffer === 'gg') {
        executeCommand(commandBuffer)
        commandBuffer = ''
      }
      // Single character commands
      else if (commandBuffer.length === 1 || /^\d+[hjklwbeWBE0$GxXDiIaAoOvVup.r]$/.test(commandBuffer)) {
        executeCommand(commandBuffer)
        commandBuffer = ''
      }
      // Clear buffer if too long
      else if (commandBuffer.length > 10) {
        commandBuffer = ''
      }
    }
  })

  // Handle find commands (f, F, t, T)
  let findMode = ''

  const handleFindCommand = (baseCommand: string, targetChar: string) => {
    const position = editor.getPosition()
    const lineContent = editor.getModel().getLineContent(position.lineNumber)

    let targetIndex = -1

    if (baseCommand === 'f') {
      targetIndex = lineContent.indexOf(targetChar, position.column)
    } else if (baseCommand === 'F') {
      targetIndex = lineContent.lastIndexOf(targetChar, position.column - 2)
    } else if (baseCommand === 't') {
      const fIndex = lineContent.indexOf(targetChar, position.column)
      targetIndex = fIndex > -1 ? fIndex - 1 : -1
    } else if (baseCommand === 'T') {
      const fIndex = lineContent.lastIndexOf(targetChar, position.column - 2)
      targetIndex = fIndex > -1 ? fIndex + 1 : -1
    }

    if (targetIndex > -1) {
      editor.setPosition({
        lineNumber: position.lineNumber,
        column: targetIndex + 1
      })
    }
  }

  // Extended key handler for find commands
  const originalKeyHandler = editor.onKeyDown
  editor.onKeyDown = (e: any) => {
    const key = e.browserEvent.key

    if (findMode && key.length === 1) {
      e.preventDefault()
      handleFindCommand(findMode, key)
      findMode = ''
      onCommand(findMode + key, mode)
      return
    }

    if (mode === 'NORMAL' && 'fFtT'.includes(key)) {
      e.preventDefault()
      findMode = key
      return
    }

    // Call original handler
    originalKeyHandler(e)
  }
}