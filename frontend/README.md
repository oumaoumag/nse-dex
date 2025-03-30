# Tajiri Frontend

A blockchain-based financial platform for tokenizing and trading stocks from the Nairobi Securities Exchange (NSE) built on Hedera.

## Features

- Tokenized stock trading with Hedera Token Service (HTS)
- Smart contract wallet with account abstraction
- Google authentication for user management
- Modern UI inspired by Safaricom Decode

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A Hedera account for testing
- Google Cloud Platform account (for OAuth)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/tajiri-v2.git
   cd tajiri-v2/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Fill in the required environment variables (see the Configuration section below)

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Configuration

### Google OAuth Setup

To enable Google login, you need to set up OAuth credentials:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Navigate to "APIs & Services" > "Credentials".
4. Click "Create Credentials" and select "OAuth client ID".
5. Select "Web application" as the application type.
6. Add your development URL (e.g., `http://localhost:3000`) to the "Authorized JavaScript origins".
7. Add your development callback URL (e.g., `http://localhost:3000/api/auth/callback/google`) to the "Authorized redirect URIs".
8. Click "Create" to get your Client ID and Client Secret.
9. Add these credentials to your `.env.local` file:
   ```
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

### NextAuth Configuration

For NextAuth.js to work properly, you need to set up a secret key:

1. Generate a random secret key:
   ```bash
   openssl rand -base64 32
   # or
   node -e "console.log(crypto.randomBytes(32).toString('hex'))"
   ```

2. Add it to your `.env.local` file:
   ```
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_generated_secret
   ```

### Hedera Configuration

For connecting to the Hedera network, you need to set up:

1. Hedera account details:
   ```
   NEXT_PUBLIC_HEDERA_NETWORK=testnet
   NEXT_PUBLIC_MY_ACCOUNT_ID=your_hedera_account_id
   NEXT_PUBLIC_MY_PRIVATE_KEY=your_hedera_private_key
   ```

2. Contract IDs for various functionalities:
   ```
   NEXT_PUBLIC_FACTORY_CONTRACT_ID=0.0.xxxx
   NEXT_PUBLIC_MANAGE_STOCK_CONTRACT_ID=0.0.xxxx
   NEXT_PUBLIC_MINT_STOCK_CONTRACT_ID=0.0.xxxx
   NEXT_PUBLIC_REDEEM_STOCK_CONTRACT_ID=0.0.xxxx
   NEXT_PUBLIC_P2P_OFFERS_CONTRACT_ID=0.0.xxxx
   NEXT_PUBLIC_P2P_TRADE_CONTRACT_ID=0.0.xxxx
   ```

## Architecture

The application uses:

- Next.js 13+ with App Router
- TailwindCSS for styling
- NextAuth.js for authentication
- Hedera SDK for blockchain interactions

## Key Components

- **WalletContext**: Manages wallet connections and Hedera interactions
- **StockContext**: Handles stock-related operations (mint, redeem, trade)
- **AuthProvider**: Provides authentication across the application
- **GoogleLoginButton**: Implements Google OAuth login

## UI Theme

The UI follows the Safaricom Decode design system with:

- Black background with green accents
- Modern glass-effect cards
- Clean typography with uppercase headings
- Consistent spacing and interactive elements

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Troubleshooting

### Common Issues and Solutions

#### CostQuery Error
If you see errors like `CostQuery has not been loaded yet` in the console, this is typically due to Hedera's client not being fully initialized before making queries. 

**Solution:** We've added robust retry logic to handle these errors automatically. If you still encounter them:
1. Make sure your network connection is stable
2. Try refreshing the page after a few seconds
3. Check that your Hedera credentials in `.env.local` are correct

#### Image Loading Issues
If you encounter `next/image` errors with Google profile images, this happens because the Google user profile image domain needs to be allowed in Next.js configuration.

**Solution:** We've implemented a fallback for image loading. If image loading still fails:
1. Make sure `lh3.googleusercontent.com` is in the `images.domains` array in `next.config.js`
2. Restart your development server

#### Missing favicon.ico
If you see a 500 error for favicon.ico, it means the favicon file is missing from the public directory.

**Solution:** We've added a placeholder favicon. If you want to use your own:
1. Place your `favicon.ico` file in the `frontend/public` directory

#### React Component Errors
If you see warnings about updating components while rendering, this is typically due to state updates happening during render phase.

**Solution:** We've updated components to ensure state updates happen in effects or event handlers, not during rendering.
