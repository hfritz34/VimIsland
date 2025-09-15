import React, { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useGame } from '../contexts/GameContext'
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation'

const HomePage: React.FC = () => {
  const { getTotalGamesPlayed, getBestScore, getAverageStats } = useGame()
  const [animatedCPM, setAnimatedCPM] = useState(0)
  const pageRef = useRef<HTMLDivElement>(null)
  const averageStats = getAverageStats()

  const { setContainer } = useKeyboardNavigation(true)

  useEffect(() => {
    if (pageRef.current) {
      setContainer(pageRef.current)
    }
  }, [setContainer])

  useEffect(() => {
    // Animate CPM counter
    let current = 0
    const target = averageStats.cpm
    const increment = target / 30
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setAnimatedCPM(target)
        clearInterval(timer)
      } else {
        setAnimatedCPM(Math.floor(current))
      }
    }, 30)
    return () => clearInterval(timer)
  }, [averageStats.cpm])

  const features = [
    {
      title: 'Speed Training',
      description: 'Practice vim motions with timed challenges',
      icon: '⚡'
    },
    {
      title: 'Real-time Metrics',
      description: 'Track CPM, accuracy, and efficiency',
      icon: '📊'
    },
    {
      title: 'Progressive Difficulty',
      description: 'Start easy, progress to advanced patterns',
      icon: '📈'
    },
    {
      title: 'Instant Feedback',
      description: 'See your performance in real-time',
      icon: '💯'
    }
  ]


  return (
    <div ref={pageRef} className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center py-16">
        <h1 className="text-6xl font-bold mb-6">
          VimIsland
        </h1>
        <p className="text-2xl text-gray-600 mb-8">
          Master vim motions through speed training
        </p>

        {/* Live stats display */}
        <div className="flex justify-center gap-8 mb-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600">{animatedCPM}</div>
            <div className="text-sm text-gray-600">Avg CPM</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600">{getTotalGamesPlayed()}</div>
            <div className="text-sm text-gray-600">Games Played</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600">{getBestScore()}</div>
            <div className="text-sm text-gray-600">Best Score</div>
          </div>
        </div>

        <Link
          to="/practice"
          className="inline-block bg-black text-white px-10 py-4 rounded-lg text-xl hover:bg-gray-800 transition-all transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Start Training
        </Link>
      </div>

      {/* How it works */}
      <div className="py-12">
        <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="font-bold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Comprehensive Challenge */}
      <div className="py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Complete Vim Challenge</h2>
        <div className="max-w-4xl mx-auto">
          <div className="p-6 rounded-lg border-2 border-green-500 bg-green-50">
            <div className="text-center">
              <div className="font-bold text-lg mb-2">All-in-One Vim Training</div>
              <div className="text-gray-700 mb-4">
                Navigate, edit, delete, copy, paste, find, and insert - all in one comprehensive challenge
              </div>
              <div className="flex justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-gray-200 px-2 py-1 rounded">hjkl</span>
                  <span>Navigate</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-gray-200 px-2 py-1 rounded">dd/yy</span>
                  <span>Edit</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-gray-200 px-2 py-1 rounded">v/i</span>
                  <span>Modes</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-gray-200 px-2 py-1 rounded">f/t</span>
                  <span>Find</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sample Challenge */}
      <div className="py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Sample Challenge Sequence</h2>
        <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono">
          <div className="mb-4 text-sm text-gray-400">
            Multi-step vim challenge combining various techniques:
          </div>
          <pre className="text-sm">
{`1  function greet(name) {
2    console.log("Hello")
3    return name
4  }`}
          </pre>
          <div className="mt-4 text-sm text-gray-400 space-y-1">
            <div>1. Navigate to "Hello" → <span className="text-green-300">j + w + w + w</span></div>
            <div>2. Change to "Hello, " → <span className="text-green-300">A + ", " + Esc</span></div>
            <div>3. Navigate to "name" → <span className="text-green-300">j + w + w</span></div>
            <div>4. Replace with "greeting" → <span className="text-green-300">v + e + c + greeting + Esc</span></div>
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div className="py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Ready to improve your vim speed?</h2>
        <p className="text-gray-600 mb-6">
          Join thousands of developers training their vim muscle memory
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/practice"
            className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Start Practice Session
          </Link>
          <Link
            to="/profile"
            className="px-8 py-3 border-2 border-black rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            View Progress
          </Link>
        </div>
      </div>

      {/* Activity heatmap */}
      <div className="py-12">
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-7 gap-1 max-w-2xl mx-auto">
            {Array.from({ length: 35 }).map((_, i) => {
              const intensity = Math.random()
              const color = intensity > 0.8 ? 'bg-green-500' :
                           intensity > 0.5 ? 'bg-green-400' :
                           intensity > 0.2 ? 'bg-green-300' : 'bg-gray-200'
              return (
                <div
                  key={i}
                  className={`h-4 w-4 rounded-sm ${color}`}
                  title={`Day ${i + 1}`}
                />
              )
            })}
          </div>
          <div className="text-center mt-4 text-sm text-gray-600">
            Keep your streak alive! Practice daily to maintain momentum.
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage