# Tajiri Contract System Documentation

## Overview

The Tajiri smart contract system is a comprehensive platform for creating, managing, and trading tokenized stocks on the Hedera network. The system consists of two main components:

1. **Wallet System**: Smart contract wallets with account abstraction and social recovery features
2. **Stock Trading System**: A set of contracts for minting, redeeming, and trading tokenized stocks

## Contracts Architecture

### Wallet System

- **TajiriWallet.sol**: Core smart contract wallet with account abstraction features
- **TajiriWalletFactory.sol**: Factory contract for deploying new wallets

### Stock Trading System

The stock trading system follows an inheritance pattern, with each contract extending the functionality of its parent:

1. **ManageStock.sol**: Base contract for stock management (add, remove, price updates)
2. **MintStock.sol**: Extends ManageStock with token minting capabilities
3. **RedeemStock.sol**: Extends MintStock with token redemption functionality
4. **PostOfferOnP2P.sol**: Extends RedeemStock with P2P trading offers
5. **DoP2PTrade.sol**: Extends PostOfferOnP2P with trade execution

### Token Contract

- **SafaricomStock.sol**: Example stock token contract using Hedera Token Service

## Hedera Integration

All contracts are designed for seamless integration with the Hedera network, using:

- **Hedera Token Service (HTS)**: For token operations
- **Hedera Exchange Rate Service**: For HBAR price conversions
- **Hedera Smart Contract Service**: For contract deployment and execution

## Key Features

- **Account Abstraction**: Execute transactions without gas tokens
- **Social Recovery**: Recover wallet access through trusted guardians
- **HTS Integration**: Native integration with Hedera Token Service
- **Dual Support**: Compatible with both HTS tokens and standard ERC20 tokens
- **P2P Trading**: Direct peer-to-peer trading without intermediaries

## Getting Started

Refer to individual contract documentation for details on:
- Contract initialization and deployment
- Function specifications and parameters
- Events and their triggered conditions
- Security considerations and best practices

## Version

This documentation covers Tajiri v2, which has been updated for full Hedera compatibility.
