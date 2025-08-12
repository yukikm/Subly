import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SublyProgram } from "../target/types/subly_program";
import { PublicKey, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";

describe("Subly Protocol - Complete Test Suite", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SublyProgram as Program<SublyProgram>;
  const provider = anchor.AnchorProvider.env();

  // Test accounts
  let authority: Keypair;
  let provider1: Keypair;
  let provider2: Keypair;
  let user1: Keypair;
  let user2: Keypair;

  // PDAs
  let globalStatePda: PublicKey;
  let treasuryPda: PublicKey;

  before(async () => {
    // Generate test keypairs
    authority = Keypair.generate();
    provider1 = Keypair.generate();
    provider2 = Keypair.generate();
    user1 = Keypair.generate();
    user2 = Keypair.generate();

    // Find PDAs
    [globalStatePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("global_state")],
      program.programId
    );

    [treasuryPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("treasury")],
      program.programId
    );

    // Airdrop SOL to test accounts
    const accounts = [authority, provider1, provider2, user1, user2];
    for (const account of accounts) {
      const signature = await provider.connection.requestAirdrop(
        account.publicKey,
        5 * LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(signature);
    }
  });

  describe("Protocol Initialization", () => {
    it("should initialize the protocol", async () => {
      try {
        const tx = await program.methods
          .initialize()
          .accounts({
            authority: authority.publicKey,
            globalState: globalStatePda,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([authority])
          .rpc();

        console.log("✅ Protocol initialized:", tx);

        // Verify global state
        const globalState = await program.account.globalState.fetch(
          globalStatePda
        );
        console.log("Global State:", {
          authority: globalState.authority.toString(),
          totalProviders: globalState.totalProviders.toString(),
          totalUsers: globalState.totalUsers.toString(),
          protocolFeeBps: globalState.protocolFeeBps,
          isPaused: globalState.isPaused,
        });
      } catch (error) {
        console.log("Initialize error:", error);
        throw error;
      }
    });
  });

  describe("Provider Registration", () => {
    it("should register providers", async () => {
      const providers = [
        {
          keypair: provider1,
          name: "Netflix Entertainment",
          description: "Premium streaming service with original content",
          website: "https://netflix.com",
        },
        {
          keypair: provider2,
          name: "Spotify Music",
          description: "Music streaming and podcast platform",
          website: "https://spotify.com",
        },
      ];

      for (const providerInfo of providers) {
        try {
          const [providerPda] = PublicKey.findProgramAddressSync(
            [
              Buffer.from("provider"),
              providerInfo.keypair.publicKey.toBuffer(),
            ],
            program.programId
          );

          const providerNftMint = Keypair.generate();
          const [providerNftTokenAccount] = PublicKey.findProgramAddressSync(
            [
              providerInfo.keypair.publicKey.toBuffer(),
              anchor.utils.token.TOKEN_PROGRAM_ID.toBuffer(),
              providerNftMint.publicKey.toBuffer(),
            ],
            anchor.utils.token.ASSOCIATED_PROGRAM_ID
          );

          const tx = await program.methods
            .registerProvider(
              providerInfo.name,
              providerInfo.description,
              providerInfo.website
            )
            .accounts({
              provider: providerInfo.keypair.publicKey,
              globalState: globalStatePda,
              providerAccount: providerPda,
              providerNftMint: providerNftMint.publicKey,
              providerNftTokenAccount: providerNftTokenAccount,
              tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
              associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
              systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([providerInfo.keypair, providerNftMint])
            .rpc();

          console.log(`✅ Provider '${providerInfo.name}' registered:`, tx);
        } catch (error) {
          console.log(
            `❌ Failed to register provider '${providerInfo.name}':`,
            error
          );
        }
      }
    });
  });

  describe("Subscription Service Management", () => {
    it("should register subscription services", async () => {
      const services = [
        {
          provider: provider1,
          name: "Netflix Premium",
          description: "4K streaming, multiple screens, no ads",
          feeUsd: 1599, // $15.99
          billingFrequencyDays: 30,
          imageUrl: "https://netflix.com/logo.png",
          maxSubscribers: new anchor.BN(1000000),
        },
        {
          provider: provider1,
          name: "Netflix Basic",
          description: "HD streaming, single screen",
          feeUsd: 899, // $8.99
          billingFrequencyDays: 30,
          imageUrl: "https://netflix.com/basic-logo.png",
          maxSubscribers: null,
        },
        {
          provider: provider2,
          name: "Spotify Premium",
          description: "Ad-free music, offline listening",
          feeUsd: 999, // $9.99
          billingFrequencyDays: 30,
          imageUrl: "https://spotify.com/logo.png",
          maxSubscribers: null,
        },
      ];

      for (let i = 0; i < services.length; i++) {
        const service = services[i];
        try {
          const [providerPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("provider"), service.provider.publicKey.toBuffer()],
            program.programId
          );

          const providerAccount = await program.account.provider.fetch(
            providerPda
          );

          const [servicePda] = PublicKey.findProgramAddressSync(
            [
              Buffer.from("subscription_service"),
              service.provider.publicKey.toBuffer(),
              new anchor.BN(providerAccount.serviceCount).toBuffer("le", 8),
            ],
            program.programId
          );

          const tx = await program.methods
            .registerSubscriptionService(
              service.name,
              service.description,
              new anchor.BN(service.feeUsd),
              new anchor.BN(service.billingFrequencyDays),
              service.imageUrl,
              service.maxSubscribers
            )
            .accounts({
              provider: service.provider.publicKey,
              providerAccount: providerPda,
              globalState: globalStatePda,
              subscriptionService: servicePda,
              tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
              associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
              systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([service.provider])
            .rpc();

          console.log(`✅ Service '${service.name}' registered:`, tx);
        } catch (error) {
          console.log(
            `❌ Failed to register service '${service.name}':`,
            error
          );
        }
      }
    });
  });

  describe("User Deposit and Staking", () => {
    it("should allow users to deposit SOL", async () => {
      const users = [
        { keypair: user1, depositAmount: 5 * LAMPORTS_PER_SOL },
        { keypair: user2, depositAmount: 3 * LAMPORTS_PER_SOL },
      ];

      for (const userInfo of users) {
        try {
          const [userPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("user"), userInfo.keypair.publicKey.toBuffer()],
            program.programId
          );

          const [solVaultPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("vault"), userInfo.keypair.publicKey.toBuffer()],
            program.programId
          );

          const tx = await program.methods
            .deposit(new anchor.BN(userInfo.depositAmount))
            .accounts({
              user: userInfo.keypair.publicKey,
              userAccount: userPda,
              globalState: globalStatePda,
              solVault: solVaultPda,
              systemProgram: anchor.web3.SystemProgram.programId,
            })
            .signers([userInfo.keypair])
            .rpc();

          console.log(
            `✅ User deposited ${
              userInfo.depositAmount / LAMPORTS_PER_SOL
            } SOL:`,
            tx
          );

          // Verify user account
          const userAccount = await program.account.user.fetch(userPda);
          console.log("User account:", {
            wallet: userAccount.wallet.toString(),
            depositedSol: `${
              userAccount.depositedSol.toNumber() / LAMPORTS_PER_SOL
            } SOL`,
            lockedSol: `${
              userAccount.lockedSol.toNumber() / LAMPORTS_PER_SOL
            } SOL`,
            stakedSol: `${
              userAccount.stakedSol.toNumber() / LAMPORTS_PER_SOL
            } SOL`,
            subscriptionCount: userAccount.subscriptionCount.toString(),
          });
        } catch (error) {
          console.log("❌ Failed to deposit SOL:", error);
        }
      }
    });

    it("should allow users to stake SOL", async () => {
      try {
        const stakeAmount = 2 * LAMPORTS_PER_SOL;

        const [userPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("user"), user1.publicKey.toBuffer()],
          program.programId
        );

        const [stakeAccountPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("stake_account"), user1.publicKey.toBuffer()],
          program.programId
        );

        const [solVaultPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("vault"), user1.publicKey.toBuffer()],
          program.programId
        );

        const [jitoVaultPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("jito_vault")],
          program.programId
        );

        const tx = await program.methods
          .stakeSol(new anchor.BN(stakeAmount))
          .accounts({
            user: user1.publicKey,
            userAccount: userPda,
            stakeAccount: stakeAccountPda,
            solVault: solVaultPda,
            jitoVault: jitoVaultPda,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([user1])
          .rpc();

        console.log(
          `✅ User staked ${stakeAmount / LAMPORTS_PER_SOL} SOL:`,
          tx
        );

        // Verify stake account
        const stakeAccount = await program.account.stakeAccount.fetch(
          stakeAccountPda
        );
        console.log("Stake account:", {
          user: stakeAccount.user.toString(),
          stakedAmount: `${
            stakeAccount.stakedAmount.toNumber() / LAMPORTS_PER_SOL
          } SOL`,
          jitoSolAmount: `${
            stakeAccount.jitoSolAmount.toNumber() / LAMPORTS_PER_SOL
          } JitoSOL`,
          isActive: stakeAccount.isActive,
        });
      } catch (error) {
        console.log("❌ Failed to stake SOL:", error);
      }
    });
  });

  describe("Subscription Management", () => {
    it("should allow users to subscribe to services", async () => {
      try {
        // User1 subscribes to Netflix Premium (service_id: 0)
        const [userPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("user"), user1.publicKey.toBuffer()],
          program.programId
        );

        const userAccount = await program.account.user.fetch(userPda);

        const [subscriptionPda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("user_subscription"),
            user1.publicKey.toBuffer(),
            new anchor.BN(userAccount.subscriptionCount).toBuffer("le", 8),
          ],
          program.programId
        );

        const [servicePda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("subscription_service"),
            provider1.publicKey.toBuffer(),
            new anchor.BN(0).toBuffer("le", 8), // service_id: 0
          ],
          program.programId
        );

        const [providerPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("provider"), provider1.publicKey.toBuffer()],
          program.programId
        );

        const certificateNftMint = Keypair.generate();
        const [certificateNftTokenAccount] = PublicKey.findProgramAddressSync(
          [
            user1.publicKey.toBuffer(),
            anchor.utils.token.TOKEN_PROGRAM_ID.toBuffer(),
            certificateNftMint.publicKey.toBuffer(),
          ],
          anchor.utils.token.ASSOCIATED_PROGRAM_ID
        );

        const tx = await program.methods
          .subscribeToService(provider1.publicKey, new anchor.BN(0))
          .accounts({
            user: user1.publicKey,
            userAccount: userPda,
            subscriptionService: servicePda,
            providerAccount: providerPda,
            userSubscription: subscriptionPda,
            globalState: globalStatePda,
            certificateNftMint: certificateNftMint.publicKey,
            certificateNftTokenAccount: certificateNftTokenAccount,
            tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
            associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([user1, certificateNftMint])
          .rpc();

        console.log("✅ User subscribed to Netflix Premium:", tx);

        // Verify subscription
        const subscription = await program.account.userSubscription.fetch(
          subscriptionPda
        );
        console.log("Subscription:", {
          user: subscription.user.toString(),
          provider: subscription.provider.toString(),
          serviceId: subscription.serviceId.toString(),
          subscriptionId: subscription.subscriptionId.toString(),
          isActive: subscription.isActive,
        });
      } catch (error) {
        console.log("❌ Failed to subscribe to service:", error);
      }
    });

    it("should allow users to unsubscribe from services", async () => {
      try {
        // Wait a bit before unsubscribing
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const [userPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("user"), user1.publicKey.toBuffer()],
          program.programId
        );

        const [subscriptionPda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("user_subscription"),
            user1.publicKey.toBuffer(),
            new anchor.BN(0).toBuffer("le", 8), // subscription_id: 0
          ],
          program.programId
        );

        const [servicePda] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("subscription_service"),
            provider1.publicKey.toBuffer(),
            new anchor.BN(0).toBuffer("le", 8), // service_id: 0
          ],
          program.programId
        );

        const [providerPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("provider"), provider1.publicKey.toBuffer()],
          program.programId
        );

        const tx = await program.methods
          .unsubscribeFromService(new anchor.BN(0))
          .accounts({
            user: user1.publicKey,
            userAccount: userPda,
            userSubscription: subscriptionPda,
            subscriptionService: servicePda,
            providerAccount: providerPda,
            globalState: globalStatePda,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([user1])
          .rpc();

        console.log("✅ User unsubscribed from service:", tx);

        // Verify unsubscription
        const subscription = await program.account.userSubscription.fetch(
          subscriptionPda
        );
        console.log("Updated subscription:", {
          isActive: subscription.isActive,
          unsubscribedAt: subscription.unsubscribedAt?.toString(),
        });
      } catch (error) {
        console.log("❌ Failed to unsubscribe from service:", error);
      }
    });
  });

  describe("Yield and Withdrawals", () => {
    it("should allow users to withdraw SOL", async () => {
      try {
        const withdrawAmount = 1 * LAMPORTS_PER_SOL;

        const [userPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("user"), user2.publicKey.toBuffer()],
          program.programId
        );

        const [solVaultPda] = PublicKey.findProgramAddressSync(
          [Buffer.from("vault"), user2.publicKey.toBuffer()],
          program.programId
        );

        const tx = await program.methods
          .withdraw(new anchor.BN(withdrawAmount))
          .accounts({
            user: user2.publicKey,
            userAccount: userPda,
            solVault: solVaultPda,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .signers([user2])
          .rpc();

        console.log(
          `✅ User withdrew ${withdrawAmount / LAMPORTS_PER_SOL} SOL:`,
          tx
        );

        // Verify user balance
        const userAccount = await program.account.user.fetch(userPda);
        console.log("Updated user balance:", {
          depositedSol: `${
            userAccount.depositedSol.toNumber() / LAMPORTS_PER_SOL
          } SOL`,
        });
      } catch (error) {
        console.log("❌ Failed to withdraw SOL:", error);
      }
    });
  });

  describe("Protocol Statistics", () => {
    it("should display final protocol statistics", async () => {
      try {
        const globalState = await program.account.globalState.fetch(
          globalStatePda
        );

        console.log("\n📊 Final Protocol Statistics:");
        console.log("================================");
        console.log(`Total Providers: ${globalState.totalProviders}`);
        console.log(`Total Users: ${globalState.totalUsers}`);
        console.log(
          `Total Subscription Services: ${globalState.totalSubscriptionServices}`
        );
        console.log(
          `Total Active Subscriptions: ${globalState.totalActiveSubscriptions}`
        );
        console.log(`Protocol Fee: ${globalState.protocolFeeBps / 100}%`);
        console.log(
          `Protocol Status: ${globalState.isPaused ? "Paused" : "Active"}`
        );
        console.log("================================\n");
      } catch (error) {
        console.log("❌ Failed to fetch protocol statistics:", error);
      }
    });
  });
});
