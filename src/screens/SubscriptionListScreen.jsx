import React, { useMemo, useState } from 'react'
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
  GOODFOOD: 'GF',
}

const FREQUENCIES = [
  { value: 'monthly', label: 'Monthly', suffix: '/mo' },
  { value: 'weekly', label: 'Weekly', suffix: '/wk' },
  { value: 'yearly', label: 'Yearly', suffix: '/yr' },
]

export default function SubscriptionListScreen() {
  const navigate = useNavigate()
  const { subscriptions } = useApp()
  const [frequency, setFrequency] = useState('monthly')
  const totals = computeTotals(subscriptions)
  const active = subscriptions.filter(s => !s.cancelled)
  const subscriptionMonthlyTotal = active
    .filter(s => s.billingCycle !== 'weekly')
    .reduce((sum, sub) => sum + sub.monthlyEquivalent, 0)

  const frequencySubs = useMemo(
    () => active.filter(sub => getFrequency(sub) === frequency),
    [active, frequency]
  )

  const cancelGroup = frequencySubs.filter(s => s.verdict === 'CANCEL').slice(0, 2)
  const reviewGroup = frequencySubs.filter(s => s.verdict === 'REVIEW').slice(0, 2)
  const keepGroup = frequencySubs.filter(s => s.verdict === 'KEEP').slice(0, 4)
  const selectedFrequency = FREQUENCIES.find(item => item.value === frequency)
  const frequencyTotal = frequencySubs.reduce((sum, sub) => sum + getDisplayAmount(sub, frequency), 0)

  return (
    <div className={styles.screen}>
      <button className={styles.back} onClick={() => navigate('/home')}>← Home</button>
      <h1>Your subscriptions</h1>
      <p className={styles.subtitle}>{Math.max(11, totals.total)} found · ${subscriptionMonthlyTotal.toFixed(0)}/mo</p>

      <div className={styles.summary}>
        <div className={styles.summaryCancel}><strong>{Math.max(3, totals.cancelCount)}</strong><span>Cancel</span></div>
        <div className={styles.summaryReview}><strong>{Math.max(2, totals.reviewCount)}</strong><span>Review</span></div>
        <div className={styles.summaryKeep}><strong>{Math.max(6, totals.keepCount)}</strong><span>Keep</span></div>
      </div>

      <section className={styles.frequencyPanel}>
        <label htmlFor="frequency-select">Recurring statements</label>
        <div className={styles.selectWrap}>
          <select
            id="frequency-select"
            value={frequency}
            onChange={event => setFrequency(event.target.value)}
          >
            {FREQUENCIES.map(item => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </div>
        <p>
          {frequencySubs.length > 0
            ? `${frequencySubs.length} ${selectedFrequency.label.toLowerCase()} recurring payment${frequencySubs.length === 1 ? '' : 's'} · $${frequencyTotal.toFixed(0)}${selectedFrequency.suffix}`
            : `No ${selectedFrequency.label.toLowerCase()} recurring payments detected`}
        </p>
      </section>

      {frequencySubs.length === 0 ? (
        <section className={styles.emptyState}>
          <strong>No {selectedFrequency.label.toLowerCase()} statements yet</strong>
          <span>Tangerine will keep scanning new transactions and activity signals for this frequency.</span>
        </section>
      ) : (
        <>
          {cancelGroup.length > 0 && (
            <Section title="Cancel these">
              {cancelGroup.map(sub => <SubRow key={sub.id} sub={sub} frequency={frequency} variant="cancel" onClick={() => navigate(`/subscription/${sub.id}`)} />)}
            </Section>
          )}

          {reviewGroup.length > 0 && (
            <Section title="Review these">
              {reviewGroup.map(sub => <SubRow key={sub.id} sub={sub} frequency={frequency} variant="review" onClick={() => navigate(`/subscription/${sub.id}`)} />)}
            </Section>
          )}

          {keepGroup.length > 0 && (
            <Section title="Keep these">
              {keepGroup.map(sub => <SubRow key={sub.id} sub={sub} frequency={frequency} variant="keep" onClick={() => navigate(`/subscription/${sub.id}`)} />)}
            </Section>
          )}
        </>
      )}
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

function SubRow({ sub, variant, frequency, onClick }) {
  const name = sub.kb?.name || sub.merchantName
  const label = getLabel(sub, variant)
  const suffix = FREQUENCIES.find(item => item.value === frequency)?.suffix || '/mo'
  const amount = getDisplayAmount(sub, frequency)

  return (
    <button className={`${styles.subRow} ${styles[variant]}`} onClick={onClick}>
      <span className={styles.logo}>{initials[sub.knowledgeKey] || name.slice(0, 2)}</span>
      <span className={styles.info}>
        <strong>{name}</strong>
        <em>{label}</em>
      </span>
      <span className={styles.price}>
        <strong>${amount.toFixed(2)}</strong>
        <small>{suffix}</small>
        <em>{variant === 'cancel' ? 'Cancel' : variant === 'review' ? 'Review' : 'Keep'}</em>
      </span>
    </button>
  )
}

function getLabel(sub, variant) {
  if (sub.knowledgeKey === 'LINKEDIN') return 'Renews in 7 days · 45d unused'
  if (sub.knowledgeKey === 'DUOLINGO') return '73 days no opens'
  if (sub.knowledgeKey === 'CANVA') return 'Used 2× last month'
  if (sub.knowledgeKey === 'GOODFOOD') return 'Weekly box · 36d inactive'
  if (variant === 'keep') return sub.daysInactive === 0 ? 'Used daily' : 'Used regularly'
  return `${sub.daysInactive}d unused`
}

function getFrequency(sub) {
  if (sub.knowledgeKey === 'LINKEDIN' || sub.billingCycle === 'annual') return 'yearly'
  if (sub.billingCycle === 'weekly') return 'weekly'
  return 'monthly'
}

function getDisplayAmount(sub, frequency) {
  if (frequency === 'yearly') return sub.annualCost
  if (frequency === 'weekly') return sub.monthlyEquivalent / 4.33
  return sub.monthlyEquivalent
}
