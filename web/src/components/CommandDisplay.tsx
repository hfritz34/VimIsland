import React from 'react'

interface CommandDisplayProps {
  instruction: string
}

const CommandDisplay: React.FC<CommandDisplayProps> = ({ instruction }) => {
  return (
    <div className="bg-gray-100 rounded-lg p-4 mb-4">
      <div className="text-sm text-gray-600 mb-1">Current Task:</div>
      <div className="text-lg font-medium">{instruction}</div>
    </div>
  )
}

export default CommandDisplay