# [FlashBurn](https://flashburn.gcubed.io/) - Burn sUSD Debt with Staked SNX

![CI](https://github.com/snxgrants/flashburn/workflows/CI/badge.svg)

This monorepo contains the smart contracts and interface for FlashBurn.

## Description

FlashBurn allows you to burn your sUSD debt using staked SNX. Stakers who are low on liquidity or unable to acquire sUSD can use this tool to sell off their SNX and pay off their sUSD debt in 1 transaction.

The smart contract works by taking a sUSD flash loan from Aave V2 to burn a specified amount of the users sUSD debt. In doing so, the users SNX unstakes and becomes transferrable. The contract transfers the SNX from the user, then sells it on an approved DEX (e.g. 1inch) for sUSD to pay back the flash loan.

## Contract Addresses

Latest [`SNXFlashLoanTool`](./packages/contracts/contracts/SNXFlashLoanTool.sol) deployment at tag [v1.0.8](https://github.com/snxgrants/flashburn/releases/tag/v1.0.8):

| Network | Explorer                                                                                                                    |
| ------- | --------------------------------------------------------------------------------------------------------------------------- |
| Mainnet | [0x8A2BCd334f557f4654855A8da34142f271C0021C](https://etherscan.io/address/0x8A2BCd334f557f4654855A8da34142f271C0021C)       |
| Kovan   | [0x231e7959852509E4872C3374554784a46EB8d680](https://kovan.etherscan.io/address/0x231e7959852509E4872C3374554784a46EB8d680) |

## Installation

The [contracts package](./packages/contracts) can be installed via `npm` ([npm link](https://www.npmjs.com/package/@snx-flash-tool/contracts)):

```bash
# Yarn
yarn add @snx-flash-tool/contracts
# npm
npm install @snx-flash-tool/contracts
```

### Solidity

You can import the Solidity contracts from `@snx-flash-tool/contracts/contracts` and the interfaces from `@snx-flash-tool/contracts/contracts/interfaces`:

```solidity
import { SNXFlashLoanTool } from "@snx-flash-tool/contracts/contracts/SNXFlashLoanTool.sol";
import { ISNXFlashLoanTool } from "@snx-flash-tool/contracts/contracts/interfaces/ISNXFlashLoanTool.sol";

```

### JavaScript

You can import the contract addresses from `@snx-flash-tool/contracts/constants` and the Typechain contract interfaces from `@snx-flash-tool/contracts/types`:

```typescript
import { addresses } from "@snx-flash-tool/contracts/constants";
import {
  SNXFlashLoanTool,
  SNXFlashLoanTool__factory,
  ISNXFlashLoanTool,
  ISNXFlashLoanTool__factory,
} from "@snx-flash-tool/contracts/types";
const chainId = 1;
const address = addresses[chainId].snxFlashTool;
// JavaScript
const snxFlashLoanTool = SNXFlashLoanTool__factory.connect(
  address,
  provider /* ethers.js provider */
);
// TypeScript
const snxFlashLoanTool: SNXFlashLoanTool = SNXFlashLoanTool__factory.connect(
  address,
  provider /* ethers.js provider */
);
```

You can import the contract artifacts from `@snx-flash-tool/contracts/artifacts/contracts`:

```javascript
import SNXFlashLoanTool from "@snx-flash-tool/contracts/artifacts/contracts/SNXFlashLoanTool.sol/SNXFlashLoanTool.json";
const abi = SNXFlashLoanTool.abi;
const bytecode = SNXFlashLoanTool.bytecode;
```

## Documentation

### `SNXFlashLoanTool`

- [Contract](./packages/contracts/contracts/SNXFlashLoanTool.sol)
- [Interface](./packages/contracts/contracts/interfaces/ISNXFlashLoanTool.sol)

The `burn` function allows SNX to be swapped for sUSD on an approved DEX. The mainnet deployment has approved the [1inch AggregationRouterV3 contract address](https://etherscan.io/address/0x11111112542d85b3ef69ae05771c2dccff4faa26). A swap is done by passing the `exchangeData` (calldata to call contract with, for swap) parameter to the `burn` function. Before calling the `burn` function you can fetch the [swap data from the 1inch API](https://docs.1inch.io/api/quote-swap#swap): [`https://api.1inch.exchange/v3.0/1/swap?fromTokenAddress=0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F&toTokenAddress=0x57Ab1ec28D129707052df4dF418D58a2D46d5f51&amount=11980809705297140381&disableEstimate=true&fromAddress=0x8A2BCd334f557f4654855A8da34142f271C0021C&slippage=1`](https://api.1inch.exchange/v3.0/1/swap?fromTokenAddress=0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F&toTokenAddress=0x57Ab1ec28D129707052df4dF418D58a2D46d5f51&amount=11980809705297140381&disableEstimate=true&fromAddress=0x8A2BCd334f557f4654855A8da34142f271C0021C&slippage=1) (swap 11.9 SNX to sUSD with a slippage of 1%). This will return an object `data` containing the swap data. You can then call `burn` with `data.tx.data` for `exchangeData`.

To burn all sUSD debt, call `burn` with the `sUSDAmount` parameter set to the maximum value representable by the `uint256` type. In Solidity this is `type(uint256).max`, in ethers.js this is `ethers.constants.MaxUint256`.

The caller of the `burn` function must approve the contract to burn sUSD on the callers behalf. This can be done by calling [`approveBurnOnBehalf`](https://docs.synthetix.io/contracts/source/contracts/DelegateApprovals/#approveburnonbehalf) on the [`DelegateApprovals`](https://docs.synthetix.io/contracts/source/contracts/DelegateApprovals/) contract. The caller must also approve `snxAmount` of SNX to be spent by the contract. Both of these must be done before calling the contract.

- Solidity
  ```solidity
  IDelegateApprovals(delegateApprovals).approveBurnOnBehalf(snxFlashLoanTool);
  IERC20(snx).approve(snxFlashLoanTool, snxAmount);
  // If burning specified amount of sUSD debt
  ISNXFlashLoanTool(snxFlashLoanTool).burn(sUSDAmount, snxAmount, exchangeData);
  // If burning all sUSD debt
  ISNXFlashLoanTool(snxFlashLoanTool).burn(type(uint256).max, snxAmount, exchangeData);
  ```
- JavaScript
  ```javascript
  const data = await fetch(
    `https://api.1inch.exchange/v3.0/1/swap?fromTokenAddress=0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F&toTokenAddress=0x57Ab1ec28D129707052df4dF418D58a2D46d5f51&amount=${snxAmount.toString()}&disableEstimate=true&fromAddress=${
      snxFlashLoanTool.address
    }&slippage=${slippage}`
  ).then((r) => r.json());
  await delegateApprovals.approveBurnOnBehalf(snxFlashLoanTool.address);
  await snx.approve(snxFlashLoanTool.address, snxAmount);
  // If burning specified amount of sUSD debt
  await snxFlashLoanTool.burn(sUSDAmount, snxAmount, data.tx.to, data.tx.data);
  // If burning all sUSD debt
  await snxFlashLoanTool.burn(
    ethers.constants.MaxUint256,
    snxAmount,
    data.tx.data
  );
  ```

Note that the fee to flash loan on Aave V2 is 0.09%, so you must specify an `snxAmount` high enough to swap to `sUSDAmount * 1.0009`.

## Development

### Directory Structure

- [`packages`](./packages): Contains all the typescript packages and contracts
  - [`contracts`](./packages/contracts): Solidity smart contracts for the tool
  - [`interface`](./packages/interface): Web interface for interacting with the contracts

### Dependencies

- [Git](https://git-scm.com/downloads)
- [Node.js](https://nodejs.org/en/download/)
- [Yarn](https://classic.yarnpkg.com/en/docs/install)

### Environment variables

The environment variable `ALCHEMY_API_KEY` must be set to an [Alchemy](https://www.alchemy.com/) mainnet key before development. For example:

```bash
export ALCHEMY_API_KEY=En1...
```

Optionally, to enable non-mainnet deployments of the contracts and Infura support on the interface, set `INFURA_ID` and `NEXT_PUBLIC_INFURA_ID` (e.g. `da68...`). `INFURA_ID` is for the contracts, `NEXT_PUBLIC_INFURA_ID` is for the interface. `INFURA_ID` and `NEXT_PUBLIC_INFURA_ID` can use the same value.

Optional environment variables:

- `PRIVATE_KEY` Private key (with the `0x` in the beginning removed) to deploy contracts
- `COINMARKETCAP` [CoinMarketCap](https://coinmarketcap.com/api/) API key to view gas costs in USD
- `ETHERSCAN` [Etherscan](https://etherscan.io/apis) API key to verify deployed contracts on Etherscan
- `NEXT_PUBLIC_SITE_URL` (e.g. `https://flashburn.gcubed.io/`) For improving HTML metadata

### Setup

Clone the repository, open it, and install Node.js packages with `yarn`:

```bash
git clone https://github.com/snxgrants/flashburn.git
cd flashburn
yarn install
```

### Building the TypeScript packages

To build all of the [TypeScript packages](./packages), run:

```bash
yarn build
```

To build the [contracts](./packages/contracts), run:

```bash
yarn build:contracts
```

To build the [interface](./packages/interface), run:

```bash
yarn build:interface
```

### Running tests

To run unit tests for the [contracts](./packages/contracts), run:

```bash
yarn test:contracts
```

### Run the development server

To run the development server for the [interface](./packages/interface), run:

```bash
yarn dev:interface
```

### Formatting and linting

To format all of the [TypeScript packages](./packages), run:

```bash
yarn prettier
```

To lint all of the [TypeScript packages](./packages), run:

```bash
yarn lint
```

### Cleaning

To clean the compiled [contracts](./packages/contracts), run:

```bash
yarn clean:contracts
```

### Local deployment

A Hardhat node must be started before deploying locally:

```bash
yarn evm:contracts
```

Then you can deploy the contracts:

```bash
yarn migrate:contracts --network localhost
```

## Deployment

Before deploying contracts to mainnet you must set the `ALCHEMY_API_KEY` and `PRIVATE_KEY` environment variable. To deploy on other networks you must set an `INFURA_ID` and replace mainnet with the network name:

```
yarn migrate:contracts --network mainnet
```

To deploy the interface you must use `yarn build` as the build command, and the output directory will be `packages/interface/.next`. The environment variable `NEXT_PUBLIC_INFURA_ID` can be set for enabling WalletConnect support, and `NEXT_PUBLIC_SITE_URL` can be set for improving metadata in the HTML head.
