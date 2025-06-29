
import CryptoJS from 'crypto-js'
import nacl from 'tweetnacl'
import bs58 from 'bs58'

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
