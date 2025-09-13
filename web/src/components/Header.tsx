import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const Header: React.FC = () => {
  const location = useLocation()
  
  const isActive = (path: string) => location.pathname === path

  return (
    <header className="border-b border-gray-200">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold tracking-tight">
            VimIsland
          </Link>
          
          <div className="flex items-center space-x-8">
            <Link 
              to="/practice" 
              className={`transition-colors ${
                isActive('/practice') ? 'text-black' : 'text-gray-500 hover:text-black'
              }`}
            >
              Practice
            </Link>
            <Link 
              to="/profile" 
              className={`transition-colors ${
                isActive('/profile') ? 'text-black' : 'text-gray-500 hover:text-black'
              }`}
            >
              Profile
            </Link>
            <button className="text-gray-500 hover:text-black transition-colors">
              Sign In
            </button>
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Header