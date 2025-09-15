import { GameChallenge } from '../../types/game.types'

interface VimTask {
  type: 'navigate' | 'delete' | 'copy' | 'paste' | 'insert' | 'find' | 'visual'
  description: string
  targetPosition?: { line: number; column: number }
  targetText?: string
  insertText?: string
  findChar?: string
  deleteTarget?: 'line' | 'word' | 'char'
  optimalCommands: string[]
}

export function generateComprehensiveChallenge(difficulty: 'easy' | 'medium' | 'hard' = 'medium'): GameChallenge & { tasks: VimTask[] } {
  const challenges = {
    easy: generateEasyChallenge,
    medium: generateMediumChallenge,
    hard: generateHardChallenge
  }

  return challenges[difficulty]()
}

function generateEasyChallenge(): GameChallenge & { tasks: VimTask[] } {
  const templates = [
    {
      initialText: `function greet(name) {
  console.log("Hello")
  return name
}

const user = "Alice"
greet(user)`,
      tasks: [
        {
          type: 'navigate' as const,
          description: 'Navigate to "Hello" on line 2',
          targetPosition: { line: 2, column: 15 },
          optimalCommands: ['j', 'w', 'w', 'w']
        },
        {
          type: 'insert' as const,
          description: 'Change "Hello" to "Hello, "',
          insertText: ', ',
          optimalCommands: ['A', ', ', 'Esc']
        },
        {
          type: 'navigate' as const,
          description: 'Navigate to "name" on line 3',
          targetPosition: { line: 3, column: 10 },
          optimalCommands: ['j', 'w', 'w']
        },
        {
          type: 'visual' as const,
          description: 'Select "name" and replace with "greeting"',
          targetText: 'greeting',
          optimalCommands: ['v', 'e', 'c', 'greeting', 'Esc']
        }
      ],
      targetText: `function greet(name) {
  console.log("Hello, ")
  return greeting
}

const user = "Alice"
greet(user)`,
      optimalMoves: 15
    },
    {
      initialText: `const items = [1, 2, 3]
const colors = ["red", "blue"]
const active = true
const count = 0`,
      tasks: [
        {
          type: 'delete' as const,
          description: 'Delete the line with "colors"',
          deleteTarget: 'line' as const,
          optimalCommands: ['j', 'dd']
        },
        {
          type: 'navigate' as const,
          description: 'Navigate to "true" on line 3 (now line 2)',
          targetPosition: { line: 2, column: 16 },
          optimalCommands: ['j', '$']
        },
        {
          type: 'insert' as const,
          description: 'Change "true" to "false"',
          insertText: 'false',
          optimalCommands: ['v', 'e', 'c', 'false', 'Esc']
        },
        {
          type: 'copy' as const,
          description: 'Copy the first line',
          optimalCommands: ['gg', 'yy']
        },
        {
          type: 'paste' as const,
          description: 'Paste it at the end',
          optimalCommands: ['G', 'p']
        }
      ],
      targetText: `const items = [1, 2, 3]
const active = false
const count = 0
const items = [1, 2, 3]`,
      optimalMoves: 12
    }
  ]

  const template = templates[Math.floor(Math.random() * templates.length)]

  return {
    id: `comprehensive-easy-${Date.now()}`,
    name: 'Vim Challenge - Easy',
    description: 'Complete all vim tasks in sequence',
    initialText: template.initialText,
    targetText: template.targetText,
    initialCursorPosition: { line: 1, column: 1 },
    optimalMoves: template.optimalMoves,
    tasks: template.tasks
  }
}

