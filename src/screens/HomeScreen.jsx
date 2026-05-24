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
  const hasMusicDuplicate = subscriptions.some(s => s.knowledgeKey === 'SPOTIFY' && !s.cancelled) &&
    subscriptions.some(s => s.knowledgeKey === 'APPLEMUSIC' && !s.cancelled)
  const appleMusic = subscriptions.find(s => s.knowledgeKey === 'APPLEMUSIC' && !s.cancelled)
  const subscriptionMonthlyTotal = subscriptions
    .filter(s => s.billingCycle !== 'weekly')
    .reduce((sum, sub) => sum + sub.monthlyEquivalent, 0)

  return (
    <div className={styles.screen}>
      <section className={styles.hero}>
        <p className={styles.greeting}>Good morning, {userProfile.name}</p>
        <h1 className={styles.balance}>$4,218.50</h1>
        <p className={styles.account}>Chequing · ends {userProfile.cardLast4}</p>

        <div className={styles.heroTiles}>
          <button className={styles.heroTile} onClick={() => navigate('/subscriptions')}>
            <span>Monthly subs</span>
            <strong>${subscriptionMonthlyTotal.toFixed(0)}</strong>
          </button>
          <button className={styles.heroTile} onClick={() => navigate('/subscriptions')}>
            <span>Can save</span>
            <strong className={styles.saving}>${Math.max(97, Math.round(totals.monthlySavings))}/mo</strong>
          </button>
        </div>
      </section>

      <section className={styles.content}>
        <h2 className={styles.sectionTitle}>Subscription Alerts</h2>

        {renewalSub && (
          <button className={`${styles.alertCard} ${styles.renewalCard}`} onClick={() => navigate(`/subscription/${renewalSub.id}`)}>
            <div className={styles.alertTop}>
              <strong><span className={styles.alertMark}>!</span> Renewal in 7 days</strong>
              <span>${renewalSub.annualCost.toFixed(0)}/yr</span>
            </div>
            <p>{renewalSub.kb?.name || renewalSub.merchantName} renews May 31. You haven't logged in for {renewalSub.daysInactive} days. Tap to cancel.</p>
          </button>
        )}

        {cancelSubs.length > 0 && (
          <button className={`${styles.alertCard} ${styles.savingsCard}`} onClick={() => navigate('/subscriptions')}>
            <div className={styles.alertTop}>
              <strong><span className={styles.bulbMark} /> {Math.max(3, cancelSubs.length)} unused subscriptions</strong>
            </div>
            <p>Duolingo, Canva Pro, and LinkedIn could save you $97/mo. Tap to review all.</p>
          </button>
        )}

        {hasMusicDuplicate && appleMusic && (
          <button className={`${styles.alertCard} ${styles.duplicateCard}`} onClick={() => navigate(`/subscription/${appleMusic.id}`)}>
            <div className={styles.alertTop}>
              <strong><span className={styles.duplicateMark}>2</span> Duplicate subscription found</strong>
              <span>${appleMusic.annualCost.toFixed(0)}/yr</span>
            </div>
            <p>You pay for Spotify and Apple Music. Spotify is used daily, but Apple Music has no usage signal for 62 days. AI recommends cancelling Apple Music.</p>
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
