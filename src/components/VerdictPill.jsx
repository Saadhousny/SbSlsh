import React from 'react'
import styles from './VerdictPill.module.css'

export default function VerdictPill({ verdict, size = 'sm' }) {
  return (
    <span className={`${styles.pill} ${styles[verdict?.toLowerCase()]} ${styles[size]}`}>
      {verdict === 'CANCEL' && '✗ '}
      {verdict === 'REVIEW' && '⚠ '}
      {verdict === 'KEEP' && '✓ '}
      {verdict}
    </span>
  )
}
