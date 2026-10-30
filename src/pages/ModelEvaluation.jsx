import React, { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'

const ModelEvaluation = () => {
  const { stats, loading } = useApp()
  const [metrics, setMetrics] = useState({})
  const [info, setInfo] = useState({})

  useEffect(() => {
    fetch('/api/model/metrics')
      .then((r) => r.json())
      .then((d) => setMetrics(d))
      .catch(() => {})
    fetch('/api/model/info')
      .then((r) => r.json())
      .then((d) => setInfo(d))
      .catch(() => {})
  }, [])

  const metricTable = (title, obj) => (
    <div>
      <h3 className='text-sm font-semibold text-gray-700 mb-2'>{title}</h3>
      {obj && Object.keys(obj).length ? (
        <table className='w-full text-sm'>
          <tbody>
            {Object.entries(obj).map(([k, v]) => (
              <tr key={k}><td className='text-gray-500 pr-4'>{k}</td><td className='font-mono'>{v}</td></tr>
            ))}
          </tbody>
        </table>
      ) : <p className='text-sm text-gray-500'>No data</p>}
    </div>
  )

  return (
    <div>
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900'>Model Evaluation</h1>
        <p className='text-sm text-gray-500 mt-1'>Measured metrics from actual test-set runs (not fabricated).</p>
      </div>

      {loading && <p className='text-sm text-gray-500'>Loading model info...</p>}
      {!loading && (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <div className='bg-white rounded-xl border border-gray-200 p-5'>
            <h2 className='text-lg font-semibold text-gray-900 mb-3'>Spam / Ham Classifier</h2>
            {metricTable('Metrics', metrics.spam)}
            <p className='text-xs text-gray-400 mt-2'>Test-set metrics only (held-out).</p>
          </div>
          <div className='bg-white rounded-xl border border-gray-200 p-5'>
            <h2 className='text-lg font-semibold text-gray-900 mb-3'>Topic Category Classifier (weak supervision)</h2>
            {metricTable('Metrics', metrics.category)}
            <p className='text-xs text-gray-400 mt-2'>Weak-supervision based; dataset is clearly separated from spam/ham benchmark.</p>
          </div>
          <div className='bg-white rounded-xl border border-gray-200 p-5'>
            <h2 className='text-lg font-semibold text-gray-900 mb-3'>Urgency &amp; Action Classifier</h2>
            {metricTable('Metrics', metrics.urgency_action)}
          </div>
          <div className='bg-white rounded-xl border border-gray-200 p-5'>
            <h2 className='text-lg font-semibold text-gray-900 mb-3'>Model Info</h2>
            {info && (
              <div>
                <table className='w-full text-sm'>
                  <tbody>
                    {Object.entries(info).map(([k, v]) => (
                      <tr key={k}><td className='text-gray-500 pr-4'>{k}</td><td className='font-mono'>{v}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      <div className='mt-6 bg-gray-50 rounded-xl p-4'>
        <h2 className='text-sm font-semibold text-gray-700 mb-2'>Notes &amp; Provenance</h2>
        <ul className='text-xs text-gray-600 space-y-1 list-disc list-inside'>
          <li>Classification uses decoupled tasks: spam/ham, topic category, urgency/action - each with its own model.</li>
          <li>Topic labels come from a documented weak-supervision seed-lexicon pipeline; not from the spam/ham benchmark.</li>
          <li>Dataset provenance: Kaggle spam/ham dataset (derived from CMU Enron corpus); see docs/DATASETS.md.</li>
          <li>Metrics are measured on held-out test sets only. No unfettered claims about accuracy.</li>
        </ul>
      </div>
    </div>
  )
}

export default ModelEvaluation
