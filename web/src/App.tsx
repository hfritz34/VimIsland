import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import PracticePage from './pages/PracticePage'
import ProfilePage from './pages/ProfilePage'
import Header from './components/Header'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white text-black">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/practice" element={<PracticePage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App