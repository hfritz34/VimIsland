export interface GameStats {
  commandsPerMinute: number
  accuracy: number
  timeElapsed: number
  commandsExecuted: number
  optimalMoves: number
  actualMoves: number
  efficiency: number
}

export interface GameResult {
  gameId: string
  gameName: string
  completionTime: number
  accuracy: number
  commandsPerMinute: number
  efficiency: number
  score: number
  timestamp: Date
}

export interface GameSession {
  sessionId: string
  games: GameResult[]
  totalScore: number
  averageCPM: number
  averageAccuracy: number
  startTime: Date
  endTime?: Date
}

export interface GameChallenge {
  id: string
  name: string
  description: string
  targetText: string
  initialText: string
  initialCursorPosition: { line: number; column: number }
  targetCursorPosition?: { line: number; column: number }
  optimalMoves: number
  timeLimit?: number
  requiredCommands?: string[]
  forbiddenCommands?: string[]
}

export type GameMode = 'motion-race' | 'delete-derby' | 'copy-paste-sprint' | 'find-till-rush' | 'combo-challenge' | 'comprehensive-vim'

export interface GameState {
  mode: GameMode
  currentChallenge: GameChallenge | null
  isActive: boolean
  isPaused: boolean
  isCountingDown: boolean
  countdownValue: number
  stats: GameStats
  commandHistory: string[]
  startTime: number | null
  endTime: number | null
}

export interface VimCommand {
  command: string
  timestamp: number
  position: { line: number; column: number }
  mode: 'NORMAL' | 'INSERT' | 'VISUAL'
}

export interface LeaderboardEntry {
  userId: string
  username: string
  score: number
  completionTime: number
  accuracy: number
  commandsPerMinute: number
  timestamp: Date
  gameMode?: GameMode
}