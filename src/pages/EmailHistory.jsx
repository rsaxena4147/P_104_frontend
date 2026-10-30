import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Link } from 'react-router-dom'

const EMAIL_SAMPLE = {
  subject: 'Re: Project X meeting',
  body: 'Hi Sarah, thanks for the invite to the project X sync. I would like to join for the first hour, and I will be free for the rest of the discussion after 11am. Looking forward to it!'
}

const EmailHistory = () => {
  const { history, deleteRecord, clearHistory, stats } = useApp()
  const [filterCat, setFilterCat] = useState('')
  const [filterUrg, setFilterUrg] = useState('')
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [loading, setLoading] = useState(false)

  const total = stats.totalAnalyses || 0
  const pageSize = 10
  const totalPages = Math.ceil(total / pageSize) || 1

  // Reset page when filters change
  React.useEffect(() => { setPage(1) }, [filterCat, filterUrg, q])

  const handleDelete = async (id) => {
    if (!deleteConfirm) {
      setDeleteConfirm(id)
      return
    }
    await deleteRecord(id)
    setDeleteConfirm(null)
  }

  const filtered = history.filter((r) => {
    if (filterCat && r.category !== filterCat) return false
    if (filterUrg && r.urgency !== filterUrg) return false
    if (q && !((r.subject || '') + (r.category || '')).toLowerCase().includes(q.toLowerCase())) return false
    return true
  })

  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Email History</h1>
        <p className='text-sm text-gray-500 mt-1'>{total} records analyzed total. Review, search, and delete.</p>
      </div>

      {/* Metadata card */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6'>
        <div className='bg-white rounded-lg p-3 text-center'><p className='text-xs text-gray-500'>Total</p><p className='font-bold text-gray-900'>{total}</p></div>
        <div className='bg-white rounded-lg p-3 text-center'><p className='text-xs text-gray-500'>Categories</p><p className='font-bold text-gray-900'>{Object.keys(stats.categories||{}).length}</p></div>
        <div className='bg-white rounded-lg p-3 text-center'><p className='text-xs text-gray-500'>Spam</p><p className='font-bold text-red-600'>{stats.spam.spam || 0}</p></div>
        <div className='bg-white rounded-lg p-3 text-center'><p className='text-xs text-gray-500'>Urgency High</p><p className='font-bold text-orange-600'>{stats.urgency.High || 0}</p></div>
      </div>

      {/* Filters */}
      <div className='bg-white rounded-xl border border-gray-200 p-4 mb-6'>
        <div className='grid grid-cols-1 sm:grid-cols-4 gap-4'>
          <input
            placeholder='Search by subject/category...'
            value={q}
            onChange={(e)=>setQ(e.target.value)}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm'
          />
          <select value={filterCat} onChange={(e)=>setFilterCat(e.target.value)} className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm'>
            <option value=''>All categories</option>
            {stats.categories && Object.keys(stats.categories).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filterUrg} onChange={(e)=>setFilterUrg(e.target.value)} className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm'>
            <option value=''>All urgency</option>
            <option value='High'>High</option>
            <option value='Medium'>Medium</option>
            <option value='Low'>Low</option>
          </select>
          <button onClick={() => setPage(1)} className='px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg text-sm'>Apply Filters</button>
        </div>
        {totalAnalyses > 0 && (
          <div className='flex justify-end mt-2'>
            <button onClick={clearHistory} className='text-sm text-gray-500 hover:text-red-600 underline underline-offset-2'>Clear all history</button>
          </div>
        )}
      </div>

      {/* Records list */}
      <div className='space-y-3'>
        {filtered.length === 0 && <p className='text-sm text-gray-500'>No records match your filters.</p>}
        {filtered.map((r) => (
          <div key={r.id} className='bg-white rounded-xl border border-gray-200 p-4 shadow-sm'>
            <div className='flex flex-wrap items-start justify-between gap-3'>
              <div className='flex-1 min-w-0'>
                <h3 className='font-semibold text-gray-900 truncate'>{r.subject || '(no subject)'}</h3>
                <p className='text-xs text-gray-500 mt-1'>{r.category} | {r.urgency || 'Low'} | Action: {r.action_required ? 'Yes' : 'No'} | {new Date(r.submitted_at).toLocaleString()}</p>
                <p className='text-sm text-gray-600 mt-2 line-clamp-3'>{r.raw_text || r.cleaned_text || '(no body)'}</p>
              </div>
              <div className='flex flex-wrap gap-2 shrink-0'>
                <Link to={`/reply?id=${r.id}`} className='px-3 py-1.5 bg-primary-100 hover:bg-primary-200 text-primary-700 font-medium rounded-lg text-sm'>Generate Reply</Link>
                <button onClick={() => handleDelete(r.id)} className='px-3 py-1.5 bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-700 font-medium rounded-lg text-sm'>Delete</button>
              </div>
            </div>
          </div>
        ))}
        {/* Pagination */}
        <div className='flex justify-center gap-2 mt-4'>
          <button disabled={page === 1} onClick={() => setPage(p => p-1)} className='px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm disabled:opacity-50'>Prev</button>
          <span className='text-sm text-gray-600'>{page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p+1)} className='px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm disabled:opacity-50'>Next</button>
        </div>
      </div>

      {/* Sample email button */}
      <div className='mt-6 text-center'>
        <button className='px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50'>
          <a href='/analyzer' className='remove-decoration'>Try sample email on Analyzer</a>
        </button>
      </div>
    </div>
  )
}

export default EmailHistory
