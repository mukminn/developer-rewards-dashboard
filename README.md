# BaseToken - ERC20 Token on Base

A simple, secure ERC20 token implementation for the Base blockchain using Hardhat, OpenZeppelin contracts, and best practices.

## 📱 dApp

A separate **mini dApp** project is available for interacting with the BaseToken contract:
- Connect wallet (MetaMask)
- Read contract data (balance, supply, etc.)
- Write transactions (transfer, mint, burn)
- Simple, modern UI
- Ready to deploy to Vercel

See the separate repository: [mini-app-baru](https://github.com/mukminn/mini-app-baru)

## 📋 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contract Details](#contract-details)
- [Best Practices](#best-practices)
- [License](#license)

## ✨ Features

- **Standard ERC20**: Full ERC20 token implementation
- **Burnable**: Tokens can be burned to reduce total supply
- **Ownable**: Owner can mint new tokens
- **OpenZeppelin**: Uses battle-tested OpenZeppelin contracts
- **Hardhat**: Complete Hardhat development environment
- **Base Network**: Configured for Base mainnet and Base Sepolia testnet
- **Verification**: Automatic contract verification on BaseScan

## 🔧 Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- A wallet with some ETH on Base (for deployment)
- BaseScan API key (optional, for contract verification)

## 📦 Installation

1. Clone or navigate to this project directory:
```bash
cd base-erc20-token
```

2. Install dependencies:
```bash
npm install
```

## ⚙️ Configuration

1. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

2. Add your configuration to `.env`:
```env
PRIVATE_KEY=your_private_key_here
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASE_MAINNET_RPC_URL=https://mainnet.base.org
BASESCAN_API_KEY=your_basescan_api_key_here
```

**⚠️ Security Note**: Never commit your `.env` file. It's already in `.gitignore`.

## 🚀 Usage

### Compile Contracts

```bash
npm run compile
```

### Run Local Node (Optional)

Start a local Hardhat node for testing:

```bash
npm run node
```

In another terminal, deploy to localhost:

```bash
npm run deploy:local
```

## 🧪 Testing

Run the test suite:

```bash
npm test
```

The tests cover:
- ✅ Deployment and initialization
- ✅ Token transfers
- ✅ Minting (owner only)
- ✅ Burning tokens
- ✅ Allowance and approvals
- ✅ Edge cases and error handling

## 📤 Deployment

### Deploy to Base Sepolia (Testnet)

1. Get testnet ETH from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
2. Deploy:
```bash
npm run deploy:base-sepolia
```

### Deploy to Base Mainnet

1. Ensure you have ETH on Base mainnet
2. Deploy:
```bash
npm run deploy:base
```

The deployment script will:
- Deploy the contract
- Display deployment information
- Automatically verify the contract on BaseScan (if API key is provided)

## 📄 Contract Details

### BaseToken Contract

**Location**: `contracts/BaseToken.sol`

**Features**:
- **ERC20**: Standard token functionality (transfer, balance, etc.)
- **ERC20Burnable**: Tokens can be burned
- **Ownable**: Owner-controlled minting

**Constructor Parameters**:
- `name`: Token name (e.g., "Base Token")
- `symbol`: Token symbol (e.g., "BASE")
- `initialSupply`: Initial supply in wei (e.g., 1,000,000 tokens = `1000000 * 10^18`)

**Functions**:
- `mint(address to, uint256 amount)`: Owner can mint new tokens
- `burn(uint256 amount)`: Anyone can burn their own tokens
- Standard ERC20 functions: `transfer`, `approve`, `transferFrom`, etc.

### Default Configuration

- **Name**: Base Token
- **Symbol**: BASE
- **Initial Supply**: 1,000,000 tokens

You can modify these in `scripts/deploy.js`.

## 🏆 Best Practices

This project follows Solidity and blockchain development best practices:

1. **OpenZeppelin Contracts**: Uses audited, industry-standard contracts
2. **Access Control**: Proper use of `Ownable` for privileged functions
3. **Error Handling**: Clear error messages using custom errors
4. **Code Comments**: Comprehensive NatSpec documentation
5. **Testing**: Comprehensive test coverage
6. **Security**: No hardcoded secrets, proper `.gitignore`
7. **Optimization**: Solidity compiler optimizer enabled
8. **Network Configuration**: Separate configs for testnet and mainnet
9. **Verification**: Automatic contract verification on block explorers

## 🔗 Useful Links

- [Base Documentation](https://docs.base.org/)
- [BaseScan Explorer](https://basescan.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Hardhat Documentation](https://hardhat.org/docs)
- [ERC20 Standard](https://eips.ethereum.org/EIPS/eip-20)

## 📝 License

MIT License - see LICENSE file for details

## 👤 Author

mukminn

---

**⚠️ Disclaimer**: This is a basic ERC20 implementation for educational purposes. For production use, consider additional features like:
- Pausable functionality
- Time-locked transfers
- Tax mechanisms
- Multi-signature wallet support
- Comprehensive security audits
