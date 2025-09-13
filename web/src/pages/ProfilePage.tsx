import React from 'react'
import ActivityGraph from '../components/ActivityGraph'

const ProfilePage: React.FC = () => {
  const mockActivityData = Array.from({ length: 365 }, () => 
    Math.floor(Math.random() * 5)
  )

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
        <p className="text-gray-600">Track your vim practice journey</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="text-3xl font-bold mb-1">42</div>
          <div className="text-gray-600">Day Streak</div>
        </div>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="text-3xl font-bold mb-1">85</div>
          <div className="text-gray-600">CPM Average</div>
        </div>
        <div className="p-6 bg-gray-50 rounded-lg">
          <div className="text-3xl font-bold mb-1">94%</div>
          <div className="text-gray-600">Accuracy</div>
        </div>
      </div>
      
      <div className="mb-12">
        <h2 className="text-xl font-bold mb-4">Activity</h2>
        <ActivityGraph data={mockActivityData} />
      </div>
      
      <div>
        <h2 className="text-xl font-bold mb-4">Recent Sessions</h2>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">Practice Session #{i}</div>
                  <div className="text-sm text-gray-600">2 hours ago</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">78 CPM</div>
                  <div className="text-sm text-gray-600">92% accuracy</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ProfilePage