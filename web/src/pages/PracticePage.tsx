import React, { useState, useEffect } from 'react'
import VimEditor from '../components/VimEditor'
import StatsDisplay from '../components/StatsDisplay'
import CommandDisplay from '../components/CommandDisplay'

const PracticePage: React.FC = () => {
  const [currentChallenge, setCurrentChallenge] = useState({
    text: `function calculateSum(numbers) {
  let sum = 0;
  for (let i = 0; i < numbers.length; i++) {
    sum += numbers[i];
  }
  return sum;
}`,
    instruction: "Move to line 3 and delete the entire line using 'dd'",
    targetCommand: 'dd',
    targetLine: 3
  })
  
  const [stats, setStats] = useState({
    commandsPerMinute: 0,
    accuracy: 100,
    timeElapsed: 0,
    commandsExecuted: 0
  })
  
  const [isActive, setIsActive] = useState(false)

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <CommandDisplay instruction={currentChallenge.instruction} />
          
          <div className="mt-4 bg-gray-50 rounded-lg p-4">
            <VimEditor 
              initialText={currentChallenge.text}
              onCommandExecuted={(command) => {
                console.log('Command executed:', command)
              }}
            />
          </div>
          
          <div className="mt-4 flex justify-between items-center">
            <button 
              onClick={() => setIsActive(!isActive)}
              className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              {isActive ? 'Stop' : 'Start'}
            </button>
            
            <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Next Challenge
            </button>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <StatsDisplay stats={stats} />
          
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-bold mb-2">Command Reference</h3>
            <div className="space-y-2 text-sm">
              <div><span className="font-mono">h/j/k/l</span> - Move cursor</div>
              <div><span className="font-mono">w/b</span> - Word forward/back</div>
              <div><span className="font-mono">dd</span> - Delete line</div>
              <div><span className="font-mono">yy</span> - Yank line</div>
              <div><span className="font-mono">p</span> - Paste</div>
              <div><span className="font-mono">u</span> - Undo</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PracticePage