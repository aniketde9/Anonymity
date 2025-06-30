
import { createHash } from 'crypto';

export class MerkleTree {
  private height: number;
  private leaves: Buffer[];
  private tree: Buffer[][];

  constructor(height: number) {
    this.height = height;
    this.leaves = [];
    this.tree = [];
    
    // Initialize empty tree
    for (let level = 0; level <= height; level++) {
      this.tree[level] = [];
    }
  }

  addLeaf(leaf: Buffer): number {
    const leafIndex = this.leaves.length;
    this.leaves.push(leaf);
    this.tree[0][leafIndex] = leaf;
    
    // Update all levels
    this.updateLevels(leafIndex);
    
    return leafIndex;
  }

  private updateLevels(leafIndex: number): void {
    let currentIndex = leafIndex;
    
    for (let level = 0; level < this.height; level++) {
      const isRightNode = currentIndex % 2 === 1;
      const siblingIndex = isRightNode ? currentIndex - 1 : currentIndex + 1;
      
      let leftNode: Buffer;
      let rightNode: Buffer;
      
      if (isRightNode) {
        leftNode = this.tree[level][siblingIndex] || this.getZeroHash(level);
        rightNode = this.tree[level][currentIndex];
      } else {
        leftNode = this.tree[level][currentIndex];
        rightNode = this.tree[level][siblingIndex] || this.getZeroHash(level);
      }
      
      const parentIndex = Math.floor(currentIndex / 2);
      const parentHash = this.hashPair(leftNode, rightNode);
      
      this.tree[level + 1][parentIndex] = parentHash;
      currentIndex = parentIndex;
    }
  }

  getProof(leafIndex: number): Buffer[] {
    if (leafIndex >= this.leaves.length) {
      throw new Error('Leaf index out of bounds');
    }

    const proof: Buffer[] = [];
    let currentIndex = leafIndex;

    for (let level = 0; level < this.height; level++) {
      const isRightNode = currentIndex % 2 === 1;
      const siblingIndex = isRightNode ? currentIndex - 1 : currentIndex + 1;
      
      const sibling = this.tree[level][siblingIndex] || this.getZeroHash(level);
      proof.push(sibling);
      
      currentIndex = Math.floor(currentIndex / 2);
    }

    return proof;
  }

  verifyProof(leafIndex: number, leaf: Buffer, proof: Buffer[]): boolean {
    if (proof.length !== this.height) {
      return false;
    }

    let currentHash = leaf;
    let currentIndex = leafIndex;

    for (let level = 0; level < this.height; level++) {
      const isRightNode = currentIndex % 2 === 1;
      const sibling = proof[level];
      
      if (isRightNode) {
        currentHash = this.hashPair(sibling, currentHash);
      } else {
        currentHash = this.hashPair(currentHash, sibling);
      }
      
      currentIndex = Math.floor(currentIndex / 2);
    }

    return currentHash.equals(this.getRoot());
  }

  getRoot(): string {
    if (this.leaves.length === 0) {
      return this.getZeroHash(this.height).toString('hex');
    }
    
    return this.tree[this.height][0]?.toString('hex') || this.getZeroHash(this.height).toString('hex');
  }

  getHeight(): number {
    return this.height;
  }

  getLeafCount(): number {
    return this.leaves.length;
  }

  getNextLeafIndex(): number {
    return this.leaves.length;
  }

  private hashPair(left: Buffer, right: Buffer): Buffer {
    return createHash('sha256')
      .update(Buffer.concat([left, right]))
      .digest();
  }

  private getZeroHash(level: number): Buffer {
    // Generate deterministic zero hashes for empty nodes
    let hash = Buffer.alloc(32, 0);
    for (let i = 0; i < level; i++) {
      hash = createHash('sha256').update(hash).digest();
    }
    return hash;
  }
}
