
import React, { useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { validateSecretNote, prepareWithdraw, executeWithdraw } from '../utils/crypto'

const WithdrawFlow: React.FC = () => {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const [secretNote, setSecretNote] = useState('')
  const [recipientAddress, setRecipientAddress] = useState('')
  const [isValidAddress, setIsValidAddress] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [withdrawComplete, setWithdrawComplete] = useState(false)
  const [txSignature, setTxSignature] = useState<string>('')
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0)

  const handleAddressChange = (address: string) => {
    setRecipientAddress(address)
    
    try {
      new PublicKey(address)
      setIsValidAddress(true)
    } catch {
      setIsValidAddress(false)
    }
  }

  const handleSecretNoteChange = (note: string) => {
    setSecretNote(note)
  }

  const handleWithdraw = async () => {
    if (!secretNote || !recipientAddress || !isValidAddress || !validateSecretNote(secretNote)) {
      alert('Please provide a valid secret note and recipient address.')
      return
    }

    setIsWithdrawing(true)

    try {
      // Prepare withdrawal with backend (generates ZK proof)
      const withdrawData = await prepareWithdraw(secretNote, recipientAddress)
      
      if (!withdrawData.success) {
        throw new Error(withdrawData.error || 'Failed to prepare withdrawal')
      }

      // Execute the withdrawal
      const result = await executeWithdraw(secretNote, withdrawData.signature)
      
      if (result.success) {
        setTxSignature(result.txSignature)
        setWithdrawAmount(result.amount)
        setWithdrawComplete(true)
      } else {
        throw new Error(result.error || 'Withdrawal failed')
      }
      
    } catch (error) {
      console.error('Error during withdrawal:', error)
      alert(`Withdrawal failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsWithdrawing(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const resetFlow = () => {
    setSecretNote('')
    setRecipientAddress('')
    setIsValidAddress(false)
    setWithdrawComplete(false)
    setTxSignature('')
    setWithdrawAmount(0)
  }

  if (withdrawComplete) {
    return (
      <div className="withdraw-flow">
        <div className="success-message">
          <h2>✅ Withdrawal Successful!</h2>
          <p>Your funds have been privately withdrawn from the pool.</p>
          
          <div className="transaction-info">
            <h3>Transaction Details</h3>
            <div className="info-item">
              <label>Transaction Signature:</label>
              <div className="copy-field">
                <code>{txSignature}</code>
                <button onClick={() => copyToClipboard(txSignature)}>Copy</button>
              </div>
            </div>
            
            <div className="info-item">
              <label>Amount Withdrawn:</label>
              <div className="amount-display">{withdrawAmount} SOL</div>
            </div>
            
            <div className="info-item">
              <label>Recipient Address:</label>
              <div className="copy-field">
                <code>{recipientAddress}</code>
                <button onClick={() => copyToClipboard(recipientAddress)}>Copy</button>
              </div>
            </div>
          </div>

          <div className="info-box">
            <strong>🎉 Privacy Achieved!</strong> Your withdrawal breaks the on-chain link between 
            your original deposit and this withdrawal transaction.
          </div>

          <button onClick={resetFlow} className="primary-button">
            Make Another Withdrawal
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="withdraw-flow">
      <h2>Private Withdrawal</h2>
      <p>Withdraw your funds privately using your secret note.</p>

      <div className="step">
        <h3>Secret Note</h3>
        <p>Enter the secret note from your deposit:</p>
        <div className="input-group">
          <input
            type="text"
            value={secretNote}
            onChange={(e) => handleSecretNoteChange(e.target.value)}
            placeholder="Enter your secret note..."
            className="secret-input"
          />
          <div className="validation-status">
            {secretNote && (
              validateSecretNote(secretNote) ? (
                <span className="valid">✅ Valid secret note</span>
              ) : (
                <span className="invalid">❌ Invalid secret note format</span>
              )
            )}
          </div>
        </div>
      </div>

      <div className="step">
        <h3>Recipient Address</h3>
        <p>Enter the Solana address where you want to receive your funds:</p>
        <div className="input-group">
          <input
            type="text"
            value={recipientAddress}
            onChange={(e) => handleAddressChange(e.target.value)}
            placeholder="Enter recipient Solana address..."
            className="address-input"
          />
          <div className="validation-status">
            {recipientAddress && (
              isValidAddress ? (
                <span className="valid">✅ Valid Solana address</span>
              ) : (
                <span className="invalid">❌ Invalid Solana address</span>
              )
            )}
          </div>
        </div>
      </div>

      {secretNote && recipientAddress && validateSecretNote(secretNote) && isValidAddress && (
        <div className="step">
          <h3>Confirm Withdrawal</h3>
          
          <div className="warning-box">
            <strong>⚠️ Important:</strong> This withdrawal will be anonymous and break the link to your original deposit. 
            Make sure the recipient address is correct - transactions cannot be reversed.
          </div>

          <div className="withdrawal-info">
            <p><strong>Recipient:</strong> {recipientAddress}</p>
            <p><strong>Privacy Level:</strong> Maximum (Zero-Knowledge Proof)</p>
            <p><strong>Network:</strong> Solana Devnet</p>
          </div>

          <button
            onClick={handleWithdraw}
            disabled={isWithdrawing}
            className="primary-button withdraw-button"
          >
            {isWithdrawing ? 'Processing Withdrawal...' : 'Withdraw Privately'}
          </button>
        </div>
      )}

      <div className="help-section">
        <h4>Need Help?</h4>
        <ul>
          <li>Make sure your secret note is exactly as generated during deposit</li>
          <li>Double-check the recipient address is correct</li>
          <li>Ensure you have enough SOL for transaction fees</li>
          <li>Withdrawals may take a few moments to process</li>
        </ul>
      </div>
    </div>
  )
}

export default WithdrawFlow
