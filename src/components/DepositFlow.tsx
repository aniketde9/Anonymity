
import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

const HELIUS_RPC = 'https://devnet.helius-rpc.com/?api-key=a1c96ec7-818b-4789-ad2c-2bd175df4a95';

const DepositFlow: React.FC = () => {
  const { publicKey, sendTransaction } = useWallet();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [deliverySpeed, setDeliverySpeed] = useState(2); // Standard by default
  const [isLoading, setIsLoading] = useState(false);
  const [txSignature, setTxSignature] = useState('');
  const [error, setError] = useState('');

  const connection = new Connection(HELIUS_RPC, 'confirmed');

  const deliveryOptions = [
    { value: 1, label: 'Fast (≈1 hour)', description: 'Higher anonymity risk, faster delivery' },
    { value: 2, label: 'Standard (≈6 hours)', description: 'Balanced privacy and speed' },
    { value: 3, label: 'Slow (≈24 hours)', description: 'Maximum privacy, slower delivery' }
  ];

  const validateAddress = (address: string): boolean => {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  };

  const calculateFee = (amount: number): number => {
    return amount * 0.005; // 0.5% service fee
  };

  const handleSendPrivatePayment = async () => {
    if (!publicKey || !recipientAddress || !amount) {
      setError('Please fill in all fields');
      return;
    }

    if (!validateAddress(recipientAddress)) {
      setError('Invalid recipient address');
      return;
    }

    const amountSol = parseFloat(amount);
    if (amountSol <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Create transaction to send SOL to the anonymity pool
      const poolAddress = new PublicKey('FragmentedPaymentsV111111111111111111111111'); // This would be the actual pool PDA
      const lamports = amountSol * LAMPORTS_PER_SOL;
      const fee = calculateFee(amountSol);
      const totalLamports = (amountSol + fee) * LAMPORTS_PER_SOL;

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: poolAddress,
          lamports: totalLamports,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      // Notify backend about the scheduled payment
      const response = await fetch('/api/schedule-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient: recipientAddress,
          totalAmount: lamports,
          deliverySpeed,
          txSignature: signature,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setTxSignature(signature);
        setRecipientAddress('');
        setAmount('');
      } else {
        setError('Failed to schedule payment');
      }

    } catch (err: any) {
      console.error('Transaction failed:', err);
      setError(err.message || 'Transaction failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (txSignature) {
    return (
      <div className="success-message">
        <h3>✅ Private Payment Scheduled Successfully!</h3>
        <div className="success-details">
          <p><strong>Transaction:</strong> {txSignature}</p>
          <p><strong>Delivery Time:</strong> {deliveryOptions.find(opt => opt.value === deliverySpeed)?.label}</p>
          <p><strong>Status:</strong> Your payment will be delivered privately in fragments over the selected timeframe.</p>
        </div>
        <button 
          className="secondary-button"
          onClick={() => setTxSignature('')}
        >
          Send Another Payment
        </button>
        <div className="info-box" style={{ marginTop: '1rem' }}>
          <p><strong>What happens next?</strong></p>
          <ul>
            <li>Your payment is now in the anonymity pool</li>
            <li>The recipient will receive multiple small payments over time</li>
            <li>These fragments break the link between your deposit and their receipts</li>
            <li>No action is required from the recipient</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="deposit-flow">
      <h2>Send Private Payment</h2>
      <p className="description">
        Send SOL privately to any address. Your payment will be broken into randomized fragments 
        and delivered over time, making it impossible to trace back to you.
      </p>

      <div className="form-group">
        <label>Recipient Address</label>
        <input
          type="text"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          placeholder="Enter Solana wallet address"
          className={recipientAddress && !validateAddress(recipientAddress) ? 'error' : ''}
        />
        {recipientAddress && !validateAddress(recipientAddress) && (
          <span className="error-text">Invalid Solana address</span>
        )}
      </div>

      <div className="form-group">
        <label>Amount (SOL)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.0"
          min="0"
          step="0.001"
        />
        {amount && (
          <div className="fee-display">
            <small>
              Service fee: {calculateFee(parseFloat(amount) || 0).toFixed(4)} SOL
              <br />
              Total to pay: {(parseFloat(amount || '0') + calculateFee(parseFloat(amount) || 0)).toFixed(4)} SOL
            </small>
          </div>
        )}
      </div>

      <div className="form-group">
        <label>Delivery Speed</label>
        <div className="delivery-options">
          {deliveryOptions.map((option) => (
            <div 
              key={option.value}
              className={`delivery-option ${deliverySpeed === option.value ? 'selected' : ''}`}
              onClick={() => setDeliverySpeed(option.value)}
            >
              <div className="option-header">
                <input 
                  type="radio" 
                  name="delivery" 
                  value={option.value}
                  checked={deliverySpeed === option.value}
                  onChange={() => setDeliverySpeed(option.value)}
                />
                <strong>{option.label}</strong>
              </div>
              <p>{option.description}</p>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <button
        onClick={handleSendPrivatePayment}
        disabled={isLoading || !publicKey || !recipientAddress || !amount || !validateAddress(recipientAddress)}
        className="primary-button"
      >
        {isLoading ? 'Processing...' : 'Send Private Payment'}
      </button>

      <div className="privacy-info">
        <h4>🔒 Privacy Protection</h4>
        <ul>
          <li><strong>Fragmented Delivery:</strong> Your payment is split into random amounts</li>
          <li><strong>Time Obfuscation:</strong> Payments are spread over your chosen timeframe</li>
          <li><strong>Pool Mixing:</strong> Your funds mix with others in the anonymity pool</li>
          <li><strong>Fire & Forget:</strong> Recipient needs to do nothing - they just receive</li>
        </ul>
      </div>
    </div>
  );
};

export default DepositFlow;
