import Papa from 'papaparse'
import { MERCHANT_PATTERNS, SUBSCRIPTION_KB } from '../data/subscriptionKnowledgeBase'
import { SAMPLE_LAST_ACTIVITY } from '../data/sampleTransactions'

// ─── Step 1: Normalize merchant names ────────────────────────────────────────
export function normalizeMerchant(rawName) {
  if (!rawName) return ''
  let name = rawName.trim().toUpperCase()

  // Strip payment processor prefixes
  name = name.replace(/^(SQ\*|TST\*|SP\s|PP\*|PAYPAL\s*\*|STRIPE\s*\*)/i, '')

  // Strip location suffixes (province codes, store numbers)
  name = name.replace(/\s+(ON|QC|BC|AB|MB|SK|NS|NB|PE|NL|NT|NU|YT)\s*$/i, '')
  name = name.replace(/\s+#\d+$/, '')
  name = name.replace(/\s+\d{4,}$/, '')

  // Strip common trailing patterns
  name = name.replace(/\s*(INC|LLC|LTD|CORP|CO)\.?$/i, '')
  name = name.trim()

  return name
}

// ─── Step 2 & 3: Group transactions and detect recurring charges ──────────────
export function detectSubscriptions(transactions) {
  // Group by normalized merchant + amount (±$0.50 tolerance)
  const groups = {}

  for (const tx of transactions) {
    const normalized = normalizeMerchant(tx.description || tx.Description || '')
    const amount = Math.abs(parseFloat(tx.amount || tx.Amount || 0))
    if (!normalized || amount === 0) continue

    // Find or create a group key
    let groupKey = null
    for (const key of Object.keys(groups)) {
      const [gName, gAmt] = key.split('|||')
      if (gName === normalized && Math.abs(parseFloat(gAmt) - amount) <= 0.50) {
        groupKey = key
        break
      }
    }
    if (!groupKey) {
      groupKey = `${normalized}|||${amount}`
      groups[groupKey] = []
    }
    groups[groupKey].push({
      date: new Date(tx.date || tx.Date),
      amount,
      normalized,
      raw: tx.description || tx.Description,
    })
  }

  const subscriptions = []

  for (const [key, charges] of Object.entries(groups)) {
    if (charges.length < 2) continue // Need at least 2 occurrences

    // Sort by date
    charges.sort((a, b) => a.date - b.date)

    // Calculate gaps between consecutive charges (in days)
    const gaps = []
    for (let i = 1; i < charges.length; i++) {
      const diffMs = charges[i].date - charges[i - 1].date
      gaps.push(Math.round(diffMs / (1000 * 60 * 60 * 24)))
    }

    // Check if gaps cluster around weekly, monthly, annual, or semi-annual cycles.
    const isWeekly = gaps.every(g => g >= 6 && g <= 8)
    const isMonthly = gaps.every(g => g >= 25 && g <= 35)
    const isAnnual = gaps.every(g => g >= 355 && g <= 375)
    const isSemiAnnual = gaps.every(g => g >= 175 && g <= 195)

    if (!isWeekly && !isMonthly && !isAnnual && !isSemiAnnual) continue

    const [normalizedName, amountStr] = key.split('|||')
    const amount = parseFloat(amountStr)
    const lastCharge = charges[charges.length - 1].date
    const billingCycle = isWeekly ? 'weekly' : isAnnual ? 'annual' : isSemiAnnual ? 'semi-annual' : 'monthly'
    const monthlyEquivalent = isWeekly ? amount * 4.33 : isAnnual ? amount / 12 : isSemiAnnual ? amount / 6 : amount

    // Determine next renewal date
    let nextRenewal = new Date(lastCharge)
    if (isWeekly) nextRenewal.setDate(nextRenewal.getDate() + 7)
    else if (isMonthly) nextRenewal.setMonth(nextRenewal.getMonth() + 1)
    else if (isAnnual) nextRenewal.setFullYear(nextRenewal.getFullYear() + 1)
    else nextRenewal.setMonth(nextRenewal.getMonth() + 6)

    // Match to known subscription
    let knowledgeKey = null
    for (const { pattern, key: k } of MERCHANT_PATTERNS) {
      if (pattern.test(normalizedName) || pattern.test(charges[0].raw)) {
        knowledgeKey = k
        break
      }
    }

    subscriptions.push({
      id: normalizedName.replace(/\s+/g, '_').toLowerCase(),
      merchantName: normalizedName,
      rawName: charges[0].raw,
      knowledgeKey,
      amount,
      monthlyEquivalent,
      billingCycle,
      lastCharge,
      nextRenewal,
      chargeCount: charges.length,
      allCharges: charges,
    })
  }

  return subscriptions
}

// ─── Step 4: Apply CANCEL / REVIEW / KEEP verdict rules ──────────────────────
export function applyVerdicts(subscriptions, lastActivityData = {}) {
  const today = new Date()

  return subscriptions.map(sub => {
    const kb = sub.knowledgeKey ? SUBSCRIPTION_KB[sub.knowledgeKey] : null
    const activity = lastActivityData[sub.knowledgeKey] || null
    const daysInactive = activity ? activity.daysAgo : null

    // Days until next renewal
    const daysUntilRenewal = Math.round((sub.nextRenewal - today) / (1000 * 60 * 60 * 24))

    let verdict = 'KEEP'
    let verdictReason = ''
    let urgency = false

    if (daysInactive !== null) {
      if (daysInactive > 45) {
        verdict = 'CANCEL'
        verdictReason = `Last active ${daysInactive} days ago — well past the 45-day threshold`
      } else if (
        sub.billingCycle === 'annual' &&
        daysUntilRenewal >= 0 &&
        daysUntilRenewal <= 14 &&
        daysInactive > 30
      ) {
        verdict = 'CANCEL'
        urgency = true
        verdictReason = `Annual renewal in ${daysUntilRenewal} days and unused for ${daysInactive} days — cancel before renewal`
      } else if (daysInactive >= 20 && daysInactive <= 45) {
        verdict = 'REVIEW'
        verdictReason = `Usage has dropped — last active ${daysInactive} days ago`
      } else {
        verdict = 'KEEP'
        verdictReason = `Actively used ${daysInactive === 0 ? 'today' : `${daysInactive} days ago`}`
      }
    } else {
      // No activity data — default to REVIEW for unknown
      verdict = 'REVIEW'
      verdictReason = 'No activity data available — review manually'
    }

    const annualCost = sub.monthlyEquivalent * 12
    const potentialSaving =
      verdict === 'CANCEL' || verdict === 'REVIEW' ? sub.monthlyEquivalent : 0

    return {
      ...sub,
      verdict,
      verdictReason,
      urgency,
      daysInactive,
      daysUntilRenewal,
      annualCost,
      potentialSaving,
      kb,
      activity,
      cancelled: false,
    }
  })
}

// ─── Main entry: parse CSV and return verdicted subscriptions ─────────────────
export function analyzeTransactions(csvText, lastActivityData = SAMPLE_LAST_ACTIVITY) {
  const { data } = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  })

  const subscriptions = detectSubscriptions(data)
  const withVerdicts = applyVerdicts(subscriptions, lastActivityData)

  // Sort: CANCEL first, then REVIEW, then KEEP
  const order = { CANCEL: 0, REVIEW: 1, KEEP: 2 }
  withVerdicts.sort((a, b) => {
    if (order[a.verdict] !== order[b.verdict]) return order[a.verdict] - order[b.verdict]
    return b.potentialSaving - a.potentialSaving
  })

  return withVerdicts
}

// ─── Totals helpers ───────────────────────────────────────────────────────────
export function computeTotals(subscriptions) {
  const all = subscriptions.filter(s => !s.cancelled)
  const toCancel = all.filter(s => s.verdict === 'CANCEL')
  const toReview = all.filter(s => s.verdict === 'REVIEW')
  const toKeep = all.filter(s => s.verdict === 'KEEP')

  const monthlyTotal = all.reduce((sum, s) => sum + s.monthlyEquivalent, 0)
  const monthlySavings = toCancel.reduce((sum, s) => sum + s.monthlyEquivalent, 0)
  const annualSavings = monthlySavings * 12

  return {
    total: all.length,
    cancelCount: toCancel.length,
    reviewCount: toReview.length,
    keepCount: toKeep.length,
    monthlyTotal,
    monthlySavings,
    annualSavings,
  }
}
