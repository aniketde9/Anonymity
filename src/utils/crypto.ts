
import CryptoJS from 'crypto-js'
import nacl from 'tweetnacl'
import bs58 from 'bs58'

const API_BASE_URL = 'http://0.0.0.0:5000/api'

/**
 * Generate a cryptographically secure secret note
 */
export function generateSecretNote(): string {
  // Generate 32 bytes of random data
  const randomBytes = nacl.randomBytes(32)
  
  // Convert to base58 for easy copying/pasting
  const secretNote = bs58.encode(randomBytes)
  
  return secretNote
}

/**
 * Generate a leaf (hash) from a secret note for the merkle tree
 */
export function generateLeaf(secretNote: string): string {
  // Hash the secret note to create the leaf
  const hash = CryptoJS.SHA256(secretNote)
  return hash.toString(CryptoJS.enc.Hex)
}

/**
 * Validate that a secret note is properly formatted
 */
export function validateSecretNote(secretNote: string): boolean {
  try {
    // Check if it's valid base58
    const decoded = bs58.decode(secretNote)
    
    // Check if it's the expected length (32 bytes)
    return decoded.length === 32
  } catch {
    return false
  }
}

/**
 * Generate a commitment from secret note and nullifier
 */
export function generateCommitment(secretNote: string, nullifier: string): string {
  const combined = secretNote + nullifier
  const hash = CryptoJS.SHA256(combined)
  return hash.toString(CryptoJS.enc.Hex)
}

/**
 * API functions for backend communication
 */
export async function prepareDeposit(secretNote: string, depositAmount: number) {
  const response = await fetch(`${API_BASE_URL}/deposit/prepare`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      secretNote,
      depositAmount
    })
  })
  
  if (!response.ok) {
    throw new Error('Failed to prepare deposit')
  }
  
  return response.json()
}

export async function commitDeposit(commitment: string, signature: string) {
  const response = await fetch(`${API_BASE_URL}/deposit/commit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      commitment,
      signature
    })
  })
  
  if (!response.ok) {
    throw new Error('Failed to commit deposit')
  }
  
  return response.json()
}

export async function prepareWithdraw(secretNote: string, recipientAddress: string) {
  const response = await fetch(`${API_BASE_URL}/withdraw/prepare`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      secretNote,
      recipientAddress
    })
  })
  
  if (!response.ok) {
    throw new Error('Failed to prepare withdrawal')
  }
  
  return response.json()
}

export async function executeWithdraw(secretNote: string, signature: string) {
  const response = await fetch(`${API_BASE_URL}/withdraw/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      secretNote,
      signature
    })
  })
  
  if (!response.ok) {
    throw new Error('Failed to execute withdrawal')
  }
  
  return response.json()
}

export async function getPoolStats() {
  const response = await fetch(`${API_BASE_URL}/pool/stats`)
  
  if (!response.ok) {
    throw new Error('Failed to fetch pool stats')
  }
  
  return response.json()
}
