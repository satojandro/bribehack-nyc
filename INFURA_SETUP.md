# 🔧 Infura Setup Instructions

## Quick Fix for 401 Authentication Error

The application is currently experiencing a 401 error because it's using a public Infura key that no longer has access to Sepolia. Follow these steps to fix it:

### Step 1: Create Your Infura Account

1. Go to [https://infura.io/dashboard](https://infura.io/dashboard)
2. Sign up for a free account (or sign in if you have one)
3. Click "Create New API Key"
4. Name your project (e.g., "Bribehack")
5. Select "Web3 API" as the product

### Step 2: Configure Your Project

1. In your Infura dashboard, click on your project
2. Under "Network Endpoints", ensure **Sepolia** is enabled
3. Copy your **Project ID** (it will look like: `abc123def456...`)

### Step 3: Update Your Local Environment

Edit your `.env.local` file and replace `YOUR_INFURA_PROJECT_ID` with your actual project ID:

```env
# Infura RPC URLs
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID_HERE
NEXT_PUBLIC_MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID_HERE
```

Example with a real ID:
```env
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p
NEXT_PUBLIC_MAINNET_RPC_URL=https://mainnet.infura.io/v3/2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p
```

### Step 4: Restart Your Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 5: Fix Browser Extensions (Optional)

If you see `ERR_BLOCKED_BY_CLIENT` errors:
- Disable AdBlock or other privacy extensions for `localhost:3001`
- Or add `logs.dynamicauth.com` to your adblocker's allowlist

## ✅ Verification

After completing these steps:
1. Open your browser at http://localhost:3001
2. Click "Connect Wallet"
3. You should now be able to connect without the 401 error

## 🆘 Troubleshooting

- **Still getting 401?** Double-check that Sepolia is enabled in your Infura project settings
- **Wrong network?** Make sure your wallet is connected to Sepolia testnet
- **Need testnet ETH?** Get some from [https://sepoliafaucet.com](https://sepoliafaucet.com)

## 📝 Note for Deployment

When deploying to production, make sure to:
1. Add these environment variables to your hosting platform (Vercel, Netlify, etc.)
2. Consider using a paid Infura plan for higher rate limits
3. Keep your Project Secret secure (never commit it to git)