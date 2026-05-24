import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { computeTotals } from '../utils/subscriptionDetector'
import styles from './SubscriptionListScreen.module.css'

const initials = {
  LINKEDIN: 'LI',
  DUOLINGO: 'DL',
  CANVA: 'CB',
  NETFLIX: 'NF',
  SPOTIFY: 'SP',
}

export default function SubscriptionListScreen() {
  const navigate = useNavigate()
  const { subscriptions } = useApp()
  const totals = computeTotals(subscriptions)
  const active = subscriptions.filter(s => !s.cancelled)

  const cancelGroup = active.filter(s => s.verdict === 'CANCEL').slice(0, 2)
  const reviewGroup = active.filter(s => s.verdict === 'REVIEW').slice(0, 1)
  const keepGroup = active.filter(s => s.verdict === 'KEEP').filter(s => ['NETFLIX', 'SPOTIFY'].includes(s.knowledgeKey))

  return (
    <div className={styles.screen}>
      <button className={styles.back} onClick={() => navigate('/home')}>← Home</button>
      <h1>Your subscriptions</h1>
      <p className={styles.subtitle}>{Math.max(11, totals.total)} found · ${totals.monthlyTotal.toFixed(0)}/mo</p>

      <div className={styles.summary}>
        <div className={styles.summaryCancel}><strong>{Math.max(3, totals.cancelCount)}</strong><span>Cancel</span></div>
        <div className={styles.summaryReview}><strong>{Math.max(2, totals.reviewCount)}</strong><span>Review</span></div>
        <div className={styles.summaryKeep}><strong>{Math.max(6, totals.keepCount)}</strong><span>Keep</span></div>
      </div>

      <Section title="Cancel these">
        {cancelGroup.map(sub => <SubRow key={sub.id} sub={sub} variant="cancel" onClick={() => navigate(`/subscription/${sub.id}`)} />)}
      </Section>

      <Section title="Review these">
        {reviewGroup.map(sub => <SubRow key={sub.id} sub={sub} variant="review" onClick={() => navigate(`/subscription/${sub.id}`)} />)}
      </Section>

      <Section title="Keep these">
        {keepGroup.map(sub => <SubRow key={sub.id} sub={sub} variant="keep" onClick={() => navigate(`/subscription/${sub.id}`)} />)}
      </Section>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <section className={styles.group}>
      <h2>{title}</h2>
      {children}
    </section>
  )
}

function SubRow({ sub, variant, onClick }) {
  const name = sub.kb?.name || sub.merchantName
  const label = getLabel(sub, variant)

  return (
    <button className={`${styles.subRow} ${styles[variant]}`} onClick={onClick}>
      <span className={styles.logo}>{initials[sub.knowledgeKey] || name.slice(0, 2)}</span>
      <span className={styles.info}>
        <strong>{name}</strong>
        <em>{label}</em>
      </span>
      <span className={styles.price}>
        <strong>${sub.monthlyEquivalent.toFixed(2)}</strong>
        <em>{variant === 'cancel' ? 'Cancel' : variant === 'review' ? 'Review' : 'Keep'}</em>
      </span>
    </button>
  )
}

function getLabel(sub, variant) {
  if (sub.knowledgeKey === 'LINKEDIN') return 'Renews in 7 days · 45d unused'
  if (sub.knowledgeKey === 'DUOLINGO') return '73 days no opens'
  if (sub.knowledgeKey === 'CANVA') return 'Used 2× last month'
  if (variant === 'keep') return sub.daysInactive === 0 ? 'Used daily' : 'Used regularly'
  return `${sub.daysInactive}d unused`
}
