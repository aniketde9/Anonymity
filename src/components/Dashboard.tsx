
import React from 'react'
import { PoolStats } from '../types'

interface DashboardProps {
  poolStats: PoolStats
}

const Dashboard: React.FC<DashboardProps> = ({ poolStats }) => {
  return (
    <div className="dashboard">
      <div className="welcome-section">
        <h2>Welcome to Anonymity V2</h2>
        <p>
          A decentralized privacy pool on Solana that breaks the on-chain link between 
          your source and destination addresses using Token-2022 Confidential Transfers.
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Value Pooled</h3>
          <div className="stat-value">
            {poolStats.totalValuePooled.toFixed(2)} SOL
          </div>
          <p className="stat-description">
            Total funds currently secured in the privacy pool
          </p>
        </div>

        <div className="stat-card">
          <h3>Anonymity Set Size</h3>
          <div className="stat-value">
            {poolStats.anonymitySetSize}
          </div>
          <p className="stat-description">
            Active deposits providing privacy protection. Higher is better!
          </p>
        </div>
      </div>

      <div className="how-it-works">
        <h3>How It Works</h3>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Deposit</h4>
              <p>Choose a fixed amount and deposit to the pool. Save your secret note!</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Wait</h4>
              <p>Let other users deposit to increase the anonymity set size.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Withdraw</h4>
              <p>Use your secret note to withdraw to a fresh, unlinked address.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="security-notice">
        <h3>Security & Privacy</h3>
        <ul>
          <li>✅ Non-custodial: You control your funds with your secret note</li>
          <li>✅ Confidential amounts: Transaction amounts are encrypted</li>
          <li>✅ Decentralized: All logic runs on-chain</li>
          <li>✅ Audited smart contracts (coming soon)</li>
        </ul>
      </div>
    </div>
  )
}

export default Dashboard
