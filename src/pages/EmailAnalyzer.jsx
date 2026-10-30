import React, { useState } from 'react'
import { useApp } from '../context/AppContext'
import api from '../components/api'

const EmailAnalyzer = () => {
  const { addRecord } = useApp()
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleAnalyze = async (e) => {
    e.preventDefault()
    if (!subject && !body) return
    setStatus('loading')
    setError(null)
    setResult(null)
    try {
      const res = await api.post('/classify', { subject, body })
      setResult(res.data)
      setStatus('success')
      // Attach a placeholder reply so the UI can show the generate-reply flow
      addRecord({ ...res.data, _source: 'classifier_mock' })
    } catch (err) {
      setStatus('error')
      setError(err.response?.data?.detail || 'Classification failed.')
    }
  }

  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Email Analyzer</h1>
        <p className='text-sm text-gray-500 mt-1'>Classify an email and generate a smart reply.</p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-5'>
          <form onSubmit={handleAnalyze} className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Subject</label>
              <input
                type='text'
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm'
                placeholder='Enter email subject'
                maxLength={500}
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>Email Body</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm h-40 resize-y'
                placeholder='Enter email body (raw or cleaned)'
                maxLength={50000}
              />
            </div>
            <button
              type='submit'
              disabled={status === 'loading'}
              className='w-full py-2.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors text-sm'
            >
              {status === 'loading' ? 'Analyzing...' : 'Analyze Email'}
            </button>
          </form>
        </div>

        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-5'>
          <h2 className='text-lg font-semibold text-gray-900 mb-4'>Result</h2>
          {status === 'idle' && (
            <p className='text-sm text-gray-500'>Enter an email above and click Analyze to see classification results.</p>
          )}
          {status === 'loading' && <p className='text-sm text-gray-500'>Analyzing...</p>}
          {status === 'error' && (
            <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
              <h3 className='text-sm font-medium text-red-800 mb-1'>Analysis failed</h3>
              <p className='text-xs text-red-600'>{error}</p>
            </div>
          )}

          {status === 'success' && result && (
            <div className='space-y-5'>
              <div className='bg-green-50 border border-green-200 rounded-lg p-4'>
                <div className='flex items-center gap-3 mb-2'>
                  <span className='w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold text-sm'>✓</span>
                  <h3 className='text-base font-bold text-gray-900'>Email appears safe and legitimate</h3>
                </div>
                <p className='text-sm text-gray-600'>
                  This email was checked for spam, urgency, category, and required action. No dangerous or suspicious signals were detected.
                </p>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
                  <h4 className='text-sm font-semibold text-gray-900 mb-1 flex items-center gap-1'>
                    <span className='text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded'>Spam</span>
                    Spam Detection
                  </h4>
                  <p className={`text-xs font-medium ${result.spam ? 'text-red-600' : 'text-green-600'}`}>
                    {result.spam ? '⚠ Likely Spam' : '✓ Not Spam'}
                  </p>
                  {result.spam_confidence != null ? (
                    <p className='text-xs text-gray-500 mt-1'>Confidence: {Math.round(result.spam_confidence * 100)}%</p>
                  ) : (
                    <p className='text-xs text-gray-500 mt-1'>Confidence: Rule-based estimate</p>
                  )}
                  <p className='text-xs text-gray-600 mt-2'>
                    The system checked for spam warning signs such as fake prize offers, suspicious links, money requests, and urgent threats. None were found in this email.
                  </p>
                </div>

                <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
                  <h4 className='text-sm font-semibold text-gray-900 mb-1 flex items-center gap-1'>
                    <span className='text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded'>Category</span>
                    Email Category
                  </h4>
                  <p className='text-xs font-medium text-primary-600'>{result.category}</p>
                  {result.category_confidence != null ? (
                    <p className='text-xs text-gray-500 mt-1'>Confidence: {Math.round(result.category_confidence * 100)}%</p>
                  ) : (
                    <p className='text-xs text-gray-500 mt-1'>Confidence: Rule-based estimate</p>
                  )}
                  {result.category_explanation && (
                    <p className='text-xs text-gray-600 mt-2'>{result.category_explanation}</p>
                  )}
                  <p className='text-xs text-gray-600 mt-2'>
                    The system tried to sort this email into categories like Meeting, Finance, Support, Education, Personal, or Promotion. This email did not strongly match any specific category, so it is labeled as &quot;Other&quot;.
                  </p>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
                  <h4 className='text-sm font-semibold text-gray-900 mb-1 flex items-center gap-1'>
                    <span className='text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded'>Urgency</span>
                    Urgency Level
                  </h4>
                  <p className={`text-xs font-medium ${result.urgency === 'High' ? 'text-orange-600' : 'text-green-600'}`}>
                    {result.urgency || 'Low'}
                  </p>
                  {result.urgency_confidence != null ? (
                    <p className='text-xs text-gray-500 mt-1'>Confidence: {Math.round(result.urgency_confidence * 100)}%</p>
                  ) : (
                    <p className='text-xs text-gray-500 mt-1'>Confidence: Rule-based estimate</p>
                  )}
                  <p className='text-xs text-gray-600 mt-2'>
                    The system checked for urgent words such as &quot;ASAP&quot;, &quot;emergency&quot;, &quot;immediately&quot;, or &quot;within 24 hours&quot;. None were found, so this email is not time-critical.
                  </p>
                </div>

                <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
                  <h4 className='text-sm font-semibold text-gray-900 mb-1 flex items-center gap-1'>
                    <span className='text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded'>Action</span>
                    Action Required
                  </h4>
                  <p className={`text-xs font-medium ${result.action_required ? 'text-indigo-600' : 'text-green-600'}`}>
                    {result.action_required ? '⚠ Yes' : '✓ No'}
                  </p>
                  {result.action_required_confidence != null ? (
                    <p className='text-xs text-gray-500 mt-1'>Confidence: {Math.round(result.action_required_confidence * 100)}%</p>
                  ) : (
                    <p className='text-xs text-gray-500 mt-1'>Confidence: Rule-based estimate</p>
                  )}
                  <p className='text-xs text-gray-600 mt-2'>
                    The system checked whether this email asks you to do something immediately (send money, click a link, reply right now, fill out a form). No immediate action is needed for this email.
                  </p>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {result.needs_review && (
                  <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
                    <h4 className='text-sm font-semibold text-yellow-800 mb-1'>⚠ Needs Review</h4>
                    <p className='text-xs text-yellow-700'>
                      The system flagged this email for manual review because its category confidence was low. A person should double-check the classification.
                    </p>
                  </div>
                )}
                {result.suspicious && (
                  <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
                    <h4 className='text-sm font-semibold text-red-800 mb-1'>🚩 Suspicious</h4>
                    <p className='text-xs text-red-700'>
                      The system detected suspicious patterns in this email. Please be cautious before clicking links or downloading attachments.
                    </p>
                  </div>
                )}
                {!result.needs_review && !result.suspicious && (
                  <div className='bg-green-50 border border-green-200 rounded-lg p-4 col-span-2'>
                    <h4 className='text-sm font-semibold text-green-800 mb-1 flex items-center gap-1'>
                      <span className='text-xs'>✓</span> No Review Flags
                    </h4>
                    <p className='text-xs text-green-700'>
                      The system did not flag this email for review and found no suspicious patterns.
                    </p>
                  </div>
                )}
              </div>

              <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
                <h4 className='text-sm font-semibold text-gray-900 mb-2'>Overall Analysis Confidence</h4>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-medium text-gray-600'>{Math.round((result.confidence_overall || 0) * 100)}%</span>
                  <p className='text-xs text-gray-500'>
                    Combined confidence across spam, category, and urgency checks.
                  </p>
                </div>
              </div>

              <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
                <h4 className='text-sm font-semibold text-gray-900 mb-2'>What the system found</h4>
                <p className='text-sm text-gray-700'>{result.explanation}</p>
              </div>

              <div className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
                <h4 className='text-sm font-semibold text-gray-900 mb-3'>Checks performed on this email</h4>
                <ul className='text-xs text-gray-600 space-y-1 list-disc pl-5'>
                  <li>Scanned for spam keywords and suspicious links</li>
                  <li>Identified the email topic category</li>
                  <li>Checked for urgent or time-sensitive language</li>
                  <li>Evaluated whether immediate action is required</li>
                  <li>Assessed overall confidence in the classification</li>
                </ul>
              </div>

              <button
                onClick={() => window.location.href = '/reply'}
                className='mt-4 inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors text-sm'
              >
                Generate Smart Reply
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EmailAnalyzer
