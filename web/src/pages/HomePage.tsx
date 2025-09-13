import React from 'react'
import { Link } from 'react-router-dom'

const HomePage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center py-20">
        <h1 className="text-5xl font-bold mb-4">Master Vim Commands</h1>
        <p className="text-xl text-gray-600 mb-8">
          Practice vim motions and commands with real code snippets
        </p>
        
        <Link 
          to="/practice" 
          className="inline-block bg-black text-white px-8 py-3 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Start Practicing
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
        <div className="text-center">
          <div className="text-3xl font-bold mb-2">hjkl</div>
          <p className="text-gray-600">Basic Navigation</p>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold mb-2">w/b/e</div>
          <p className="text-gray-600">Word Movement</p>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold mb-2">dd/yy/p</div>
          <p className="text-gray-600">Editing Commands</p>
        </div>
      </div>
      
      <div className="mt-20 p-8 bg-gray-50 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Track Your Progress</h2>
        <p className="text-gray-600 mb-4">
          Create an account to track your daily practice, see your improvement over time, 
          and compete on the leaderboards.
        </p>
        <div className="grid grid-cols-7 gap-1 max-w-lg">
          {Array.from({ length: 35 }).map((_, i) => (
            <div 
              key={i} 
              className={`h-3 w-3 rounded-sm ${
                Math.random() > 0.5 ? 'bg-green-400' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default HomePage