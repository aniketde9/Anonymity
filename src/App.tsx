
import React, { useState, useEffect } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import Dashboard from './components/Dashboard'
import DepositFlow from './components/DepositFlow'
import WithdrawFlow from './components/WithdrawFlow'
import { PoolStats } from './types'
import './App.css'

function App() {
  const { connection } = useConnection()
  const { publicKey } = useWallet()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'deposit' | 'withdraw'>('dashboard')
  const [poolStats, setPoolStats] = useState<PoolStats>({
    totalValuePooled: 0,
    anonymitySetSize: 0
  })

  useEffect(() => {
    // TODO: Fetch real pool stats from on-chain program
    // For now, using mock data
    setPoolStats({
      totalValuePooled: 1250.5,
      anonymitySetSize: 47
    })
  }, [connection])

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Anonymity V2</h1>
          <p className="tagline">Solana Privacy Pool</p>
          <WalletMultiButton />
        </div>
      </header>

      <main className="app-main">
        {!publicKey ? (
          <div className="connect-wallet">
            <h2>Connect Your Wallet</h2>
            <p>Connect your Solana wallet to start using the privacy pool</p>
          </div>
        ) : (
          <>
            <nav className="tab-navigation">
              <button 
                className={activeTab === 'dashboard' ? 'active' : ''}
                onClick={() => setActiveTab('dashboard')}
              >
                Dashboard
              </button>
              <button 
                className={activeTab === 'deposit' ? 'active' : ''}
                onClick={() => setActiveTab('deposit')}
              >
                Deposit
              </button>
              <button 
                className={activeTab === 'withdraw' ? 'active' : ''}
                onClick={() => setActiveTab('withdraw')}
              >
                Withdraw
              </button>
            </nav>

            <div className="tab-content">
              {activeTab === 'dashboard' && <Dashboard poolStats={poolStats} />}
              {activeTab === 'deposit' && <DepositFlow />}
              {activeTab === 'withdraw' && <WithdrawFlow />}
            </div>
          </>
        )}
      </main>

      <footer className="app-footer">
        <p>
          <strong>Warning:</strong> This is experimental software. Use at your own risk. 
          Always backup your secret notes securely.
        </p>
      </footer>
    </div>
  )
}

export default App
