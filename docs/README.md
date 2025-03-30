# Tajiri Contract Documentation

## Overview

This documentation covers the Tajiri smart contract system that has been fully updated for Hedera compatibility. The system consists of two main components:

1. **Smart Contract Wallet System** - Providing secure wallet functionality with account abstraction features
2. **Stock Trading System** - Enabling tokenized stock trading with Hedera Token Service support

## Wallet System

The wallet system provides secure, guardian-protected wallet functionality for Hedera users:

1. [TajiriWallet](contracts/01-TajiriWallet.md) - Smart contract wallet with multi-signature and recovery features
2. [TajiriWalletFactory](contracts/02-TajiriWalletFactory.md) - Factory for deploying new wallet instances

## Stock Trading System

The stock trading system enables creation, trading, and redemption of tokenized stocks:

1. [SafaricomStock](contracts/03-SafaricomStock.md) - HTS token implementation for Safaricom stock
2. [ManageStock](contracts/04-ManageStock.md) - Base contract for stock management
3. [MintStock](contracts/05-MintStock.md) - Minting new stock tokens for HBAR
4. [RedeemStock](contracts/06-RedeemStock.md) - Redeeming stock tokens back to HBAR
5. [PostOfferOnP2P](contracts/07-PostOfferOnP2P.md) - Creating P2P buy/sell offers
6. [DoP2PTrade](contracts/08-DoP2PTrade.md) - Executing trades between users

## Inheritance Structure

The stock trading system uses a layered inheritance pattern:

```
Ownable           ReentrancyGuard
  ↑                    ↑
ManageStock            |
  ↑                    |
MintStock              |
  ↑                    |
RedeemStock            |
  ↑                    |
PostOfferOnP2P---------+
  ↑
DoP2PTrade
```

## Hedera Integration

All contracts utilize Hedera precompile addresses for optimal integration:

- Hedera Token Service (HTS): `0x167`
- Exchange Rate Service: `0x168`

## Development Lifecycle

To deploy the full system:

1. Deploy the wallet factory and stock token contracts
2. Deploy the trading system, starting with DoP2PTrade
3. Register stock tokens with the trading system
4. Create user wallets through the factory

## Token Lifecycle

A complete token lifecycle in the system:

1. **Creation**: Token is created with SafaricomStock
2. **Registration**: Token is added to ManageStock
3. **Acquisition**: Users mint tokens using MintStock
4. **Trading**: Users trade tokens via PostOfferOnP2P and DoP2PTrade
5. **Redemption**: Users redeem tokens back to HBAR via RedeemStock

## Security Considerations

The system incorporates multiple security mechanisms:

- Multi-signature wallet protection
- Social recovery with time delays
- Escrow-based trading system
- Non-reentrancy protection
- Owner-only administrative functions
- Event emissions for all critical actions
