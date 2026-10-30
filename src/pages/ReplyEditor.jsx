import React, { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { useSearchParams } from 'react-router-dom'
import api from '../components/api'

const TONES = ['professional', 'formal', 'friendly', 'polite', 'concise']
const LENGTHS = ['concise', 'medium', 'detailed']
const INTENTS = ['accept', 'decline', 'request clarification', 'ask for more information', 'confirm receipt', 'schedule a meeting', 'follow up', 'custom response']

const ReplyEditor = () => {
  const { stats, history } = useApp()
  const [searchParams] = useSearchParams()
  const recordId = searchParams.get('id')

  const [tone, setTone] = useState('professional')
  const [length, setLength] = useState('concise')
  const [intent, setIntent] = useState('follow up')
  const [userInstructions, setUserInstructions] = useState('')
  const [replies, setReplies] = useState([])
  const [source, setSource] = useState('demo')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [currentReply, setCurrentReply] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')

  // Load a record from history when navigating to /reply?id=XX
  useEffect(() => {
    if (recordId) {
      const rec = history.find((r) => String(r.id) === recordId)
      if (rec) {
        setSubject(rec.subject || '')
        setBody(rec.raw_text || rec.cleaned_text || '')
        setCurrentReply(rec.explanation || '')
        setReplies([])
      }
    }
  }, [recordId, history])

  const generate = async () => {
    if (!subject && !body) { setError('Enter an email subject or body first.'); return }
    setLoading(true); setError(null); setReplies([])
    try {
      const res = await api.post('/generate-reply', {
        subject, body, tone, length, intent, user_instructions: userInstructions
      })
      setReplies(res.data.replies || [])
      setSource(res.data.source || 'demo')
      setCurrentReply(res.data.replies?.[0] || '')
    } catch (err) {
      setError(err.response?.data?.detail || 'Reply generation failed.')
    } finally {
      setLoading(false)
    }
  }

  const regenerate = async () => { await generate() }

  const shorten = async () => {
    setLength('concise'); await generate()
  }
  const lengthen = async () => {
    setLength('detailed'); await generate()
  }
  const changeTone = async (t) => {
    setTone(t); await generate()
  }

  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Smart Reply Editor</h1>
        <p className='text-sm text-gray-500 mt-1'>Generate, edit, and refine email replies.</p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-5'>
          <h2 className='text-lg font-semibold text-gray-900 mb-4'>Generator Controls</h2>
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Subject</label>
              <input type='text' value={subject} onChange={(e)=>setSubject(e.target.value)} className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm' placeholder='Email subject' maxLength={500} />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Body</label>
              <textarea value={body} onChange={(e)=>setBody(e.target.value)} className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm h-32 resize-y' placeholder='Email body' maxLength={50000} />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Tone</label>
              <select value={tone} onChange={(e)=>setTone(e.target.value)} className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm'>
                {TONES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Length</label>
              <select value={length} onChange={(e)=>setLength(e.target.value)} className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm'>
                {LENGTHS.map((l) => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Reply Intent</label>
              <select value={intent} onChange={(e)=>setIntent(e.target.value)} className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm'>
                {INTENTS.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Additional Instructions</label>
              <textarea value={userInstructions} onChange={(e)=>setUserInstructions(e.target.value)} className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm h-20 resize-y' placeholder='Optional specific instructions' maxLength={2000} />
            </div>
            <div className='flex gap-2'>
              <button onClick={generate} disabled={loading} className='px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium rounded-lg text-sm'>
                {loading ? 'Generating...' : 'Generate Reply'}
              </button>
              {replies.length > 0 && (
                <button onClick={regenerate} className='px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg text-sm'>Regenerate</button>
              )}
            </div>
            {error && <p className='text-sm text-red-600'>{error}</p>}
          </div>
        </div>

        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-5'>
          <h2 className='text-lg font-semibold text-gray-900 mb-4'>Generated Reply (edit &amp; use)</h2>
          {replies.length === 0 && !loading && !error && (
            <p className='text-sm text-gray-500'>Results will appear here after generation.</p>
          )}

          {replies.length > 0 && (
            <div className='space-y-3'>
              <div className='flex flex-wrap gap-2 mb-3'>
                {replies.map((r, i) => (
                  <button key={i} onClick={() => setCurrentReply(r)} className='px-3 py-1 rounded-full text-sm border'>
                    {i + 1}. {r.length > 60 ? r.slice(0, 60) + '...' : r}
                 </button>
                ))}
              </div>
              <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
                <textarea value={currentReply} onChange={(e)=>setCurrentReply(e.target.value)} className='w-full px-3 py-2 border border-gray-300 rounded-lg text-sm h-32 resize-y font-mono' placeholder='Select or edit a reply...' />
              </div>
              <div className='flex flex-wrap gap-2'>
                <button onClick={shorten} disabled={loading} className='px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg text-sm'>Shorten</button>
                <button onClick={lengthen} disabled={loading} className='px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg text-sm'>Lengthen</button>
                {TONES.map((t) => (
                  <button key={t} onClick={() => changeTone(t)} className='px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg text-sm'>{t}</button>
                ))}
                <button onClick={() => navigator.clipboard.writeText(currentReply)} className='px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 font-medium rounded-lg text-sm'>Copy</button>
                <a href='data:text/plain;charset=utf-8,' download='reply.txt' className='px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium rounded-lg text-sm'>Download (.txt)</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReplyEditor
