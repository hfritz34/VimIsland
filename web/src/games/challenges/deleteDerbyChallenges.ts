import { GameChallenge } from '../../types/game.types'

interface DeleteTarget {
  line: number
  startColumn: number
  endColumn: number
  text: string
  command: 'dd' | 'dw' | 'x' | 'D'
}

export function generateDeleteDerbyChallenge(difficulty: 'easy' | 'medium' | 'hard' = 'medium'): GameChallenge & { deleteTargets: DeleteTarget[] } {
  const challenges = {
    easy: generateEasyChallenge,
    medium: generateMediumChallenge,
    hard: generateHardChallenge
  }

  return challenges[difficulty]()
}

function generateEasyChallenge(): GameChallenge & { deleteTargets: DeleteTarget[] } {
  const templates = [
    {
      initialText: `const name = "Alice"
const age = 25
const city = "New York"
const country = "USA"
const job = "Developer"`,
      targetText: `const name = "Alice"
const city = "New York"
const job = "Developer"`,
      deleteTargets: [
        { line: 2, startColumn: 1, endColumn: 14, text: 'const age = 25', command: 'dd' as const },
        { line: 4, startColumn: 1, endColumn: 22, text: 'const country = "USA"', command: 'dd' as const }
      ],
      description: 'Delete the lines with "age" and "country"',
      optimalMoves: 4
    },
    {
      initialText: `function calculate(x, y) {
  const sum = x + y
  const product = x * y
  const difference = x - y
  return sum
}`,
      targetText: `function calculate(x, y) {
  const sum = x + y
  return sum
}`,
      deleteTargets: [
        { line: 3, startColumn: 1, endColumn: 24, text: '  const product = x * y', command: 'dd' as const },
        { line: 4, startColumn: 1, endColumn: 27, text: '  const difference = x - y', command: 'dd' as const }
      ],
      description: 'Delete the lines with "product" and "difference"',
      optimalMoves: 4
    }
  ]

  const template = templates[Math.floor(Math.random() * templates.length)]

  return {
    id: `delete-derby-easy-${Date.now()}`,
    name: 'Delete Derby - Easy',
    description: template.description,
    initialText: template.initialText,
    targetText: template.targetText,
    initialCursorPosition: { line: 1, column: 1 },
    optimalMoves: template.optimalMoves,
    deleteTargets: template.deleteTargets
  }
}

function generateMediumChallenge(): GameChallenge & { deleteTargets: DeleteTarget[] } {
  const templates = [
    {
      initialText: `const userConfig = {
  username: "john_doe",
  email: "john@example.com",
  password: "secret123",
  age: 30,
  location: "San Francisco",
  theme: "dark",
  notifications: true
}`,
      targetText: `const userConfig = {
  username: "john_doe",
  email: "john@example.com",
  theme: "dark",
  notifications: true
}`,
      deleteTargets: [
        { line: 4, startColumn: 1, endColumn: 24, text: '  password: "secret123",', command: 'dd' as const },
        { line: 5, startColumn: 1, endColumn: 11, text: '  age: 30,', command: 'dd' as const },
        { line: 6, startColumn: 1, endColumn: 30, text: '  location: "San Francisco",', command: 'dd' as const }
      ],
      description: 'Delete sensitive and unnecessary user data',
      optimalMoves: 6
    },
    {
      initialText: `function processData(input) {
  // TODO: Add validation
  const normalized = input.trim()
  // DEPRECATED: Old logic
  const uppercased = normalized.toUpperCase()
  // Remove in v2.0
  const result = uppercased.split(" ")
  return result
}`,
      targetText: `function processData(input) {
  const normalized = input.trim()
  const uppercased = normalized.toUpperCase()
  const result = uppercased.split(" ")
  return result
}`,
      deleteTargets: [
        { line: 2, startColumn: 1, endColumn: 25, text: '  // TODO: Add validation', command: 'dd' as const },
        { line: 4, startColumn: 1, endColumn: 26, text: '  // DEPRECATED: Old logic', command: 'dd' as const },
        { line: 6, startColumn: 1, endColumn: 19, text: '  // Remove in v2.0', command: 'dd' as const }
      ],
      description: 'Remove all comment lines',
      optimalMoves: 6
    }
  ]

  const template = templates[Math.floor(Math.random() * templates.length)]

  return {
    id: `delete-derby-medium-${Date.now()}`,
    name: 'Delete Derby - Medium',
    description: template.description,
    initialText: template.initialText,
    targetText: template.targetText,
    initialCursorPosition: { line: 1, column: 1 },
    optimalMoves: template.optimalMoves,
    deleteTargets: template.deleteTargets
  }
}

function generateHardChallenge(): GameChallenge & { deleteTargets: DeleteTarget[] } {
  const templates = [
    {
      initialText: `class UserManager {
  constructor() {
    this.users = []
    this.debugMode = true
    this.testData = []
    this.cache = new Map()
  }

  addUser(user) {
    console.log("DEBUG: Adding user", user)
    this.users.push(user)
    console.log("DEBUG: User added successfully")
    return user.id
  }

  removeUser(id) {
    console.log("DEBUG: Removing user", id)
    const index = this.users.findIndex(u => u.id === id)
    if (index !== -1) {
      this.users.splice(index, 1)
      console.log("DEBUG: User removed")
    }
  }
}`,
      targetText: `class UserManager {
  constructor() {
    this.users = []
    this.cache = new Map()
  }

  addUser(user) {
    this.users.push(user)
    return user.id
  }

  removeUser(id) {
    const index = this.users.findIndex(u => u.id === id)
    if (index !== -1) {
      this.users.splice(index, 1)
    }
  }
}`,
      deleteTargets: [
        { line: 4, startColumn: 1, endColumn: 26, text: '    this.debugMode = true', command: 'dd' as const },
        { line: 5, startColumn: 1, endColumn: 22, text: '    this.testData = []', command: 'dd' as const },
        { line: 10, startColumn: 1, endColumn: 43, text: '    console.log("DEBUG: Adding user", user)', command: 'dd' as const },
        { line: 12, startColumn: 1, endColumn: 48, text: '    console.log("DEBUG: User added successfully")', command: 'dd' as const },
        { line: 17, startColumn: 1, endColumn: 41, text: '    console.log("DEBUG: Removing user", id)', command: 'dd' as const },
        { line: 21, startColumn: 1, endColumn: 36, text: '      console.log("DEBUG: User removed")', command: 'dd' as const }
      ],
      description: 'Remove all debug code and test data',
      optimalMoves: 12
    }
  ]

  const template = templates[Math.floor(Math.random() * templates.length)]

  return {
    id: `delete-derby-hard-${Date.now()}`,
    name: 'Delete Derby - Hard',
    description: template.description,
    initialText: template.initialText,
    targetText: template.targetText,
    initialCursorPosition: { line: 1, column: 1 },
    optimalMoves: template.optimalMoves,
    deleteTargets: template.deleteTargets
  }
}