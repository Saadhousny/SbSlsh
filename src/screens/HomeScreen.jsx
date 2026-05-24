import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { computeTotals } from '../utils/subscriptionDetector'
import styles from './HomeScreen.module.css'

export default function HomeScreen() {
  const navigate = useNavigate()
  const { subscriptions, userProfile } = useApp()

  const totals = computeTotals(subscriptions)
  const cancelSubs = subscriptions.filter(s => s.verdict === 'CANCEL' && !s.cancelled)
  const renewalSub = cancelSubs.find(s => s.knowledgeKey === 'LINKEDIN') || cancelSubs[0]

  return (
    <div className={styles.screen}>
      <section className={styles.hero}>
        <p className={styles.greeting}>Good morning, {userProfile.name}</p>
        <h1 className={styles.balance}>$4,218.50</h1>
        <p className={styles.account}>Chequing · ends {userProfile.cardLast4}</p>

        <div className={styles.heroTiles}>
          <button className={styles.heroTile} onClick={() => navigate('/subscriptions')}>
            <span>Monthly subs</span>
            <strong>${totals.monthlyTotal.toFixed(0)}</strong>
          </button>
          <button className={styles.heroTile} onClick={() => navigate('/subscriptions')}>
            <span>Can save</span>
            <strong className={styles.saving}>${Math.max(97, Math.round(totals.monthlySavings))}/mo</strong>
          </button>
        </div>
      </section>

      <section className={styles.content}>
        <h2 className={styles.sectionTitle}>AI Coach Alerts</h2>

        <button className={`${styles.alertCard} ${styles.lifeCard}`} onClick={() => navigate('/home')}>
          <div className={styles.alertTop}>
            <strong><span className={styles.symbol}>⌘</span> Life change detected</strong>
            <span className={styles.aiBadge}>AI</span>
          </div>
          <p>Your grocery spend is up 40% and you've started buying baby products. We have 3 financial moves that could help. Tap to see them.</p>
        </button>

        {renewalSub && (
          <button className={`${styles.alertCard} ${styles.renewalCard}`} onClick={() => navigate(`/subscription/${renewalSub.id}`)}>
            <div className={styles.alertTop}>
              <strong><span className={styles.symbol}>!</span> Renewal in 7 days</strong>
              <span>${renewalSub.annualCost.toFixed(0)}/yr</span>
            </div>
            <p>{renewalSub.kb?.name || renewalSub.merchantName} renews May 31. You haven't logged in for {renewalSub.daysInactive} days. Tap to cancel.</p>
          </button>
        )}

        {cancelSubs.length > 0 && (
          <button className={`${styles.alertCard} ${styles.savingsCard}`} onClick={() => navigate('/subscriptions')}>
            <div className={styles.alertTop}>
              <strong><span className={styles.symbol}>☼</span> {Math.max(3, cancelSubs.length)} unused subscriptions</strong>
            </div>
            <p>Duolingo, Canva Pro, and LinkedIn could save you $97/mo. Tap to review all.</p>
          </button>
        )}

        <h2 className={styles.sectionTitle}>Recent Transactions</h2>
        <div className={styles.transactions}>
          {[
            ['Netflix', '-$20.99'],
            ['Spotify', '-$11.99'],
            ['Sobeys', '-$187.43'],
          ].map(([name, amount]) => (
            <div className={styles.txRow} key={name}>
              <span>{name}</span>
              <strong>{amount}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
