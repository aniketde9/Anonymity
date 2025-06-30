import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

interface PaymentSchedule {
  scheduleId: string;
  depositor: string;
  recipient: string;
  total_amount: number;
  remaining_amount: number;
  delivery_speed: number;
  created_at: number;
  last_payment_at: number;
  is_completed: boolean;
  progress: string;
}

const WithdrawFlow: React.FC = () => {
  const { publicKey } = useWallet();
  const [schedules, setSchedules] = useState<PaymentSchedule[]>([]);
  const [searchAddress, setSearchAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const deliverySpeedText = (speed: number) => {
    switch (speed) {
      case 1: return 'Fast (≈1 hour)';
      case 2: return 'Standard (≈6 hours)';
      case 3: return 'Slow (≈24 hours)';
      default: return 'Unknown';
    }
  };

  const searchSchedules = async (address: string) => {
    setLoading(true);
    try {
      // In a real implementation, this would query the blockchain
      // For now, we'll simulate finding schedules
      const mockSchedules: PaymentSchedule[] = [
        {
          scheduleId: '1',
          depositor: 'ABC...123',
          recipient: address,
          total_amount: 5000000000, // 5 SOL in lamports
          remaining_amount: 2500000000, // 2.5 SOL remaining
          delivery_speed: 2,
          created_at: Date.now() / 1000 - 3600, // 1 hour ago
          last_payment_at: Date.now() / 1000 - 300, // 5 minutes ago
          is_completed: false,
          progress: '50.00'
        }
      ];

      setSchedules(mockSchedules);
    } catch (error) {
      console.error('Error searching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (publicKey) {
      setSearchAddress(publicKey.toString());
      searchSchedules(publicKey.toString());
    }
  }, [publicKey]);

  return (
    <div className="withdraw-flow">
      <h2>Track Incoming Payments</h2>
      <p className="description">
        Check the status of fragmented payments being delivered to your address.
      </p>

      <div className="form-group">
        <label>Wallet Address to Track</label>
        <div className="address-input-group">
          <input
            type="text"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            placeholder="Enter Solana wallet address"
          />
          <button 
            onClick={() => searchSchedules(searchAddress)}
            disabled={loading || !searchAddress}
            className="secondary-button"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {schedules.length > 0 && (
        <div className="schedules-list">
          <h3>Incoming Payment Schedules</h3>
          {schedules.map((schedule) => (
            <div key={schedule.scheduleId} className="schedule-card">
              <div className="schedule-header">
                <h4>Payment Schedule #{schedule.scheduleId}</h4>
                <span className={`status ${schedule.is_completed ? 'completed' : 'active'}`}>
                  {schedule.is_completed ? 'Completed' : 'Active'}
                </span>
              </div>

              <div className="schedule-details">
                <div className="detail-row">
                  <span>Total Amount:</span>
                  <span>{(schedule.total_amount / 1000000000).toFixed(4)} SOL</span>
                </div>
                <div className="detail-row">
                  <span>Remaining:</span>
                  <span>{(schedule.remaining_amount / 1000000000).toFixed(4)} SOL</span>
                </div>
                <div className="detail-row">
                  <span>Progress:</span>
                  <span>{schedule.progress}%</span>
                </div>
                <div className="detail-row">
                  <span>Delivery Speed:</span>
                  <span>{deliverySpeedText(schedule.delivery_speed)}</span>
                </div>
                <div className="detail-row">
                  <span>Started:</span>
                  <span>{new Date(schedule.created_at * 1000).toLocaleString()}</span>
                </div>
                {schedule.last_payment_at > 0 && (
                  <div className="detail-row">
                    <span>Last Payment:</span>
                    <span>{new Date(schedule.last_payment_at * 1000).toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${schedule.progress}%` }}
                ></div>
              </div>

              {!schedule.is_completed && (
                <div className="schedule-info">
                  <p><strong>What's happening:</strong></p>
                  <ul>
                    <li>Payments are being sent in random fragments</li>
                    <li>Each fragment arrives at a different time</li>
                    <li>This breaks the link to the original sender</li>
                    <li>No action needed from you - just wait to receive</li>
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {schedules.length === 0 && searchAddress && !loading && (
        <div className="no-schedules">
          <p>No payment schedules found for this address.</p>
          <p>If someone sent you a private payment, it should appear here shortly after they initiate it.</p>
        </div>
      )}

      <div className="info-section">
        <h3>How Fragmented Payments Work</h3>
        <div className="info-grid">
          <div className="info-card">
            <h4>🎯 Targeted</h4>
            <p>Payments are sent directly to your specified address</p>
          </div>
          <div className="info-card">
            <h4>🧩 Fragmented</h4>
            <p>Large payments are broken into smaller, random amounts</p>
          </div>
          <div className="info-card">
            <h4>⏰ Time-Spread</h4>
            <p>Fragments arrive over time to obscure patterns</p>
          </div>
          <div className="info-card">
            <h4>🔒 Private</h4>
            <p>Recipients can't easily trace back to the sender</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawFlow;