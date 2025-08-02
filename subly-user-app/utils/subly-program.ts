import { Connection, PublicKey, SystemProgram, TransactionInstruction, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { SUBLY_PROGRAM_ID, SEEDS } from '@/constants/subly-program'

/**
 * Utility functions for interacting with the Subly Solana program
 */

/**
 * Find Program Derived Address (PDA) for user account
 */
export function findUserAccountPDA(userWallet: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([SEEDS.USER, userWallet.toBuffer()], SUBLY_PROGRAM_ID)
}

/**
 * Find PDA for SOL vault
 */
export function findSolVaultPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([SEEDS.SOL_VAULT], SUBLY_PROGRAM_ID)
}

/**
 * Find PDA for subscription service
 */
export function findSubscriptionServicePDA(providerWallet: PublicKey, serviceId: number): [PublicKey, number] {
  const serviceIdBuffer = Buffer.alloc(8)
  serviceIdBuffer.writeBigUInt64LE(BigInt(serviceId), 0)

  return PublicKey.findProgramAddressSync(
    [SEEDS.SUBSCRIPTION_SERVICE, providerWallet.toBuffer(), serviceIdBuffer],
    SUBLY_PROGRAM_ID,
  )
}

/**
 * Find PDA for user subscription
 */
export function findUserSubscriptionPDA(userWallet: PublicKey, subscriptionId: number): [PublicKey, number] {
  const subscriptionIdBuffer = Buffer.alloc(8)
  subscriptionIdBuffer.writeBigUInt64LE(BigInt(subscriptionId), 0)

  return PublicKey.findProgramAddressSync(
    [SEEDS.USER_SUBSCRIPTION, userWallet.toBuffer(), subscriptionIdBuffer],
    SUBLY_PROGRAM_ID,
  )
}

/**
 * Create instruction for depositing SOL
 */
export function createDepositSolInstruction(userWallet: PublicKey, amount: number): TransactionInstruction {
  const [userAccountPDA] = findUserAccountPDA(userWallet)
  const [solVaultPDA] = findSolVaultPDA()

  const amountLamports = BigInt(Math.floor(amount * LAMPORTS_PER_SOL))
  const amountBuffer = Buffer.alloc(8)
  amountBuffer.writeBigUInt64LE(amountLamports, 0)

  // Create instruction discriminator for depositSol
  const discriminator = Buffer.from([108, 81, 78, 117, 125, 155, 56, 200])
  const instructionData = Buffer.concat([discriminator, amountBuffer])

  return new TransactionInstruction({
    programId: SUBLY_PROGRAM_ID,
    keys: [
      { pubkey: userWallet, isSigner: true, isWritable: true },
      { pubkey: userAccountPDA, isSigner: false, isWritable: true },
      { pubkey: solVaultPDA, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data: instructionData,
  })
}

/**
 * Create instruction for subscribing to a service
 */
export function createSubscribeToServiceInstruction(
  userWallet: PublicKey,
  providerWallet: PublicKey,
  serviceId: number,
  certificateNftMint: PublicKey,
  subscriptionCount: number,
): TransactionInstruction {
  const [userAccountPDA] = findUserAccountPDA(userWallet)
  const [subscriptionServicePDA] = findSubscriptionServicePDA(providerWallet, serviceId)
  const [userSubscriptionPDA] = findUserSubscriptionPDA(userWallet, subscriptionCount)

  // Find certificate NFT token account (ATA)
  const [certificateNftTokenAccount] = PublicKey.findProgramAddressSync(
    [userWallet.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), certificateNftMint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  )

  const discriminator = Buffer.from([27, 122, 87, 130, 20, 159, 241, 125])
  const providerWalletBuffer = providerWallet.toBuffer()
  const serviceIdBuffer = Buffer.alloc(8)
  serviceIdBuffer.writeBigUInt64LE(BigInt(serviceId), 0)

  const instructionData = Buffer.concat([discriminator, providerWalletBuffer, serviceIdBuffer])

  return new TransactionInstruction({
    programId: SUBLY_PROGRAM_ID,
    keys: [
      { pubkey: userWallet, isSigner: true, isWritable: true },
      { pubkey: userAccountPDA, isSigner: false, isWritable: true },
      { pubkey: subscriptionServicePDA, isSigner: false, isWritable: false },
      { pubkey: userSubscriptionPDA, isSigner: false, isWritable: true },
      { pubkey: certificateNftMint, isSigner: true, isWritable: true },
      { pubkey: certificateNftTokenAccount, isSigner: false, isWritable: true },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: new PublicKey('SysvarRent111111111111111111111111111111111'), isSigner: false, isWritable: false },
    ],
    data: instructionData,
  })
}

/**
 * Get user balance from the program
 */
export async function getUserBalance(
  connection: Connection,
  userWallet: PublicKey,
): Promise<{ depositedSol: number; subscriptionCount: number } | null> {
  try {
    const [userAccountPDA] = findUserAccountPDA(userWallet)
    const accountInfo = await connection.getAccountInfo(userAccountPDA)

    if (!accountInfo) {
      return null
    }

    // Parse account data (simplified - in real implementation you'd use proper IDL parsing)
    const data = accountInfo.data
    if (data.length < 24) {
      return null
    }

    // Skip discriminator (8 bytes) and wallet (32 bytes)
    const depositedSolLamports = data.readBigUInt64LE(40)
    const subscriptionCount = data.readBigUInt64LE(48)

    return {
      depositedSol: Number(depositedSolLamports) / LAMPORTS_PER_SOL,
      subscriptionCount: Number(subscriptionCount),
    }
  } catch (error) {
    console.error('Error fetching user balance:', error)
    return null
  }
}

/**
 * Convert SOL amount to lamports
 */
export function solToLamports(sol: number): number {
  return Math.floor(sol * LAMPORTS_PER_SOL)
}

/**
 * Convert lamports to SOL
 */
export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL
}
