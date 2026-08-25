import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { WalletProvider } from './context/WalletContext'
import { seedBlockchainEventsIfEmpty } from './lib/did/blockchainLayer'
import { mockBlockchainEvents } from './data/mockDIDData'

// Seed the mock blockchain ledger with demo events on first run
seedBlockchainEventsIfEmpty(mockBlockchainEvents);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WalletProvider>
      <App />
    </WalletProvider>
  </StrictMode>,
)