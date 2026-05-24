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
  APPLEMUSIC: 'AM',
  GOODFOOD: 'GF',
}

export default function DetailScreen() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getSubscription, subscriptions } = useApp()
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
  const intelligence = getAiIntelligence(sub, subscriptions)

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

      <section className={styles.intentCard}>
        <div className={styles.intentTop}>
          <div>
            <span>Intent score</span>
            <strong>{intelligence.score}% {intelligence.scoreLabel}</strong>
          </div>
          <b>{intelligence.confidence}</b>
        </div>
        <div className={styles.scoreTrack}>
          <span style={{ width: `${intelligence.score}%` }} />
        </div>
        <p>{intelligence.scoreReason}</p>
      </section>

      <section className={styles.actionCard}>
        <span>AI action recommended</span>
        <strong>{intelligence.action}</strong>
        <p>{intelligence.actionReason}</p>
      </section>

      {intelligence.duplicate && (
        <section className={styles.duplicateCard}>
          <span>Duplicate detected</span>
          <strong>{intelligence.duplicate.title}</strong>
          <p>{intelligence.duplicate.copy}</p>
        </section>
      )}

      <section className={styles.data}>
        <Row label="Monthly cost" value={`$${monthly}`} />
        <Row label="Annual cost" value={`$${annual}`} />
        <Row label="Last used" value={lastUsed} danger />
        <Row label="Renews" value={renews} danger />
        <Row label="Free plan available" value={sub.kb?.freePlan ? 'Yes' : 'No'} green />
        <Row label="Best alternative" value={sub.kb?.freePlan ? `${name.replace(' Premium', '')} Free` : sub.kb?.cheapestPaid || 'None'} />
      </section>

      <section className={styles.freeCard}>
        <h2>What you keep if AI cancels</h2>
        <p>{intelligence.keep}</p>
        <h2 className={styles.loseTitle}>What you lose</h2>
        <p>{intelligence.lose}</p>
      </section>

      <section className={styles.monitorCard}>
        <h2>After cancel protection</h2>
        <p>Agent watches Tangerine transactions for 30 days after access ends. If another charge appears, it alerts you and drafts a dispute with the evidence trail attached.</p>
      </section>

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

function getAiIntelligence(sub, subscriptions) {
  const isLinkedIn = sub.knowledgeKey === 'LINKEDIN'
  const isAppleMusic = sub.knowledgeKey === 'APPLEMUSIC'
  const isCanva = sub.knowledgeKey === 'CANVA'
  const hasSpotify = subscriptions.some(item => item.knowledgeKey === 'SPOTIFY' && !item.cancelled)
  const hasApple = subscriptions.some(item => item.knowledgeKey === 'APPLEMUSIC' && !item.cancelled)

  if (isLinkedIn) {
    return {
      score: 92,
      scoreLabel: 'unused',
      confidence: 'High',
      scoreReason: 'AI found no login signal, 0 InMails used, 0 Premium job applications, and an annual renewal within 7 days.',
      action: 'Cancel before renewal',
      actionReason: 'The free plan keeps your profile, network, feed, and job search. Paid Premium features are not being used.',
      keep: 'Full profile, messaging connections, job search, feed, and network browsing.',
      lose: 'InMail credits, Premium filters, who-viewed-profile insights, and LinkedIn Learning access.',
      duplicate: null,
    }
  }

  if (isAppleMusic && hasSpotify) {
    return {
      score: 88,
      scoreLabel: 'duplicate',
      confidence: 'High',
      scoreReason: 'Spotify is used daily while Apple Music has no listening or app activity signal for 62 days.',
      action: 'Cancel duplicate music plan',
      actionReason: 'Keeping Spotify covers the same listening need and removes a second music subscription.',
      keep: 'Your Apple ID, purchased music, playlists stored in your library, and access to free radio remain.',
      lose: 'Apple Music streaming catalogue, downloads, and synced listening across devices.',
      duplicate: {
        title: 'Spotify + Apple Music',
        copy: 'AI detected two music services. It recommends keeping Spotify because usage signals show daily listening there.',
      },
    }
  }

  if (isCanva) {
    return {
      score: 54,
      scoreLabel: 'light use',
      confidence: 'Medium',
      scoreReason: 'AI found 2 exports last month, so this is not safe to cancel automatically.',
      action: 'Downgrade or review first',
      actionReason: 'You still use Canva occasionally. AI recommends checking whether the free plan covers your current needs.',
      keep: 'Most templates, basic design editing, limited exports, and free assets.',
      lose: 'Brand Kit, premium assets, background remover, magic resize, and Pro team controls.',
      duplicate: null,
    }
  }

  return {
    score: sub.verdict === 'KEEP' ? 18 : sub.verdict === 'REVIEW' ? 61 : 84,
    scoreLabel: sub.verdict === 'KEEP' ? 'active' : sub.verdict === 'REVIEW' ? 'uncertain' : 'unused',
    confidence: sub.verdict === 'KEEP' ? 'Low risk' : 'Medium',
    scoreReason: `AI compared recurring charges with available activity signals. Last detected use: ${sub.daysInactive ?? 'unknown'} days ago.`,
    action: sub.verdict === 'KEEP' ? 'Keep monitoring' : sub.verdict === 'REVIEW' ? 'Ask before cancelling' : 'Cancel and monitor',
    actionReason: sub.verdict === 'KEEP'
      ? 'Recent usage signals suggest this subscription is still valuable.'
      : 'The agent should confirm before acting, then monitor for repeat charges after cancellation.',
    keep: sub.kb?.freeDescription || 'Account access and any free-tier features remain available.',
    lose: sub.kb?.whatYouLose || 'Paid plan benefits and premium features stop after cancellation.',
    duplicate: hasApple && hasSpotify && sub.knowledgeKey === 'SPOTIFY'
      ? {
          title: 'Spotify + Apple Music',
          copy: 'AI found Apple Music as an unused duplicate. Keep Spotify because it has daily usage signals.',
        }
      : null,
  }
}
