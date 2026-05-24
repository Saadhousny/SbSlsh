import React, { createContext, useContext, useState, useCallback } from 'react'
import { analyzeTransactions } from '../utils/subscriptionDetector'
import { SAMPLE_CSV, SAMPLE_LAST_ACTIVITY } from '../data/sampleTransactions'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [subscriptions, setSubscriptions] = useState(() => analyzeTransactions(SAMPLE_CSV, SAMPLE_LAST_ACTIVITY))
  const [isAnalyzed, setIsAnalyzed] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [userProfile, setUserProfile] = useState({
    name: 'Alex',
    bank: 'Tangerine',
    cardLast4: '4821',
    email: 'user@gmail.com',
  })
  const [cancelledIds, setCancelledIds] = useState([])
  const [accessGateCompleted, setAccessGateCompleted] = useState(false)
  const [connectedSources, setConnectedSources] = useState({
    gmail: false,
    appStore: false,
    googlePlay: false,
    linkedIn: false,
  })

  // Analyze a CSV string (uploaded or sample)
  const analyzeCSV = useCallback((csvText, lastActivity = SAMPLE_LAST_ACTIVITY) => {
    setIsLoading(true)
    try {
      const results = analyzeTransactions(csvText, lastActivity)
      setSubscriptions(results)
      setIsAnalyzed(true)
    } catch (err) {
      console.error('Analysis failed:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load sample demo data
  const loadSampleData = useCallback(() => {
    analyzeCSV(SAMPLE_CSV, SAMPLE_LAST_ACTIVITY)
  }, [analyzeCSV])

  // Mark a subscription as cancelled
  const markCancelled = useCallback((id) => {
    setCancelledIds(prev => [...prev, id])
    setSubscriptions(prev =>
      prev.map(s => s.id === id ? { ...s, cancelled: true, verdict: 'KEEP' } : s)
    )
  }, [])

  // Get a subscription by id
  const getSubscription = useCallback((id) => {
    return subscriptions.find(s => s.id === id) || null
  }, [subscriptions])

  const connectSource = useCallback((id) => {
    setConnectedSources(prev => ({ ...prev, [id]: true }))
  }, [])

  const completeAccessGate = useCallback(() => {
    setAccessGateCompleted(true)
  }, [])

  return (
    <AppContext.Provider value={{
      subscriptions,
      isAnalyzed,
      isLoading,
      userProfile,
      setUserProfile,
      cancelledIds,
      accessGateCompleted,
      connectedSources,
      analyzeCSV,
      loadSampleData,
      markCancelled,
      getSubscription,
      connectSource,
      completeAccessGate,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
