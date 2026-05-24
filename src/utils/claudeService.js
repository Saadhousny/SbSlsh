// Claude AI service — used only for:
//   1. Labelling unknown merchant names
//   2. Writing plain-language explanations on the detail screen
//   3. Conversational follow-up questions
// All subscription detection & verdict logic is hardcoded (zero AI cost)

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY

const SYSTEM_PROMPT = `You are a subscription detection agent for Tangerine Bank.
You help Canadian bank clients understand their recurring charges and make smart decisions about which subscriptions to cancel.
Always use the user's actual numbers. Never give generic advice.
Be concise, clear, and direct. Use dollar figures and dates when available.
When recommending cancellation, always mention the free alternative if one exists.`

async function callClaude(messages, maxTokens = 400) {
  if (!API_KEY || API_KEY === 'your_anthropic_api_key_here') {
    throw new Error('ANTHROPIC_API_KEY not configured. Add it to your .env file.')
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: maxTokens,
      system: SYSTEM_PROMPT,
      messages,
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message || `API error ${response.status}`)
  }

  const data = await response.json()
  return data.content[0].text
}

// ─── Generate plain-language explanation for a subscription ──────────────────
export async function generateExplanation(subscription) {
  const { verdict, kb, daysInactive, monthlyEquivalent, annualCost, daysUntilRenewal, billingCycle } = subscription
  const name = kb?.name || subscription.merchantName

  const prompt = `Generate a 2-3 sentence plain-language recommendation for this subscription:

Service: ${name}
Monthly cost: $${monthlyEquivalent.toFixed(2)}
Annual cost: $${annualCost.toFixed(2)}
Last active: ${daysInactive !== null ? `${daysInactive} days ago` : 'unknown'}
Billing cycle: ${billingCycle}
${billingCycle === 'annual' ? `Days until renewal: ${daysUntilRenewal}` : ''}
Verdict: ${verdict}
Free alternative: ${kb?.freePlan ? kb.freeDescription : (kb?.cheapestPaid || 'none')}

Write a direct, personal recommendation using these exact numbers. Start with the verdict (Cancel / Review / Keep).`

  return callClaude([{ role: 'user', content: prompt }])
}

// ─── Label an unknown merchant name ──────────────────────────────────────────
export async function labelMerchant(rawMerchantName) {
  const prompt = `A Canadian bank transaction shows this merchant name: "${rawMerchantName}"

What service or company is this? Reply with just the clean name (e.g. "Squarespace", "LinkedIn Premium"). If you're not sure, reply with the cleaned-up version of the raw name. Maximum 5 words.`

  return callClaude([{ role: 'user', content: prompt }], 50)
}

// ─── Chat follow-up about a specific subscription ────────────────────────────
export async function chatAboutSubscription(subscription, conversationHistory, userMessage) {
  const { kb, daysInactive, monthlyEquivalent, annualCost, verdict } = subscription
  const name = kb?.name || subscription.merchantName

  const context = `Context: The user is asking about their ${name} subscription.
- Monthly cost: $${monthlyEquivalent.toFixed(2)} ($${annualCost.toFixed(2)}/year)
- Last active: ${daysInactive !== null ? `${daysInactive} days ago` : 'unknown'}
- Our recommendation: ${verdict}
- Free alternative: ${kb?.freePlan ? kb.freeDescription : (kb?.cheapestPaid ? `cheapest paid: ${kb.cheapestPaid}` : 'none')}
- What you keep on free: ${kb?.whatYouLose || 'check service website'}

Answer the user's question using these specific numbers.`

  const messages = [
    { role: 'user', content: context },
    { role: 'assistant', content: 'Understood. I have the subscription details. What would you like to know?' },
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ]

  return callClaude(messages, 500)
}

// ─── Generate cancellation email draft ───────────────────────────────────────
export async function generateCancellationEmail(subscription) {
  const name = subscription.kb?.name || subscription.merchantName
  const prompt = `Write a formal cancellation email for ${name} subscription.
Monthly charge: $${subscription.monthlyEquivalent.toFixed(2)}
Keep it professional, concise (3-4 sentences), and ask for written confirmation of cancellation.
Include a subject line at the top formatted as "Subject: [subject here]"`

  return callClaude([{ role: 'user', content: prompt }], 300)
}
