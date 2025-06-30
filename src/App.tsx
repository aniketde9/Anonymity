
import React, { useState, useEffect } from 'react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import Dashboard from './components/Dashboard';
import DepositFlow from './components/DepositFlow';
import WithdrawFlow from './components/WithdrawFlow';
import './App.css';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

const network = WalletAdapterNetwork.Devnet;
const endpoint = 'https://devnet.helius-rpc.com/?api-key=a1c96ec7-818b-4789-ad2c-2bd175df4a95';

const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
];

interface PoolStats {
  totalDeposits: number;
  totalPayments: number;
  activeSchedules: number;
  serviceFee: number;
}

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'send' | 'track'>('dashboard');
  const [poolStats, setPoolStats] = useState<PoolStats>({
    totalDeposits: 0,
    totalPayments: 0,
    activeSchedules: 0,
    serviceFee: 0.5,
  });

  useEffect(() => {
    fetchPoolStats();
    const interval = setInterval(fetchPoolStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchPoolStats = async () => {
    try {
      const response = await fetch('/api/pool-stats');
      const stats = await response.json();
      setPoolStats(stats);
    } catch (error) {
      console.error('Failed to fetch pool stats:', error);
    }
  };

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="app">
            <header className="app-header">
              <div className="header-content">
                <div className="header-left">
                  <h1>Anonymity V2</h1>
                  <p className="tagline">Fragmented Payments for Complete Privacy</p>
                </div>
                <div className="header-right">
                  <WalletMultiButton />
                </div>
              </div>
            </header>

            <main className="app-main">
              <nav className="tab-navigation">
                <button 
                  className={activeTab === 'dashboard' ? 'active' : ''}
                  onClick={() => setActiveTab('dashboard')}
                >
                  Dashboard
                </button>
                <button 
                  className={activeTab === 'send' ? 'active' : ''}
                  onClick={() => setActiveTab('send')}
                >
                  Send Payment
                </button>
                <button 
                  className={activeTab === 'track' ? 'active' : ''}
                  onClick={() => setActiveTab('track')}
                >
                  Track Payments
                </button>
              </nav>

              <div className="tab-content">
                {activeTab === 'dashboard' && <Dashboard poolStats={poolStats} />}
                {activeTab === 'send' && <DepositFlow />}
                {activeTab === 'track' && <WithdrawFlow />}
              </div>
            </main>

            <footer className="app-footer">
              <p>
                <strong>Experimental Software:</strong> This system breaks payments into fragments 
                delivered over time. Use responsibly and only on Devnet for testing.
              </p>
            </footer>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
