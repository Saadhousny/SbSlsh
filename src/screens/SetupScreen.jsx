import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import styles from './SetupScreen.module.css'

export default function SetupScreen() {
  const navigate = useNavigate()
  const { loadSampleData, analyzeCSV, isLoading } = useApp()
  const [apiKey, setApiKey] = useState(import.meta.env.VITE_ANTHROPIC_API_KEY || '')
  const [csvUploaded, setCsvUploaded] = useState(false)
  const [csvName, setCsvName] = useState('')
  const [error, setError] = useState('')
  const fileRef = useRef()

  function handleFileUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setCsvUploaded(true)
      setCsvName(file.name)
      // Store CSV in sessionStorage for use
      sessionStorage.setItem('tangerine_csv', ev.target.result)
    }
    reader.readAsText(file)
  }

  function handleDemoStart() {
    loadSampleData()
    navigate('/home')
  }

  function handleRealStart() {
    const csv = sessionStorage.getItem('tangerine_csv')
    if (!csv) {
      setError('Please upload your Tangerine CSV first.')
      return
    }
    analyzeCSV(csv)
    navigate('/home')
  }

  return (
    <div className={styles.screen}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroIcon}>🍊</div>
        <h1 className={styles.heroTitle}>Subscription Detector</h1>
        <p className={styles.heroSubtitle}>
          Find and cancel unused subscriptions — save an average of <strong>$97/month</strong>
        </p>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>$97</span>
          <span className={styles.statLabel}>avg monthly waste</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>11</span>
          <span className={styles.statLabel}>avg subs/user</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>2M+</span>
          <span className={styles.statLabel}>Tangerine clients</span>
        </div>
      </div>

      {/* Setup options */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Quick Demo</h2>
        <button className={styles.demoBtn} onClick={handleDemoStart} disabled={isLoading}>
          <span className={styles.btnIcon}>⚡</span>
          <div className={styles.btnContent}>
            <span className={styles.btnTitle}>Load sample data</span>
            <span className={styles.btnDesc}>See the agent in action with 9 realistic subscriptions</span>
          </div>
          <span className={styles.btnArrow}>›</span>
        </button>
      </div>

      <div className={styles.divider}><span>or</span></div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Use your real data</h2>
        <p className={styles.sectionDesc}>
          Export from Tangerine: <em>Accounts → Activity → Export → CSV</em> (last 6 months)
        </p>

        {/* CSV Upload */}
        <button
          className={`${styles.uploadBtn} ${csvUploaded ? styles.uploaded : ''}`}
          onClick={() => fileRef.current.click()}
        >
          <span className={styles.btnIcon}>{csvUploaded ? '✅' : '📄'}</span>
          <div className={styles.btnContent}>
            <span className={styles.btnTitle}>
              {csvUploaded ? csvName : 'Upload transactions.csv'}
            </span>
            <span className={styles.btnDesc}>
              {csvUploaded ? 'Tap to replace' : 'Tap to choose file from your device'}
            </span>
          </div>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />

        {/* API Key */}
        <div className={styles.apiSection}>
          <label className={styles.apiLabel}>
            Anthropic API Key <span className={styles.optBadge}>optional</span>
          </label>
          <input
            className={styles.apiInput}
            type="password"
            placeholder="sk-ant-api03-..."
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
          />
          <p className={styles.apiHint}>
            Enables AI explanations. Get a free key at <em>console.anthropic.com</em>. Skipping uses rule-based verdicts only.
          </p>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button
          className={styles.startBtn}
          onClick={handleRealStart}
          disabled={!csvUploaded || isLoading}
        >
          {isLoading ? 'Analyzing...' : 'Analyze my subscriptions →'}
        </button>
      </div>

      <p className={styles.footer}>
        Powered by Claude AI · Hackathon 2026 · Tangerine
      </p>
    </div>
  )
}
