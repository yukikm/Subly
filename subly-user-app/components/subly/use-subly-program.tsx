import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js'

const PROGRAM_ID = new PublicKey('5DpoKLMkQSBTi3n6hnjB7RPhzjhovfDZbEHJvFJBXKL9')

// Instruction discriminators from IDL
const DEPOSIT_DISCRIMINATOR = new Uint8Array([242, 35, 198, 137, 82, 225, 242, 182])
const SUBSCRIBE_TO_SERVICE_DISCRIMINATOR = new Uint8Array([27, 122, 87, 130, 20, 159, 241, 125])

// Helper function to derive Sol Vault PDA (from IDL: seeds = ["vault", user])
function getSolVaultPDA(user: PublicKey, programId: PublicKey) {
  const vaultSeed = 'vault'
  const seeds = [Buffer.from(vaultSeed, 'utf8'), user.toBuffer()]
  return PublicKey.findProgramAddressSync(seeds, programId)
}

// Helper function to derive User Subscription PDA (from IDL: seeds = ["subscription", user])
function getUserSubscriptionPDA(user: PublicKey, programId: PublicKey) {
  const subscriptionSeed = 'subscription'
  const seeds = [Buffer.from(subscriptionSeed, 'utf8'), user.toBuffer()]
  return PublicKey.findProgramAddressSync(seeds, programId)
}

// Serialize u64 as little endian
function serializeU64(value: number): Buffer {
  const buffer = Buffer.alloc(8)
  buffer.writeBigUInt64LE(BigInt(value), 0)
  return buffer
}

// Serialize pubkey
function serializePubkey(pubkey: PublicKey): Buffer {
  return Buffer.from(pubkey.toBytes())
}

/**
 * Create deposit instruction using direct instruction building (no Anchor)
 */
export async function createDepositInstruction(
  connection: Connection,
  userPublicKey: PublicKey,
  amount: number,
): Promise<VersionedTransaction> {
  try {
    // Derive Sol Vault PDA
    const [solVault] = getSolVaultPDA(userPublicKey, PROGRAM_ID)

    // Create instruction data
    const amountLamports = amount * LAMPORTS_PER_SOL
    const instructionData = Buffer.concat([DEPOSIT_DISCRIMINATOR, serializeU64(amountLamports)])

    // Create the instruction
    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: userPublicKey, isSigner: true, isWritable: true }, // user
        { pubkey: solVault, isSigner: false, isWritable: true }, // sol_vault
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // system_program
      ],
      programId: PROGRAM_ID,
      data: instructionData,
    })

    // Get latest blockhash
    const latestBlockhash = await connection.getLatestBlockhash('confirmed')

    // Create versioned transaction message
    const txMessage = new TransactionMessage({
      payerKey: userPublicKey,
      recentBlockhash: latestBlockhash.blockhash,
      instructions: [instruction],
    }).compileToV0Message()

    // Create versioned transaction
    return new VersionedTransaction(txMessage)
  } catch (error) {
    console.error('Error creating deposit instruction:', error)
    throw new Error(`Failed to create deposit instruction: ${error}`)
  }
}

/**
 * Create subscription instruction using direct instruction building (no Anchor)
 */
export async function createSubscribeToServiceInstruction(
  connection: Connection,
  userPublicKey: PublicKey,
  providerPublicKey: PublicKey,
  serviceId: number,
  subscriptionId: number,
): Promise<VersionedTransaction> {
  try {
    // Derive PDAs
    const [solVault] = getSolVaultPDA(userPublicKey, PROGRAM_ID)
    const [userSubscription] = getUserSubscriptionPDA(userPublicKey, PROGRAM_ID)

    // Create instruction data
    const instructionData = Buffer.concat([
      SUBSCRIBE_TO_SERVICE_DISCRIMINATOR,
      serializePubkey(providerPublicKey),
      serializeU64(serviceId),
      serializeU64(subscriptionId),
    ])

    // Create the instruction
    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: userPublicKey, isSigner: true, isWritable: true }, // user
        { pubkey: providerPublicKey, isSigner: false, isWritable: false }, // provider
        { pubkey: solVault, isSigner: false, isWritable: true }, // sol_vault
        { pubkey: userSubscription, isSigner: false, isWritable: true }, // user_subscription
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }, // system_program
      ],
      programId: PROGRAM_ID,
      data: instructionData,
    })

    // Get latest blockhash
    const latestBlockhash = await connection.getLatestBlockhash('confirmed')

    // Create versioned transaction message
    const txMessage = new TransactionMessage({
      payerKey: userPublicKey,
      recentBlockhash: latestBlockhash.blockhash,
      instructions: [instruction],
    }).compileToV0Message()

    // Create versioned transaction
    return new VersionedTransaction(txMessage)
  } catch (error) {
    console.error('Error creating subscribe instruction:', error)
    throw new Error(`Failed to create subscribe instruction: ${error}`)
  }
}

/**
 * Get user balance and subscription count from the sol vault
 */
export async function getUserBalance(
  connection: Connection,
  userPublicKey: PublicKey,
): Promise<{ depositedSol: number; subscriptionCount: number }> {
  try {
    // Derive Sol Vault PDA
    const [solVault] = getSolVaultPDA(userPublicKey, PROGRAM_ID)

    // Get account info
    const accountInfo = await connection.getAccountInfo(solVault)

    if (!accountInfo) {
      // Account doesn't exist yet, return zero balance
      return { depositedSol: 0, subscriptionCount: 0 }
    }

    // The Sol Vault account should contain the deposited SOL balance
    const depositedSol = accountInfo.lamports / LAMPORTS_PER_SOL

    // For subscription count, we'd need to check user subscription PDA
    // For now, return mock data until proper account parsing is implemented
    return {
      depositedSol,
      subscriptionCount: 0, // TODO: Parse from user subscription account
    }
  } catch (error) {
    console.error('Error getting user balance:', error)
    return { depositedSol: 0, subscriptionCount: 0 }
  }
}
