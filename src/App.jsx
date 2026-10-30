import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import EmailAnalyzer from './pages/EmailAnalyzer'
import ReplyEditor from './pages/ReplyEditor'
import EmailHistory from './pages/EmailHistory'
import ModelEvaluation from './pages/ModelEvaluation'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path='/' element={<Dashboard />} />
          <Route path='/analyzer' element={<EmailAnalyzer />} />
          <Route path='/reply' element={<ReplyEditor />} />
          <Route path='/history' element={<EmailHistory />} />
          <Route path='/model' element={<ModelEvaluation />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