function generateMediumChallenge(): GameChallenge & { tasks: VimTask[] } {
  const templates = [
    {
      initialText: `class UserManager {
  constructor() {
    this.users = []
    this.activeUsers = []
  }

  addUser(userData) {
    const user = { ...userData, id: Date.now() }
    this.users.push(user)
    if (user.active) {
      this.activeUsers.push(user)
    }
    return user
  }

  removeUser(id) {
    // TODO: implement removal
    console.log("Removing:", id)
  }
}`,
      tasks: [
        {
          type: 'find' as const,
          description: 'Find and navigate to "TODO" comment',
          findChar: 'T',
          targetPosition: { line: 16, column: 7 },
          optimalCommands: ['/', 'TODO', 'Enter']
        },
        {
          type: 'delete' as const,
          description: 'Delete the TODO comment line',
          deleteTarget: 'line' as const,
          optimalCommands: ['dd']
        },
        {
          type: 'insert' as const,
          description: 'Add implementation: find user index',
          insertText: '    const index = this.users.findIndex(u => u.id === id)',
          optimalCommands: ['o', '    const index = this.users.findIndex(u => u.id === id)', 'Esc']
        },
        {
          type: 'navigate' as const,
          description: 'Navigate to console.log line',
          targetPosition: { line: 17, column: 5 },
          optimalCommands: ['j']
        },
        {
          type: 'visual' as const,
          description: 'Replace console.log with if statement',
          targetText: 'if (index !== -1) {\n      this.users.splice(index, 1)\n    }',
          optimalCommands: ['V', 'c', 'if (index !== -1) {', 'Enter', '      this.users.splice(index, 1)', 'Enter', '    }', 'Esc']
        }
      ],
      targetText: `class UserManager {
  constructor() {
    this.users = []
    this.activeUsers = []
  }

  addUser(userData) {
    const user = { ...userData, id: Date.now() }
    this.users.push(user)
    if (user.active) {
      this.activeUsers.push(user)
    }
    return user
  }

  removeUser(id) {
    const index = this.users.findIndex(u => u.id === id)
    if (index !== -1) {
      this.users.splice(index, 1)
    }
  }
}`,
      optimalMoves: 25
    }
  ]

  const template = templates[Math.floor(Math.random() * templates.length)]

  return {
    id: `comprehensive-medium-${Date.now()}`,
    name: 'Vim Challenge - Medium',
    description: 'Complete all vim tasks in sequence',
    initialText: template.initialText,
    targetText: template.targetText,
    initialCursorPosition: { line: 1, column: 1 },
    optimalMoves: template.optimalMoves,
    tasks: template.tasks
  }
}

function generateHardChallenge(): GameChallenge & { tasks: VimTask[] } {
  const templates = [
    {
      initialText: `async function processData(input) {
  try {
    const result = await fetchData(input)
    const processed = result.map(item => ({
      id: item.id,
      name: item.name,
      value: item.value * 2,
      active: true
    }))

    const filtered = processed.filter(item => item.active)
    const sorted = filtered.sort((a, b) => a.value - b.value)

    return {
      success: true,
      data: sorted,
      count: sorted.length,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error("Processing failed:", error.message)
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
}`,
      tasks: [
        {
          type: 'find' as const,
          description: 'Find "value * 2" and change multiplier to 3',
          findChar: '*',
          targetPosition: { line: 7, column: 21 },
          optimalCommands: ['f', '*', 'l', 'r', '3']
        },
        {
          type: 'navigate' as const,
          description: 'Navigate to the filter condition',
          targetPosition: { line: 11, column: 49 },
          optimalCommands: ['/', 'filter', 'Enter', 'f', 'a']
        },
        {
          type: 'visual' as const,
          description: 'Change filter condition to check value > 5',
          targetText: 'item.value > 5',
          optimalCommands: ['v', 'f', ')', 'h', 'c', 'item.value > 5', 'Esc']
        },
        {
          type: 'copy' as const,
          description: 'Copy the entire error handling block',
          optimalCommands: ['/', 'catch', 'Enter', 'V', '}', '}', 'y']
        },
        {
          type: 'navigate' as const,
          description: 'Navigate after the function',
          targetPosition: { line: 25, column: 1 },
          optimalCommands: ['G', 'o']
        },
        {
          type: 'paste' as const,
          description: 'Paste and modify for a new function',
          optimalCommands: ['p', 'k', 'k', 'c', 'w', 'handleError', 'Esc']
        }
      ],
      targetText: `async function processData(input) {
  try {
    const result = await fetchData(input)
    const processed = result.map(item => ({
      id: item.id,
      name: item.name,
      value: item.value * 3,
      active: true
    }))

    const filtered = processed.filter(item => item.value > 5)
    const sorted = filtered.sort((a, b) => a.value - b.value)

    return {
      success: true,
      data: sorted,
      count: sorted.length,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error("Processing failed:", error.message)
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
}

function handleError(error) {
  console.error("Processing failed:", error.message)
  return {
    success: false,
    error: error.message,
    timestamp: new Date().toISOString()
  }
}`,
      optimalMoves: 35
    }
  ]

  const template = templates[Math.floor(Math.random() * templates.length)]

  return {
    id: `comprehensive-hard-${Date.now()}`,
    name: 'Vim Challenge - Hard',
    description: 'Complete all vim tasks in sequence',
    initialText: template.initialText,
    targetText: template.targetText,
    initialCursorPosition: { line: 1, column: 1 },
    optimalMoves: template.optimalMoves,
    tasks: template.tasks
  }
}

export function getRandomChallenge(): GameChallenge & { tasks: VimTask[] } {
  const difficulties: ('easy' | 'medium' | 'hard')[] = ['easy', 'medium', 'hard']
  const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)]
  return generateComprehensiveChallenge(difficulty)
}