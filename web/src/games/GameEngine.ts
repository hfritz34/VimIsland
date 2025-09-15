import { GameState, GameStats, GameChallenge, GameMode, VimCommand, GameResult } from '../types/game.types'

export class GameEngine {
  private state: GameState
  private listeners: Map<string, Set<Function>>
  private statsInterval: number | null = null
  private countdownInterval: number | null = null

  constructor() {
    this.state = this.getInitialState()
    this.listeners = new Map()
  }

  private getInitialState(): GameState {
    return {
      mode: 'motion-race',
      currentChallenge: null,
      isActive: false,
      isPaused: false,
      isCountingDown: false,
      countdownValue: 3,
      stats: this.getInitialStats(),
      commandHistory: [],
      startTime: null,
      endTime: null
    }
  }

  private getInitialStats(): GameStats {
    return {
      commandsPerMinute: 0,
      accuracy: 100,
      timeElapsed: 0,
      commandsExecuted: 0,
      optimalMoves: 0,
      actualMoves: 0,
      efficiency: 100
    }
  }

  // Event system
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback)
  }

  off(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback)
  }

  private emit(event: string, data?: any) {
    this.listeners.get(event)?.forEach(callback => callback(data))
  }

  // Game control methods
  startGame(mode: GameMode, challenge: GameChallenge) {
    this.state = {
      ...this.getInitialState(),
      mode,
      currentChallenge: challenge,
      isCountingDown: true,
      countdownValue: 3
    }

    this.emit('gameStateChange', this.state)
    this.startCountdown()
  }

  private startCountdown() {
    this.countdownInterval = window.setInterval(() => {
      this.state.countdownValue--

      if (this.state.countdownValue <= 0) {
        this.clearCountdown()
        this.beginGame()
      } else {
        this.emit('countdown', this.state.countdownValue)
      }
    }, 1000)
  }

  private clearCountdown() {
    if (this.countdownInterval) {
      window.clearInterval(this.countdownInterval)
      this.countdownInterval = null
    }
  }

  private beginGame() {
    this.state = {
      ...this.state,
      isCountingDown: false,
      isActive: true,
      startTime: Date.now(),
      stats: {
        ...this.getInitialStats(),
        optimalMoves: this.state.currentChallenge?.optimalMoves || 0
      }
    }

    this.startStatsTracking()
    this.emit('gameStart', this.state)
    this.emit('gameStateChange', this.state)
  }

  pauseGame() {
    if (!this.state.isActive || this.state.isPaused) return

    this.state.isPaused = true
    this.stopStatsTracking()
    this.emit('gamePause', this.state)
    this.emit('gameStateChange', this.state)
  }

  resumeGame() {
    if (!this.state.isActive || !this.state.isPaused) return

    this.state.isPaused = false
    this.startStatsTracking()
    this.emit('gameResume', this.state)
    this.emit('gameStateChange', this.state)
  }

  endGame(success: boolean = true) {
    if (!this.state.isActive) return

    this.state.endTime = Date.now()
    this.state.isActive = false
    this.stopStatsTracking()
    this.clearCountdown()

    const result = this.calculateGameResult()

    this.emit('gameEnd', { success, result })
    this.emit('gameStateChange', this.state)

    return result
  }

  // Command handling
  executeCommand(command: VimCommand) {
    if (!this.state.isActive || this.state.isPaused) return

    this.state.commandHistory.push(command.command)
    this.state.stats.commandsExecuted++
    this.state.stats.actualMoves++

    this.updateStats()
    this.emit('commandExecuted', command)
    this.emit('gameStateChange', this.state)
  }

  // Stats tracking
  private startStatsTracking() {
    this.stopStatsTracking()

    this.statsInterval = window.setInterval(() => {
      this.updateStats()
    }, 100)
  }

  private stopStatsTracking() {
    if (this.statsInterval) {
      window.clearInterval(this.statsInterval)
      this.statsInterval = null
    }
  }

  private updateStats() {
    if (!this.state.startTime) return

    const now = Date.now()
    const timeElapsedMs = now - this.state.startTime
    const timeElapsedMinutes = timeElapsedMs / 60000

    this.state.stats.timeElapsed = timeElapsedMs / 1000

    if (timeElapsedMinutes > 0) {
      this.state.stats.commandsPerMinute = Math.round(
        this.state.stats.commandsExecuted / timeElapsedMinutes
      )
    }

    if (this.state.stats.actualMoves > 0 && this.state.stats.optimalMoves > 0) {
      this.state.stats.efficiency = Math.round(
        (this.state.stats.optimalMoves / this.state.stats.actualMoves) * 100
      )
    }

    this.emit('statsUpdate', this.state.stats)
  }

  private calculateGameResult(): GameResult {
    const completionTime = this.state.stats.timeElapsed
    const score = this.calculateScore()

    return {
      gameId: `${this.state.mode}-${Date.now()}`,
      gameName: this.getGameModeName(this.state.mode),
      completionTime,
      accuracy: this.state.stats.accuracy,
      commandsPerMinute: this.state.stats.commandsPerMinute,
      efficiency: this.state.stats.efficiency,
      score,
      timestamp: new Date()
    }
  }

  private calculateScore(): number {
    const baseScore = 1000
    const timeBonus = Math.max(0, 500 - Math.floor(this.state.stats.timeElapsed * 10))
    const accuracyBonus = Math.floor(this.state.stats.accuracy * 5)
    const efficiencyBonus = Math.floor(this.state.stats.efficiency * 3)

    return baseScore + timeBonus + accuracyBonus + efficiencyBonus
  }

  private getGameModeName(mode: GameMode): string {
    const names: Record<GameMode, string> = {
      'motion-race': 'Motion Race',
      'delete-derby': 'Delete Derby',
      'copy-paste-sprint': 'Copy-Paste Sprint',
      'find-till-rush': 'Find & Till Rush',
      'combo-challenge': 'Combo Challenge',
      'comprehensive-vim': 'Comprehensive Vim Challenge'
    }
    return names[mode]
  }

  // Getters
  getState(): GameState {
    return { ...this.state }
  }

  getStats(): GameStats {
    return { ...this.state.stats }
  }

  isActive(): boolean {
    return this.state.isActive && !this.state.isPaused
  }

  // Cleanup
  destroy() {
    this.stopStatsTracking()
    this.clearCountdown()
    this.listeners.clear()
  }
}