import { GameChallenge } from '../../types/game.types'

export function generateMotionRaceChallenge(difficulty: 'easy' | 'medium' | 'hard' = 'medium'): GameChallenge {
  const challenges = {
    easy: generateEasyChallenge,
    medium: generateMediumChallenge,
    hard: generateHardChallenge
  }

  return challenges[difficulty]()
}

function generateEasyChallenge(): GameChallenge {
  const templates = [
    {
      initialText: `const test = "hello"
const value = 123
const result = true
const data = null
const item = undefined`,
      targets: [
        { line: 2, column: 7, description: 'Move to "value"' },
        { line: 4, column: 7, description: 'Move to "data"' },
        { line: 1, column: 14, description: 'Move to "hello"' },
        { line: 3, column: 16, description: 'Move to "true"' }
      ],
      optimalMoves: 8
    },
    {
      initialText: `function greet() {
  console.log("Hi")
  return "Hello"
}
greet()`,
      targets: [
        { line: 2, column: 3, description: 'Move to "console"' },
        { line: 3, column: 10, description: 'Move to "Hello"' },
        { line: 5, column: 1, description: 'Move to "greet()"' },
        { line: 1, column: 10, description: 'Move to function name' }
      ],
      optimalMoves: 10
    }
  ]

  const template = templates[Math.floor(Math.random() * templates.length)]
  const target = template.targets[Math.floor(Math.random() * template.targets.length)]

  return {
    id: `motion-race-easy-${Date.now()}`,
    name: 'Motion Race - Easy',
    description: target.description,
    initialText: template.initialText,
    targetText: template.initialText,
    initialCursorPosition: { line: 1, column: 1 },
    targetCursorPosition: { line: target.line, column: target.column },
    optimalMoves: template.optimalMoves
  }
}

function generateMediumChallenge(): GameChallenge {
  const templates = [
    {
      initialText: `const users = [
  { name: "Alice", age: 25, active: true },
  { name: "Bob", age: 30, active: false },
  { name: "Charlie", age: 28, active: true }
]

const activeUsers = users.filter(u => u.active)
console.log(activeUsers.length)`,
      targets: [
        { line: 7, column: 35, description: 'Navigate to "u.active"' },
        { line: 3, column: 18, description: 'Navigate to "Bob"' },
        { line: 8, column: 25, description: 'Navigate to ".length"' },
        { line: 2, column: 31, description: 'Navigate to "true" on line 2' }
      ],
      optimalMoves: 15
    },
    {
      initialText: `class TodoList {
  constructor() {
    this.items = []
    this.completed = 0
  }

  addItem(text) {
    this.items.push({ text, done: false })
  }

  completeItem(index) {
    if (this.items[index]) {
      this.items[index].done = true
      this.completed++
    }
  }
}`,
      targets: [
        { line: 8, column: 31, description: 'Navigate to "done: false"' },
        { line: 13, column: 27, description: 'Navigate to ".done = true"' },
        { line: 4, column: 20, description: 'Navigate to "= 0"' },
        { line: 11, column: 16, description: 'Navigate to "completeItem"' }
      ],
      optimalMoves: 18
    }
  ]

  const template = templates[Math.floor(Math.random() * templates.length)]
  const target = template.targets[Math.floor(Math.random() * template.targets.length)]

  return {
    id: `motion-race-medium-${Date.now()}`,
    name: 'Motion Race - Medium',
    description: target.description,
    initialText: template.initialText,
    targetText: template.initialText,
    initialCursorPosition: { line: 1, column: 1 },
    targetCursorPosition: { line: target.line, column: target.column },
    optimalMoves: template.optimalMoves
  }
}

function generateHardChallenge(): GameChallenge {
  const templates = [
    {
      initialText: `async function fetchUserData(userId) {
  try {
    const response = await fetch(\`/api/users/\${userId}\`)
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`)
    }
    const data = await response.json()
    return {
      success: true,
      user: data.user,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Failed to fetch user:', error.message)
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
}`,
      targets: [
        { line: 5, column: 42, description: 'Navigate to "response.status"' },
        { line: 14, column: 44, description: 'Navigate to "error.message" in console' },
        { line: 10, column: 18, description: 'Navigate to "data.user"' },
        { line: 3, column: 48, description: 'Navigate to "userId" in template literal' }
      ],
      optimalMoves: 25
    }
  ]

  const template = templates[Math.floor(Math.random() * templates.length)]
  const target = template.targets[Math.floor(Math.random() * template.targets.length)]

  return {
    id: `motion-race-hard-${Date.now()}`,
    name: 'Motion Race - Hard',
    description: target.description,
    initialText: template.initialText,
    targetText: template.initialText,
    initialCursorPosition: { line: 1, column: 1 },
    targetCursorPosition: { line: target.line, column: target.column },
    optimalMoves: template.optimalMoves
  }
}

export function getAllMotionRaceChallenges(): GameChallenge[] {
  return [
    ...Array(3).fill(null).map(() => generateMotionRaceChallenge('easy')),
    ...Array(3).fill(null).map(() => generateMotionRaceChallenge('medium')),
    ...Array(2).fill(null).map(() => generateMotionRaceChallenge('hard'))
  ]
}