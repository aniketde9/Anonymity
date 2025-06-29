
import React, { useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { validateSecretNote } from '../utils/crypto'

const WithdrawFlow: React.FC = () => {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const [secretNote, setSecretNote] = useState('')
  const [recipientAddress, setRecipientAddress] = useState('')
  const [isValidAddress, setIsValidAddress] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)

  const handleAddressChange = (address: string) => {
    setRecipientAddress(address)
    
    try {
      new PublicKey(address)
      setIsValidAddress(true)
    } catch {
      setIsValidAddress(false)
    }
  }

  const handleWithdraw = async () => {
    if (!publicKey || !secretNote || !recipientAddress || !isValidAddress) return
    
    setIsWithdrawing(true)
    
    try {
      // TODO: Implement actual withdrawal transaction
      // This would include:
      // 1. Hash the secret note to regenerate the leaf
      // 2. Call withdraw function on smart contract
      // 3. Unwrap pSOL back to SOL
      
      console.log('Withdrawing:', {
        secretNote,
        recipientAddress,
        publicKey: publicKey.toString()
      })
      
      // Mock transaction for now
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      alert(`Successfully withdrew funds to ${recipientAddress}!`)
      
      // Reset form
      setSecretNote('')
      setRecipientAddress('')
      setIsValidAddress(false)
      
    } catch (error) {
      console.error('Withdrawal failed:', error)
      alert('Withdrawal failed. Please check your secret note and try again.')
    } finally {
      setIsWithdrawing(false)
    }
  }

  return (
    <div className="withdraw-flow">
      <h2>Withdraw from Privacy Pool</h2>
      <p>
        Use your secret note to withdraw funds to a new address. 
        For maximum privacy, use a fresh wallet with no transaction history.
      </p>

      <div className="step">
        <h3>Step 1: Enter Secret Note</h3>
        <p>
          Paste the secret note you saved during deposit. This is the only way 
          to prove ownership of your deposited funds.
        </p>
        
        <textarea
          className="secret-note-input"
          placeholder="Paste your secret note here..."
          value={secretNote}
          onChange={(e) => setSecretNote(e.target.value)}
          rows={4}
        />
      </div>

      <div className="step">
        <h3>Step 2: Specify Recipient Address</h3>
        <div className="privacy-warning">
          <h4>🔒 Privacy Recommendation</h4>
          <p>
            For maximum privacy, withdraw to a <strong>new wallet address</strong> that 
            has never been used before. This ensures no connection can be made to 
            your existing on-chain activity.
          </p>
        </div>
        
        <input
          type="text"
          className={`address-input ${recipientAddress ? (isValidAddress ? 'valid' : 'invalid') : ''}`}
          placeholder="Enter recipient Solana address..."
          value={recipientAddress}
          onChange={(e) => handleAddressChange(e.target.value)}
        />
        
        {recipientAddress && !isValidAddress && (
          <p className="error-message">Invalid Solana address</p>
        )}
        
        {recipientAddress && isValidAddress && (
          <p className="success-message">✓ Valid Solana address</p>
        )}
      </div>

      {secretNote && recipientAddress && isValidAddress && (
        <div className="step">
          <h3>Step 3: Complete Withdrawal</h3>
          <div className="withdraw-summary">
            <p><strong>Withdrawing to:</strong> {recipientAddress}</p>
            <p><strong>Action:</strong> Withdraw from privacy pool using confidential transfers</p>
          </div>
          
          <div className="final-warning">
            <h4>⚠️ Final Check</h4>
            <p>
              Make sure the recipient address is correct. Once withdrawn, 
              the transaction cannot be reversed.
            </p>
          </div>
          
          <button 
            className="withdraw-button"
            onClick={handleWithdraw}
            disabled={isWithdrawing}
          >
            {isWithdrawing ? 'Processing Withdrawal...' : 'Withdraw Funds'}
          </button>
        </div>
      )}
    </div>
  )
}

export default WithdrawFlow
