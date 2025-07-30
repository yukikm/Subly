# Subly

## Overview

This protocol lets users stake or lend deposited tokens such as SOL so the resulting yield automatically funds their subscription fees. Subscription service providers receive “payment‑right” tokens that entitle them to this yield, and smart contracts distribute the fees to them at preset intervals. By eliminating the need to convert crypto earnings back to fiat, the platform offers seamless on‑chain payments for both subscription service providers and their customers.

## Protocol MVP

- The protocol shall allow a user to deposit SOL tokens
- The protocol shall allow a user to register subscription business service (Only subscriptions for which the deposited amount of SOL, when converted using the expected annual APY, can generate enough monthly yield to cover the subscription fee)
- The protocol shall allow lock user’s SOL(subscription service contract period)
- The protocol shall allow stake user’s SOL tokens to Jito
- The protocol shall allow a subscription business provider to register their business(Business name/Subscription fee(per month)/Mint destination address of payment-right token)
- The protocol shall allow mint payment-right NFT token to registered address of subscription business provider
- The protocol shall allow calculate each user’s subscription fees
- The protocol shall allow unstake JitoSOL to cover each user's subscription fees.
- The protocol shall allow swap from SOL to USDC.
- The protocol shall allow send USDC to each user's subscribed services provider
