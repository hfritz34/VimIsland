import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { GameSession, GameResult, GameMode } from '../types/game.types'

interface GameContextType {
  currentSession: GameSession | null
  sessionHistory: GameSession[]
  currentGameMode: GameMode | null
  startSession: () => void
  endSession: () => void
  addGameResult: (result: GameResult) => void
  setGameMode: (mode: GameMode) => void
  getBestScore: (gameMode?: GameMode) => number
  getTotalGamesPlayed: () => number
  getAverageStats: () => {
    cpm: number
    accuracy: number
    efficiency: number
  }
}

const GameContext = createContext<GameContextType | undefined>(undefined)

export const useGame = () => {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}

interface GameProviderProps {
  children: ReactNode
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null)
  const [sessionHistory, setSessionHistory] = useState<GameSession[]>(() => {
    const saved = localStorage.getItem('vimisland_sessions')
    return saved ? JSON.parse(saved) : []
  })
  const [currentGameMode, setCurrentGameMode] = useState<GameMode | null>(null)

  const startSession = useCallback(() => {
    const newSession: GameSession = {
      sessionId: `session-${Date.now()}`,
      games: [],
      totalScore: 0,
      averageCPM: 0,
      averageAccuracy: 0,
      startTime: new Date()
    }
    setCurrentSession(newSession)
  }, [])

  const endSession = useCallback(() => {
    if (currentSession && currentSession.games.length > 0) {
      const finalSession: GameSession = {
        ...currentSession,
        endTime: new Date(),
        totalScore: currentSession.games.reduce((sum, game) => sum + game.score, 0),
        averageCPM: currentSession.games.reduce((sum, game) => sum + game.commandsPerMinute, 0) / currentSession.games.length,
        averageAccuracy: currentSession.games.reduce((sum, game) => sum + game.accuracy, 0) / currentSession.games.length
      }

      const newHistory = [...sessionHistory, finalSession]
      setSessionHistory(newHistory)
      localStorage.setItem('vimisland_sessions', JSON.stringify(newHistory))
    }
    setCurrentSession(null)
  }, [currentSession, sessionHistory])

  const addGameResult = useCallback((result: GameResult) => {
    if (currentSession) {
      const updatedSession: GameSession = {
        ...currentSession,
        games: [...currentSession.games, result],
        totalScore: currentSession.totalScore + result.score
      }
      setCurrentSession(updatedSession)
    }
  }, [currentSession])

  const setGameMode = useCallback((mode: GameMode) => {
    setCurrentGameMode(mode)
  }, [])

  const getBestScore = useCallback((gameMode?: GameMode) => {
    let allGames: GameResult[] = []

    sessionHistory.forEach(session => {
      allGames = [...allGames, ...session.games]
    })

    if (currentSession) {
      allGames = [...allGames, ...currentSession.games]
    }

    if (gameMode) {
      allGames = allGames.filter(game => game.gameId.startsWith(gameMode))
    }

    if (allGames.length === 0) return 0

    return Math.max(...allGames.map(game => game.score))
  }, [sessionHistory, currentSession])

  const getTotalGamesPlayed = useCallback(() => {
    let total = sessionHistory.reduce((sum, session) => sum + session.games.length, 0)
    if (currentSession) {
      total += currentSession.games.length
    }
    return total
  }, [sessionHistory, currentSession])

  const getAverageStats = useCallback(() => {
    let allGames: GameResult[] = []

    sessionHistory.forEach(session => {
      allGames = [...allGames, ...session.games]
    })

    if (currentSession) {
      allGames = [...allGames, ...currentSession.games]
    }

    if (allGames.length === 0) {
      return { cpm: 0, accuracy: 0, efficiency: 0 }
    }

    return {
      cpm: Math.round(allGames.reduce((sum, game) => sum + game.commandsPerMinute, 0) / allGames.length),
      accuracy: Math.round(allGames.reduce((sum, game) => sum + game.accuracy, 0) / allGames.length),
      efficiency: Math.round(allGames.reduce((sum, game) => sum + game.efficiency, 0) / allGames.length)
    }
  }, [sessionHistory, currentSession])

  const value: GameContextType = {
    currentSession,
    sessionHistory,
    currentGameMode,
    startSession,
    endSession,
    addGameResult,
    setGameMode,
    getBestScore,
    getTotalGamesPlayed,
    getAverageStats
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}