import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import styles from './CancellationScreen.module.css'

const STEPS = [
  'Approval confirmed',
  'Email sent to LinkedIn support',
  'Sending via Gmail API',
  'Monitoring for confirmation',
]

export default function CancellationScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getSubscription, subscriptions, markCancelled } = useApp()
  const sub = getSubscription(id)
  const [phase, setPhase] = useState('progress')
  const [currentStep, setCurrentStep] = useState(0)

  const nextSubs = subscriptions
    .filter(s => s.id !== id && (s.verdict === 'CANCEL' || s.verdict === 'REVIEW') && !s.cancelled)
    .slice(0, 1)

  useEffect(() => {
    if (!sub || phase !== 'progress') return

    let step = 0
    const interval = setInterval(() => {
      step += 1
      setCurrentStep(step)
      if (step >= STEPS.length) {
        clearInterval(interval)
        markCancelled(id)
        setTimeout(() => setPhase('done'), 450)
      }
    }, 850)

    return () => clearInterval(interval)
  }, [sub, phase, id, markCancelled])

  if (!sub) {
    return (
      <div className={styles.notFound}>
        <p>Subscription not found.</p>
        <button onClick={() => navigate('/subscriptions')}>Back</button>
      </div>
    )
  }

  const name = sub.kb?.name || sub.merchantName
  const annualSavings = sub.annualCost.toFixed(2)

  if (phase === 'progress') {
    return (
      <div className={styles.screen}>
        <section className={styles.progressHeader}>
          <h1>Cancelling now...</h1>
          <p>Agent is working — do not close the app</p>
        </section>
        <div className={styles.progressBar}><span /></div>
        <p className={styles.doneIncoming}>Done — confirmation incoming</p>

        <div className={styles.steps}>
          {STEPS.map((label, index) => (
            <div className={styles.step} key={label}>
              <span className={index <= currentStep ? styles.check : styles.pending}>✓</span>
              <strong className={index > currentStep ? styles.muted : ''}>{label}</strong>
            </div>
          ))}
        </div>

        <div className={styles.note}>
          The agent sends a cancellation request to {name}'s support email on your behalf. You'll receive a confirmation in your inbox within 24 hours. No AI involved in this step — it's a standard email via Gmail API.
        </div>
      </div>
    )
  }

  return (
    <div className={styles.screen}>
      <section className={styles.doneHeader}>
        <div className={styles.checkCircle}>✓</div>
        <h1>Cancellation sent</h1>
        <p>{name} will confirm within 24 hours</p>
      </section>

      <section className={styles.summary}>
        <Row label="You saved" value={`$${annualSavings}/yr`} green />
        <Row label="Confirmation email" value="Sent to inbox" />
        <Row label="Access until" value="May 31, 2026" />
        <Row label="Monitoring" value="Active" green />
      </section>

      <section className={styles.watch}>
        <h2>Agent is watching</h2>
        <p>If {name} charges your card again after May 31, the agent will alert you immediately and draft a dispute for Tangerine support.</p>
      </section>

      {nextSubs.length > 0 && (
        <section className={styles.next}>
          <h2>{Math.max(2, nextSubs.length)} more to cancel</h2>
          {nextSubs.map(s => (
            <button className={styles.nextCard} key={s.id} onClick={() => navigate(`/subscription/${s.id}`)}>
              <span>{s.knowledgeKey === 'DUOLINGO' ? 'DL' : (s.kb?.name || s.merchantName).slice(0, 2)}</span>
              <div>
                <strong>{s.kb?.name || s.merchantName}</strong>
                <em>${s.monthlyEquivalent.toFixed(2)}/mo · {s.daysInactive}d unused</em>
              </div>
              <b>Cancel</b>
            </button>
          ))}
        </section>
      )}

      <button className={styles.backHome} onClick={() => navigate('/home')}>Back to home</button>
    </div>
  )
}

function Row({ label, value, green }) {
  return (
    <div className={styles.row}>
      <span>{label}</span>
      <strong className={green ? styles.green : ''}>{value}</strong>
    </div>
  )
}
