import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const Navbar = () => {
  const location = useLocation()
  const { totalAnalyses, stats, clearHistory } = useApp()

  const navLink = (path, label) => (
    <Link
      to={path}
      className={`nav-link flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        location.pathname === path
          ? 'bg-primary-100 text-primary-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {label}
      {path === '/history' && totalAnalyses > 0 && (
        <span className="ml-auto text-xs text-gray-400">{totalAnalyses}</span>
      )}
    </Link>
  )

  return (
    <nav className="h-16 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-full items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-7 h-7 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-lg font-bold text-gray-900 tracking-tight">P_104</span>
            <span className="text-xs text-gray-500 font-medium">Email Assistant</span>
          </div>
          <div className="flex items-center gap-1">
            {navLink('/', 'Dashboard')}
            {navLink('/analyzer', 'Email Analyzer')}
            {navLink('/reply', 'Smart Reply')}
            {navLink('/history', 'History')}
            {navLink('/model', 'Model Evaluation')}
            {totalAnalyses > 0 && (
              <button
                onClick={clearHistory}
                className="text-xs text-gray-500 hover:text-red-600 hover:underline underline-offset-2"
                title="Clear history"
              >
                Clear history
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
