
import React, { useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL, PublicKey, Transaction, SystemProgram } from '@solana/web3.js'
import { generateSecretNote, generateLeaf, prepareDeposit, commitDeposit } from '../utils/crypto'
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
  const [depositComplete, setDepositComplete] = useState(false)
  const [txSignature, setTxSignature] = useState<string>('')

  const handleGenerateNote = async () => {
    if (!selectedAmount) return
    
    setIsGenerating(true)
    
    try {
      // Generate cryptographically secure secret note
      const note = generateSecretNote()
      setSecretNote(note)
      
      // Prepare the deposit with backend
      await prepareDeposit(note, selectedAmount.sol)
    } catch (error) {
      console.error('Error preparing deposit:', error)
      alert('Failed to prepare deposit. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDeposit = async () => {
    if (!selectedAmount || !secretNote || !publicKey || !sendTransaction) return

    setIsDepositing(true)

    try {
      // Create transaction to deposit SOL
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey('AnonymityV2PoolProgram11111111111111111111'), // Placeholder - replace with actual pool address
          lamports: selectedAmount.sol * LAMPORTS_PER_SOL,
        })
      )

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey

      // Send transaction
      const signature = await sendTransaction(transaction, connection)
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed')
      
      // Commit the deposit to backend
      const leaf = generateLeaf(secretNote)
      await commitDeposit(leaf, signature)
      
      setTxSignature(signature)
      setDepositComplete(true)
      
    } catch (error) {
      console.error('Error during deposit:', error)
      alert('Deposit failed. Please try again.')
    } finally {
      setIsDepositing(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const resetFlow = () => {
    setSelectedAmount(null)
    setSecretNote('')
    setHasBackedUp(false)
    setDepositComplete(false)
    setTxSignature('')
  }

  if (depositComplete) {
    return (
      <div className="deposit-flow">
        <div className="success-message">
          <h2>✅ Deposit Successful!</h2>
          <p>Your funds have been deposited into the privacy pool.</p>
          
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
              <label>Your Secret Note (SAVE THIS!):</label>
              <div className="copy-field secret-note">
                <code>{secretNote}</code>
                <button onClick={() => copyToClipboard(secretNote)}>Copy</button>
              </div>
            </div>
          </div>

          <div className="warning-box">
            <strong>⚠️ IMPORTANT:</strong> Save your secret note securely. You will need it to withdraw your funds. 
            If you lose it, your funds will be permanently inaccessible.
          </div>

          <button onClick={resetFlow} className="primary-button">
            Make Another Deposit
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="deposit-flow">
      <h2>Make a Private Deposit</h2>
      <p>Deposit SOL into the privacy pool to break transaction links.</p>

      {/* Step 1: Select Amount */}
      <div className="step">
        <h3>Step 1: Select Deposit Amount</h3>
        <div className="amount-grid">
          {DEPOSIT_AMOUNTS.map((amount) => (
            <button
              key={amount.sol}
              className={`amount-option ${selectedAmount?.sol === amount.sol ? 'selected' : ''}`}
              onClick={() => setSelectedAmount(amount)}
            >
              {amount.label}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Generate Secret Note */}
      {selectedAmount && (
        <div className="step">
          <h3>Step 2: Generate Secret Note</h3>
          <p>This secret note is required to withdraw your funds later.</p>
          
          {!secretNote ? (
            <button 
              onClick={handleGenerateNote}
              disabled={isGenerating}
              className="primary-button"
            >
              {isGenerating ? 'Generating...' : 'Generate Secret Note'}
            </button>
          ) : (
            <div className="secret-note-display">
              <div className="copy-field">
                <code>{secretNote}</code>
                <button onClick={() => copyToClipboard(secretNote)}>Copy</button>
              </div>
              
              <div className="backup-confirmation">
                <label>
                  <input
                    type="checkbox"
                    checked={hasBackedUp}
                    onChange={(e) => setHasBackedUp(e.target.checked)}
                  />
                  I have securely saved my secret note
                </label>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Confirm Deposit */}
      {secretNote && hasBackedUp && (
        <div className="step">
          <h3>Step 3: Confirm Deposit</h3>
          <div className="deposit-summary">
            <p><strong>Amount:</strong> {selectedAmount?.label}</p>
            <p><strong>Pool:</strong> Anonymity V2 Privacy Pool</p>
            <p><strong>Network:</strong> Solana Devnet</p>
          </div>

          <div className="warning-box">
            <strong>⚠️ Warning:</strong> Make sure you have saved your secret note. 
            Without it, you cannot withdraw your funds.
          </div>

          <button
            onClick={handleDeposit}
            disabled={isDepositing}
            className="primary-button deposit-button"
          >
            {isDepositing ? 'Processing Deposit...' : `Deposit ${selectedAmount?.label}`}
          </button>
        </div>
      )}
    </div>
  )
}

export default DepositFlow
