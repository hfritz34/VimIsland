import React from 'react'

interface ActivityGraphProps {
  data: number[]
}

const ActivityGraph: React.FC<ActivityGraphProps> = ({ data }) => {
  const getColor = (value: number) => {
    if (value === 0) return 'bg-gray-100'
    if (value === 1) return 'bg-green-200'
    if (value === 2) return 'bg-green-300'
    if (value === 3) return 'bg-green-400'
    return 'bg-green-500'
  }

  const weeks = []
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7))
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex mb-2">
        <div className="w-8"></div>
        {months.map((month, i) => (
          <div key={i} className="flex-1 text-xs text-gray-600">
            {i % 3 === 0 && month}
          </div>
        ))}
      </div>
      
      <div className="flex">
        <div className="flex flex-col mr-2">
          {days.map((day, i) => (
            <div key={i} className="text-xs text-gray-600 h-3 flex items-center">
              {i % 2 === 0 && day}
            </div>
          ))}
        </div>
        
        <div className="flex gap-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  className={`h-3 w-3 rounded-sm ${getColor(day)}`}
                  title={`${day} contributions`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex items-center justify-end mt-4 text-xs text-gray-600">
        <span className="mr-2">Less</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className={`h-3 w-3 rounded-sm ${getColor(i)}`} />
          ))}
        </div>
        <span className="ml-2">More</span>
      </div>
    </div>
  )
}

export default ActivityGraph