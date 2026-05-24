import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import styles from './AppShell.module.css'

export default function AppShell({ children }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAnalyzed } = useApp()

  const isSetup = false
  const isHome = location.pathname === '/home'

  return (
    <div className={styles.shell}>
      <div className={styles.phoneFrame}>
        <div className={styles.statusBar}>
          <span className={styles.time}>9:41</span>
          <div className={styles.statusIcons}>
            <span className={styles.wifiIcon} />
            <span className={styles.batteryIcon} />
          </div>
        </div>

        {!isSetup && (
          <header className={`${styles.header} ${isHome ? styles.homeHeader : ''}`}>
            <span />
            <div className={styles.headerBrand}>
              <span className={styles.brandName}>Tangerine</span>
            </div>
            <span />
          </header>
        )}

        <main className={styles.content}>
          {children}
        </main>

        {!isSetup && isAnalyzed && (
          <nav className={styles.bottomNav}>
            <button
              className={`${styles.navItem} ${location.pathname === '/home' ? styles.active : ''}`}
              onClick={() => navigate('/home')}
            >
              <span className={`${styles.navIcon} ${styles.homeIcon}`} />
              <span>Home</span>
            </button>
            <button
              className={`${styles.navItem} ${location.pathname.startsWith('/subscriptions') || location.pathname.startsWith('/subscription/') || location.pathname.startsWith('/cancel/') ? styles.active : ''}`}
              onClick={() => navigate('/subscriptions')}
            >
              <span className={`${styles.navIcon} ${styles.subsIcon}`}>⇄</span>
              <span>Subs</span>
            </button>
            <button
              className={`${styles.navItem} ${location.pathname === '/access' ? styles.active : ''}`}
              onClick={() => navigate('/access')}
            >
              <span className={`${styles.navIcon} ${styles.chatIcon}`} />
              <span>Chat</span>
            </button>
          </nav>
        )}
      </div>
    </div>
  )
}
