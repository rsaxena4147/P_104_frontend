import React from 'react'
import Navbar from './Navbar'
import { AppProvider } from '../context/AppContext'

const Layout = ({ children }) => {
  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </div>
    </AppProvider>
  )
}

export default Layout
