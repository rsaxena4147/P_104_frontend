import React, { createContext, useState, useContext, useEffect } from 'react'

const AppContext = createContext()

export const AppProvider = ({ children }) => {
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    categories: {},
    spam: { ham: 0, spam: 0 },
    urgency: {},
  })
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load stats + history from backend on mount
  useEffect(() => {
    loadMetrics()
    loadHistory()
  }, [])

  const loadMetrics = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/model/metrics')
      if (res.ok) {
        const data = await res.json()
        setStats({
          totalAnalyses: data.spam.total || data.totalAnalyses || 0,
          categories: data.category.distribution || {},
          spam: data.spam.stats || {},
          urgency: data.urgency_action.distribution || {},
        })
      }
    } catch (err) {
      console.error('Failed to load metrics', err)
    } finally {
      setLoading(false)
    }
  }

  const loadHistory = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/history?page=1&page_size=50')
      if (res.ok) {
        const data = await res.json()
        setHistory(data.items || [])
      }
    } catch (err) {
      console.error('Failed to load history', err)
    } finally {
      setLoading(false)
    }
  }

  const addRecord = (record) => {
    setHistory((prev) => [record, ...prev].slice(0, 100))
    loadMetrics()
  }

  const deleteRecord = async (id) => {
    try {
      await fetch(`/api/history/${id}`, { method: 'DELETE' })
      setHistory((prev) => prev.filter((r) => r.id !== id))
      loadMetrics()
    } catch (err) {
      console.error('Delete failed', err)
    }
  }

  const clearHistory = async () => {
    try {
      await fetch('/api/history', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ confirm: true }) })
      setHistory([])
      loadMetrics()
    } catch (err) {
      console.error('Clear history failed', err)
    }
  }

  const value = {
    stats,
    history,
    loading,
    error,
    addRecord,
    deleteRecord,
    clearHistory,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export const useApp = () => useContext(AppContext)
