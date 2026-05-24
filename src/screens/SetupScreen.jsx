import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './SetupScreen.module.css'

const ACCESS_ITEMS = [
  {
    id: 'gmail',
    title: 'Gmail subscription signals',
    desc: 'Find renewal notices, login alerts, cancellation emails, receipts, and unopened subscription messages.',
    meta: 'Read-only metadata + subscription emails',
    recommended: true,
  },
  {
    id: 'phone',
    title: 'Phone subscription history',
    desc: 'Check App Store and Google Play subscription records so paid mobile plans are included.',
    meta: 'Subscriptions only',
    recommended: true,
  },
  {
    id: 'activity',
    title: 'App activity signals',
    desc: 'Use privacy-safe last-open signals when available to estimate whether a paid service is unused.',
    meta: 'Last used dates, no passwords',
    recommended: false,
  },
]

export default function SetupScreen() {
  const navigate = useNavigate()
  const [enabled, setEnabled] = useState({
    gmail: true,
    phone: true,
    activity: false,
  })
  const [connected, setConnected] = useState(false)

  const activeCount = Object.values(enabled).filter(Boolean).length

  function toggle(id) {
    setEnabled(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function connectAccess() {
    setConnected(true)
    window.setTimeout(() => navigate('/subscriptions'), 900)
  }

  return (
    <div className={styles.screen}>
      <button className={styles.back} onClick={() => navigate('/home')}>← Home</button>

      <section className={styles.hero}>
        <div className={styles.lockIcon} />
        <h1>Connect AI access</h1>
        <p>Tangerine sees the charges. With your permission, AI checks activity signals to know if you actually use each subscription.</p>
      </section>

      <section className={styles.bankCard}>
        <div>
          <span className={styles.cardEyebrow}>Already detected from banking</span>
          <strong>11 recurring payments · $189/mo</strong>
          <em>Netflix, Spotify, LinkedIn Premium, Duolingo, Canva Pro, and more</em>
        </div>
      </section>

      <section className={styles.accessList}>
        <h2>Give AI permission to verify usage</h2>
        {ACCESS_ITEMS.map(item => (
          <button
            key={item.id}
            className={`${styles.accessRow} ${enabled[item.id] ? styles.enabled : ''}`}
            onClick={() => toggle(item.id)}
          >
            <span className={styles.checkbox}>{enabled[item.id] ? '✓' : ''}</span>
            <span className={styles.accessText}>
              <strong>{item.title}</strong>
              <em>{item.desc}</em>
              <small>{item.meta}</small>
            </span>
            {item.recommended && <b>Best</b>}
          </button>
        ))}
      </section>

      <section className={styles.privacy}>
        <h2>What the AI can and cannot do</h2>
        <div className={styles.privacyRow}>
          <span>Can read</span>
          <strong>Subscription evidence, renewal dates, last-login signals</strong>
        </div>
        <div className={styles.privacyRow}>
          <span>Cannot read</span>
          <strong>Passwords, private messages, unrelated emails</strong>
        </div>
        <div className={styles.privacyRow}>
          <span>Control</span>
          <strong>You approve before any cancellation is sent</strong>
        </div>
      </section>

      <button
        className={`${styles.connectBtn} ${connected ? styles.connected : ''}`}
        onClick={connectAccess}
        disabled={activeCount === 0 || connected}
      >
        {connected ? 'Access connected' : `Connect ${activeCount} source${activeCount === 1 ? '' : 's'} and scan`}
      </button>

      <button className={styles.skipBtn} onClick={() => navigate('/subscriptions')}>
        Continue with bank data only
      </button>
    </div>
  )
}
