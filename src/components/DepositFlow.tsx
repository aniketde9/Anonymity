
import React, { useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL, PublicKey, Transaction } from '@solana/web3.js'
import CryptoJS from 'crypto-js'
import { generateSecretNote } from '../utils/crypto'
import { DepositAmount } from '../types'

const DEPOSIT_AMOUNTS: DepositAmount[] = [
  { sol: 0.1, label: '0.1 SOL' },
  { sol: 1, label: '1 SOL' },
  { sol: 10, label: '10 SOL' },
  { sol: 100, label: '100 SOL' }
]

const DepositFlow: React.FC = () => {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const [selectedAmount, setSelectedAmount] = useState<DepositAmount | null>(null)
  const [secretNote, setSecretNote] = useState<string>('')
  const [hasBackedUp, setHasBackedUp] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDepositing, setIsDepositing] = useState(false)

  const handleGenerateNote = () => {
    if (!selectedAmount) return
    
    setIsGenerating(true)
    
    // Generate cryptographically secure secret note
    const note = generateSecretNote()
    setSecretNote(note)
    setIsGenerating(false)
  }

  const handleDeposit = async () => {
    if (!publicKey || !selectedAmount || !secretNote || !hasBackedUp) return
    
    setIsDepositing(true)
    
    try {
      // TODO: Implement actual deposit transaction to privacy pool contract
      // This would include:
      // 1. Convert SOL to pSOL (wrapped confidential token)
      // 2. Generate leaf from secret note
      // 3. Call deposit function on smart contract
      
      console.log('Depositing:', {
        amount: selectedAmount.sol,
        secretNote,
        publicKey: publicKey.toString()
      })
      
      // Mock transaction for now
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      alert(`Successfully deposited ${selectedAmount.sol} SOL to the privacy pool!`)
      
      // Reset form
      setSelectedAmount(null)
      setSecretNote('')
      setHasBackedUp(false)
      
    } catch (error) {
      console.error('Deposit failed:', error)
      alert('Deposit failed. Please try again.')
    } finally {
      setIsDepositing(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(secretNote)
    alert('Secret note copied to clipboard!')
  }

  return (
    <div className="deposit-flow">
      <h2>Deposit to Privacy Pool</h2>
      <p>
        Select a fixed amount to deposit. This helps break value correlation 
        and strengthens privacy guarantees.
      </p>

      <div className="step">
        <h3>Step 1: Choose Deposit Amount</h3>
        <div className="amount-grid">
          {DEPOSIT_AMOUNTS.map((amount) => (
            <button
              key={amount.sol}
              className={`amount-button ${selectedAmount?.sol === amount.sol ? 'selected' : ''}`}
              onClick={() => setSelectedAmount(amount)}
            >
              {amount.label}
            </button>
          ))}
        </div>
      </div>

      {selectedAmount && (
        <div className="step">
          <h3>Step 2: Generate Secret Note</h3>
          <p>
            Your secret note is your only way to withdraw funds later. 
            <strong> If you lose it, your funds are gone forever.</strong>
          </p>
          
          {!secretNote ? (
            <button 
              className="generate-button"
              onClick={handleGenerateNote}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Secret Note'}
            </button>
          ) : (
            <div className="secret-note-display">
              <div className="secret-note-box">
                <code>{secretNote}</code>
                <button onClick={copyToClipboard} className="copy-button">
                  Copy
                </button>
              </div>
              
              <div className="backup-warning">
                <h4>⚠️ CRITICAL WARNING ⚠️</h4>
                <p>
                  Save this secret note in a secure location. Write it down, 
                  store it in a password manager, or save it to an encrypted file. 
                  <strong> We cannot recover lost notes.</strong>
                </p>
                
                <label className="backup-checkbox">
                  <input
                    type="checkbox"
                    checked={hasBackedUp}
                    onChange={(e) => setHasBackedUp(e.target.checked)}
                  />
                  I have securely backed up my secret note
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {selectedAmount && secretNote && hasBackedUp && (
        <div className="step">
          <h3>Step 3: Complete Deposit</h3>
          <div className="deposit-summary">
            <p><strong>Amount:</strong> {selectedAmount.label}</p>
            <p><strong>Action:</strong> Deposit to privacy pool using confidential transfers</p>
          </div>
          
          <button 
            className="deposit-button"
            onClick={handleDeposit}
            disabled={isDepositing}
          >
            {isDepositing ? 'Processing Deposit...' : `Deposit ${selectedAmount.label}`}
          </button>
        </div>
      )}
    </div>
  )
}

export default DepositFlow
