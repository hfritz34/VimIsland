import React from 'react'

interface Stats {
  commandsPerMinute: number
  accuracy: number
  timeElapsed: number
  commandsExecuted: number
}

interface StatsDisplayProps {
  stats: Stats
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ stats }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="text-3xl font-bold">{stats.commandsPerMinute}</div>
        <div className="text-sm text-gray-600">Commands/min</div>
      </div>
      
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="text-3xl font-bold">{stats.accuracy}%</div>
        <div className="text-sm text-gray-600">Accuracy</div>
      </div>
      
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="text-2xl font-bold">{formatTime(stats.timeElapsed)}</div>
        <div className="text-sm text-gray-600">Time</div>
      </div>
      
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="text-2xl font-bold">{stats.commandsExecuted}</div>
        <div className="text-sm text-gray-600">Commands</div>
      </div>
    </div>
  )
}

export default StatsDisplay