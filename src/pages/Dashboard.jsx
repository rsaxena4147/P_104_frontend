import React from 'react'
import { useApp } from '../context/AppContext'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  const { stats, loading, error } = useApp()

  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Dashboard</h1>
        <p className='text-sm text-gray-500 mt-1'>Overview of email classification activity</p>
      </div>

      {loading && <p className='text-sm text-gray-500'>Loading metrics...</p>}
      {error && <p className='text-sm text-red-600'>{error}</p>}

      {!loading && !error && (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-5'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white text-sm font-bold'>
                {stats.totalAnalyses}
              </div>
              <div>
                <p className='text-sm text-gray-500 font-medium'>Total Emails Analyzed</p>
                <p className='text-2xl font-bold text-gray-900'>{stats.totalAnalyses}</p>
              </div>
            </div>
            <p className='text-xs text-gray-400 mt-2'>Recent analysis history</p>
          </div>
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-5'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center text-white text-sm font-bold'>
                {stats.spam.spam || 0}
              </div>
              <div>
                <p className='text-sm text-gray-500 font-medium'>Spam Detected</p>
                <p className='text-2xl font-bold text-gray-900'>{stats.spam.spam || 0}</p>
              </div>
            </div>
            <p className='text-xs text-gray-400 mt-2'>Spam / total</p>
          </div>
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-5'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center text-white text-sm font-bold'>
                {stats.spam.ham || 0}
              </div>
              <div>
                <p className='text-sm text-gray-500 font-medium'>Legitimate</p>
                <p className='text-2xl font-bold text-gray-900'>{stats.spam.ham || 0}</p>
              </div>
            </div>
            <p className='text-xs text-gray-400 mt-2'>Not spam / total</p>
          </div>
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-5'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center text-white text-sm font-bold'>
                {stats.urgency.High || 0}
              </div>
              <div>
                <p className='text-sm text-gray-500 font-medium'>Urgency - High</p>
                <p className='text-2xl font-bold text-gray-900'>{stats.urgency.High || 0}</p>
              </div>
            </div>
            <p className='text-xs text-gray-400 mt-2'>Needs prompt action</p>
          </div>
        </div>
      )}

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-5'>
          <h2 className='text-lg font-semibold text-gray-900 mb-4'>Category Distribution</h2>
          {stats.categories && Object.keys(stats.categories).length > 0 ? (
            <div className='space-y-3'>
              {Object.entries(stats.categories).map(([cat, count]) => {
                const total = Object.values(stats.categories).reduce((a, b) => a + b, 1)
                const pct = Math.min((count / total) * 100, 100)
                return (
                  <div key={cat} className='flex items-center gap-3'>
                    <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700'>{cat}</span>
                    <div className='flex-1 h-3 bg-gray-100 rounded-full overflow-hidden'>
                      <div className='h-full rounded-full bg-primary-500' style={{ width: pct + '%' }} />
                    </div>
                    <span className='text-sm text-gray-600 w-8 text-right'>{count}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className='text-sm text-gray-500'>No classification data yet. Analyze an email on the <Link to='/analyzer' className='text-primary-600 underline'>Email Analyzer</Link> page.</p>
          )}
        </div>

        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-5'>
          <h2 className='text-lg font-semibold text-gray-900 mb-4'>Urgency Distribution</h2>
          {stats.urgency && Object.keys(stats.urgency).length > 0 ? (
            <div className='space-y-3'>
              {Object.entries(stats.urgency).map(([level, count]) => {
                const total = Object.values(stats.urgency).reduce((a, b) => a + b, 1)
                const pct = Math.min((count / total) * 100, 100)
                return (
                  <div key={level} className='flex items-center gap-3'>
                    <span className='text-sm font-medium text-gray-700'>{level}</span>
                    <div className='flex-1 h-3 bg-gray-100 rounded-full overflow-hidden'>
                      <div className={'h-full rounded-full ' + (level === 'High' ? 'bg-red-500' : level === 'Medium' ? 'bg-orange-500' : 'bg-green-500')} style={{ width: pct + '%' }} />
                    </div>
                    <span className='text-sm text-gray-600 w-8 text-right'>{count}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className='text-sm text-gray-500'>No urgency data yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
