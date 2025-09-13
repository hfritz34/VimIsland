export function initVimMode(editor: any, monaco: any, onCommand: (command: string, mode: string) => void) {
  let mode = 'NORMAL'
  let commandBuffer = ''
  let visualStart: any = null
  let yankBuffer = ''
  
  const executeCommand = (command: string) => {
    const position = editor.getPosition()
    const model = editor.getModel()
    
    switch (command) {
      case 'h':
        editor.setPosition({ lineNumber: position.lineNumber, column: Math.max(1, position.column - 1) })
        break
      case 'j':
        editor.setPosition({ lineNumber: Math.min(model.getLineCount(), position.lineNumber + 1), column: position.column })
        break
      case 'k':
        editor.setPosition({ lineNumber: Math.max(1, position.lineNumber - 1), column: position.column })
        break
      case 'l':
        editor.setPosition({ lineNumber: position.lineNumber, column: Math.min(model.getLineMaxColumn(position.lineNumber), position.column + 1) })
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
        editor.setPosition({ lineNumber: position.lineNumber, column: 1 })
        break
      case '$':
        editor.setPosition({ lineNumber: position.lineNumber, column: model.getLineMaxColumn(position.lineNumber) })
        break
      case 'gg':
        editor.setPosition({ lineNumber: 1, column: 1 })
        break
      case 'G':
        editor.setPosition({ lineNumber: model.getLineCount(), column: 1 })
        break
      case 'dd':
        const lineContent = model.getLineContent(position.lineNumber)
        yankBuffer = lineContent
        editor.executeEdits('vim', [{
          range: new monaco.Range(position.lineNumber, 1, position.lineNumber + 1, 1),
          text: ''
        }])
        break
      case 'yy':
        yankBuffer = model.getLineContent(position.lineNumber)
        break
      case 'p':
        if (yankBuffer) {
          editor.executeEdits('vim', [{
            range: new monaco.Range(position.lineNumber + 1, 1, position.lineNumber + 1, 1),
            text: yankBuffer + '\n'
          }])
        }
        break
      case 'x':
        editor.executeEdits('vim', [{
          range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column + 1),
          text: ''
        }])
        break
      case 'i':
        mode = 'INSERT'
        editor.updateOptions({ cursorStyle: 'line' })
        break
      case 'a':
        mode = 'INSERT'
        editor.updateOptions({ cursorStyle: 'line' })
        editor.setPosition({ lineNumber: position.lineNumber, column: position.column + 1 })
        break
      case 'o':
        mode = 'INSERT'
        editor.updateOptions({ cursorStyle: 'line' })
        editor.executeEdits('vim', [{
          range: new monaco.Range(position.lineNumber, model.getLineMaxColumn(position.lineNumber), position.lineNumber, model.getLineMaxColumn(position.lineNumber)),
          text: '\n'
        }])
        editor.setPosition({ lineNumber: position.lineNumber + 1, column: 1 })
        break
      case 'v':
        mode = 'VISUAL'
        visualStart = position
        break
      case 'u':
        editor.trigger('vim', 'undo', null)
        break
    }
    
    onCommand(command, mode)
  }
  
  editor.onKeyDown((e: any) => {
    if (mode === 'NORMAL') {
      e.preventDefault()
      
      const key = e.browserEvent.key
      
      if (key === 'Escape') {
        commandBuffer = ''
        return
      }
      
      commandBuffer += key
      
      // Check for multi-character commands
      if (commandBuffer === 'dd' || commandBuffer === 'yy' || commandBuffer === 'gg') {
        executeCommand(commandBuffer)
        commandBuffer = ''
      } else if (commandBuffer.length === 1) {
        // Single character commands
        if ('hjklwbe0$GxiaovupP'.includes(key)) {
          executeCommand(key)
          commandBuffer = ''
        }
      } else if (commandBuffer.length > 2) {
        commandBuffer = ''
      }
    } else if (mode === 'INSERT') {
      if (e.browserEvent.key === 'Escape') {
        e.preventDefault()
        mode = 'NORMAL'
        editor.updateOptions({ cursorStyle: 'block' })
        onCommand('ESC', mode)
      }
    } else if (mode === 'VISUAL') {
      e.preventDefault()
      
      if (e.browserEvent.key === 'Escape') {
        mode = 'NORMAL'
        visualStart = null
        onCommand('ESC', mode)
      } else if ('hjkl'.includes(e.browserEvent.key)) {
        executeCommand(e.browserEvent.key)
      } else if (e.browserEvent.key === 'd') {
        // Delete selected text
        const currentPos = editor.getPosition()
        editor.executeEdits('vim', [{
          range: new monaco.Range(
            Math.min(visualStart.lineNumber, currentPos.lineNumber),
            Math.min(visualStart.column, currentPos.column),
            Math.max(visualStart.lineNumber, currentPos.lineNumber),
            Math.max(visualStart.column, currentPos.column)
          ),
          text: ''
        }])
        mode = 'NORMAL'
        visualStart = null
      }
    }
  })
}