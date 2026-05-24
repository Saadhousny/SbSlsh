import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import HomeScreen from './screens/HomeScreen'
import SubscriptionListScreen from './screens/SubscriptionListScreen'
import DetailScreen from './screens/DetailScreen'
import CancellationScreen from './screens/CancellationScreen'
import SetupScreen from './screens/SetupScreen'
import AppShell from './components/AppShell'

export default function App() {
  return (
    <AppProvider>
      <AppShell>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/setup" element={<Navigate to="/access" replace />} />
          <Route path="/access" element={<SetupScreen />} />
          <Route path="/home" element={<HomeScreen />} />
          <Route path="/subscriptions" element={<SubscriptionListScreen />} />
          <Route path="/subscription/:id" element={<DetailScreen />} />
          <Route path="/cancel/:id" element={<CancellationScreen />} />
        </Routes>
      </AppShell>
    </AppProvider>
  )
}
