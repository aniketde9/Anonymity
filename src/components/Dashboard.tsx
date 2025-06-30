
import React from 'react';

interface PoolStats {
  totalDeposits: number;
  totalPayments: number;
  activeSchedules: number;
  serviceFee: number;
}

interface DashboardProps {
  poolStats: PoolStats;
}

const Dashboard: React.FC<DashboardProps> = ({ poolStats }) => {
  return (
    <div className="dashboard">
      <div className="welcome-section">
        <h2>Welcome to Anonymity V2</h2>
        <p className="tagline">
          Send private payments that can't be traced back to you. Your payment is fragmented 
          and delivered over time, breaking the on-chain connection to the recipient.
        </p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>{poolStats.totalDeposits}</h3>
          <p>Total Payments Scheduled</p>
        </div>
        <div className="stat-card">
          <h3>{poolStats.activeSchedules}</h3>
          <p>Active Delivery Schedules</p>
        </div>
        <div className="stat-card">
          <h3>{poolStats.serviceFee}%</h3>
          <p>Service Fee</p>
        </div>
        <div className="stat-card">
          <h3>24/7</h3>
          <p>Automated Delivery</p>
        </div>
      </div>

      <div className="how-it-works">
        <h3>How Fragmented Payments Work</h3>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Send to Pool</h4>
              <p>Specify recipient and amount. Send your payment to the anonymity pool in one transaction.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Automatic Fragmentation</h4>
              <p>Our system breaks your payment into random, smaller amounts over your chosen timeframe.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Private Delivery</h4>
              <p>Recipient receives multiple small payments from the pool, with no link back to you.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="feature-grid">
        <div className="feature-card">
          <h4>🎯 Direct to Recipient</h4>
          <p>Send directly to any Solana address. No secret notes or complex setup required.</p>
        </div>
        <div className="feature-card">
          <h4>🧩 Smart Fragmentation</h4>
          <p>Payments are intelligently broken into random amounts and delivery times.</p>
        </div>
        <div className="feature-card">
          <h4>🔄 Fire & Forget</h4>
          <p>Once sent, everything is automated. Recipient doesn't need to do anything.</p>
        </div>
        <div className="feature-card">
          <h4>⚡ Flexible Speed</h4>
          <p>Choose delivery speed: Fast (1hr), Standard (6hr), or Slow (24hr) for maximum privacy.</p>
        </div>
      </div>

      <div className="security-notice">
        <h3>Privacy & Security Features</h3>
        <div className="security-grid">
          <div className="security-item">
            <span className="check">✅</span>
            <div>
              <strong>Value Obfuscation</strong>
              <p>Original amount is hidden through random fragmentation</p>
            </div>
          </div>
          <div className="security-item">
            <span className="check">✅</span>
            <div>
              <strong>Timing Obfuscation</strong>
              <p>Payments spread over time break timing correlations</p>
            </div>
          </div>
          <div className="security-item">
            <span className="check">✅</span>
            <div>
              <strong>Pool Mixing</strong>
              <p>Your payment mixes with others in high-volume pool</p>
            </div>
          </div>
          <div className="security-item">
            <span className="check">✅</span>
            <div>
              <strong>Non-Custodial</strong>
              <p>Automated system with no human intervention</p>
            </div>
          </div>
        </div>
      </div>

      <div className="use-cases">
        <h3>Perfect For</h3>
        <div className="use-case-grid">
          <div className="use-case-card">
            <h4>💼 Freelancer Payments</h4>
            <p>Pay contractors without revealing your main wallet</p>
          </div>
          <div className="use-case-card">
            <h4>🎁 Private Gifts</h4>
            <p>Send gifts anonymously to friends or family</p>
          </div>
          <div className="use-case-card">
            <h4>🛍️ Online Purchases</h4>
            <p>Buy services while maintaining financial privacy</p>
          </div>
          <div className="use-case-card">
            <h4>💰 Wallet Funding</h4>
            <p>Fund your other wallets without creating links</p>
          </div>
        </div>
      </div>

      <div className="disclaimer">
        <h4>⚠️ Important Notes</h4>
        <ul>
          <li>This is experimental software - use at your own risk</li>
          <li>Currently configured for Solana Devnet only</li>
          <li>Larger anonymity pools provide better privacy</li>
          <li>Service fee helps maintain the automated system</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
