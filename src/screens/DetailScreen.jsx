import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import styles from './DetailScreen.module.css'

const initials = {
  LINKEDIN: 'LI',
  DUOLINGO: 'DL',
  CANVA: 'CB',
  NETFLIX: 'NF',
  SPOTIFY: 'SP',
}

export default function DetailScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getSubscription } = useApp()
  const [questionOpen, setQuestionOpen] = useState(false)
  const sub = getSubscription(id)

  if (!sub) {
    return (
      <div className={styles.notFound}>
        <p>Subscription not found.</p>
        <button onClick={() => navigate('/subscriptions')}>Back to list</button>
      </div>
    )
  }

  const name = sub.kb?.name || sub.merchantName
  const monthly = sub.monthlyEquivalent.toFixed(2)
  const annual = sub.annualCost.toFixed(2)
  const isLinkedIn = sub.knowledgeKey === 'LINKEDIN'
  const lastUsed = isLinkedIn ? '45 days ago' : `${sub.daysInactive} days ago`
  const renews = isLinkedIn ? 'May 31 · 7 days' : formatDate(sub.nextRenewal)

  return (
    <div className={styles.screen}>
      <button className={styles.back} onClick={() => navigate('/subscriptions')}>← Subscriptions</button>

      <section className={styles.serviceHeader}>
        <div className={styles.logo}>{initials[sub.knowledgeKey] || name.slice(0, 2)}</div>
        <div>
          <h1>{name}</h1>
          <p>{isLinkedIn ? 'Career plan · annual' : `${capitalize(sub.billingCycle)} plan`}</p>
        </div>
      </section>

      <section className={styles.aiCard}>
        <h2><span>AI</span> AI recommendation</h2>
        <p>
          {isLinkedIn
            ? 'You used 0 of 5 InMails, never opened the app in 45 days, and applied to 0 jobs with Premium filters. Every paid feature went unused. Cancel and save $599.88 this year.'
            : `You have not used ${name} in ${sub.daysInactive} days. The agent can cancel it and monitor your Tangerine card for any repeat charges.`}
        </p>
      </section>

      <section className={styles.data}>
        <Row label="Monthly cost" value={`$${monthly}`} />
        <Row label="Annual cost" value={`$${annual}`} />
        <Row label="Last used" value={lastUsed} danger />
        <Row label="Renews" value={renews} danger />
        <Row label="Free plan available" value={sub.kb?.freePlan ? 'Yes' : 'No'} green />
        <Row label="Best alternative" value={sub.kb?.freePlan ? `${name.replace(' Premium', '')} Free` : sub.kb?.cheapestPaid || 'None'} />
      </section>

      {sub.kb?.freePlan && (
        <section className={styles.freeCard}>
          <h2>What you keep on free</h2>
          <p>{isLinkedIn ? 'Full profile · messaging connections · job search · feed · network browsing' : sub.kb.freeDescription}</p>
        </section>
      )}

      <button className={styles.primaryCta} onClick={() => navigate(`/cancel/${sub.id}`)}>
        Cancel — agent handles it
      </button>
      <button className={styles.secondaryCta} onClick={() => setQuestionOpen(!questionOpen)}>
        Ask a question first ↗
      </button>

      {questionOpen && (
        <div className={styles.answer}>
          <strong>AI coach</strong>
          <p>You keep the free account, connections, and profile. You lose paid discovery tools like InMail and Premium insights.</p>
        </div>
      )}
    </div>
  )
}

function Row({ label, value, danger, green }) {
  return (
    <div className={styles.row}>
      <span>{label}</span>
      <strong className={`${danger ? styles.danger : ''} ${green ? styles.green : ''}`}>{value}</strong>
    </div>
  )
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
}
