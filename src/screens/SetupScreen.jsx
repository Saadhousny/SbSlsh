import React, { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import styles from './SetupScreen.module.css'

const SOURCES = [
  {
    id: 'gmail',
    title: 'Gmail',
    subtitle: 'Renewal notices, receipts, login alerts',
    desc: 'Read-only scan for subscription-related emails. No private inbox browsing.',
    scope: 'Restricted OAuth · subscription evidence only',
    signal: 'Found 18 subscription emails',
  },
  {
    id: 'appStore',
    title: 'Apple ID / App Store',
    subtitle: 'iPhone subscriptions',
    desc: 'Imports active and expired App Store subscriptions from your device account.',
    scope: 'Subscription history only',
    signal: 'Found Apple Music duplicate',
  },
  {
    id: 'googlePlay',
    title: 'Google Play',
    subtitle: 'Android subscriptions',
    desc: 'Checks Play billing records for recurring app plans and renewal dates.',
    scope: 'Billing subscriptions only',
    signal: 'No active Play plans',
  },
  {
    id: 'linkedIn',
    title: 'LinkedIn activity',
    subtitle: 'Premium feature usage',
    desc: 'Uses authorized activity signals like last login and Premium feature events.',
    scope: 'Activity summary, no password access',
    signal: '0 InMails · 51 days inactive',
  },
]

export default function SetupScreen() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { connectedSources, connectSource, completeAccessGate } = useApp()
  const [connectingId, setConnectingId] = useState(null)
  const [scanDone, setScanDone] = useState(false)

  const connectedCount = useMemo(
    () => Object.values(connectedSources).filter(Boolean).length,
    [connectedSources]
  )
  const nextPath = params.get('next') === 'subscriptions' ? '/subscriptions' : '/home'

  function simulateConnect(id) {
    setConnectingId(id)
    window.setTimeout(() => {
      connectSource(id)
      setConnectingId(null)
    }, 650)
  }

  function runAgentScan() {
    setScanDone(true)
    completeAccessGate()
    window.setTimeout(() => navigate(nextPath), 850)
  }

  function continueBankOnly() {
    completeAccessGate()
    navigate('/subscriptions')
  }

  return (
    <div className={styles.screen}>
      <button className={styles.back} onClick={() => navigate('/home')}>← Home</button>

      <section className={styles.hero}>
        <div className={styles.lockIcon} />
        <h1>Connect AI access</h1>
        <p>Tangerine can detect recurring charges from your account. The AI agent needs your permission to verify whether you actually use them.</p>
      </section>

      <section className={styles.agentCard}>
        <span>Agentic scan plan</span>
        <strong>1. Match charges → 2. Verify usage → 3. Recommend action → 4. Ask before canceling</strong>
        <p>The agent never receives passwords and cannot send cancellation requests without your approval.</p>
      </section>

      <section className={styles.bankCard}>
        <div>
          <span className={styles.cardEyebrow}>Already detected from Tangerine</span>
          <strong>11 recurring payments · $189/mo</strong>
          <em>Bank data identifies charges. Connected accounts add usage evidence and renewal context.</em>
        </div>
      </section>

      <section className={styles.accessList}>
        <h2>Connect accounts for AI evidence</h2>
        {SOURCES.map(source => {
          const isConnected = connectedSources[source.id]
          const isConnecting = connectingId === source.id

          return (
            <div key={source.id} className={`${styles.sourceCard} ${isConnected ? styles.connectedSource : ''}`}>
              <div className={styles.sourceTop}>
                <span className={styles.sourceIcon}>{isConnected ? '✓' : source.title.slice(0, 1)}</span>
                <div>
                  <strong>{source.title}</strong>
                  <em>{source.subtitle}</em>
                </div>
                <button
                  className={styles.sourceBtn}
                  onClick={() => simulateConnect(source.id)}
                  disabled={isConnected || isConnecting}
                >
                  {isConnected ? 'Connected' : isConnecting ? 'Connecting' : 'Connect'}
                </button>
              </div>
              <p>{source.desc}</p>
              <small>{isConnected ? source.signal : source.scope}</small>
            </div>
          )
        })}
      </section>

      <section className={styles.privacy}>
        <h2>Bank-safe rules</h2>
        <div className={styles.privacyRow}>
          <span>Consent</span>
          <strong>You choose each source and can continue with bank data only.</strong>
        </div>
        <div className={styles.privacyRow}>
          <span>Access</span>
          <strong>Read-only evidence. No passwords, no money movement, no unrelated inbox reading.</strong>
        </div>
        <div className={styles.privacyRow}>
          <span>Action</span>
          <strong>The agent drafts or sends cancellation only after you approve.</strong>
        </div>
      </section>

      <button
        className={`${styles.connectBtn} ${scanDone ? styles.connected : ''}`}
        onClick={runAgentScan}
        disabled={connectedCount === 0 || scanDone || connectingId}
      >
        {scanDone ? 'AI scan complete' : `Run AI scan with ${connectedCount} connected source${connectedCount === 1 ? '' : 's'}`}
      </button>

      <button className={styles.skipBtn} onClick={continueBankOnly}>
        Continue with bank data only
      </button>
    </div>
  )
}
