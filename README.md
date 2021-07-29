# SNX Flash Tool - Burn sUSD Debt with Staked SNX

![CI](https://github.com/gg2001/snx-flash-tool/workflows/CI/badge.svg)

This monorepo contains the smart contracts and interface for the SNX Flash Tool.

## Description

SNX Flash Tool allows you to burn your sUSD debt using staked SNX. Stakers who are low on liquidity or unable to acquire sUSD can use this tool to sell off their SNX and pay off their sUSD debt in 1 transaction.

The smart contract works by taking a sUSD flash loan from Aave V2 to burn a specified amount of the users sUSD debt. In doing so, the users SNX unstakes and becomes transferrable. The contract transfers the SNX from the user, then sells it on a specified DEX (e.g. 1inch) for sUSD to pay back the flash loan.

## Documentation

### [`SNXFlashLoanTool`](packages/contracts/contracts/SNXFlashLoanTool.sol) contract

- [Contract](packages/contracts/contracts/SNXFlashLoanTool.sol)
- [Interface](packages/contracts/contracts/interfaces/ISNXFlashLoanTool.sol)

To burn all sUSD debt, call `burn` with the `sUSDAmount` parameter set to the maximum value representable by the `uint256` type. In Solidity this is `type(uint256).max`, in ethers.js this is `ethers.constants.MaxUint256`.

The caller of the `burn` function must approve the contract to burn sUSD on the callers behalf. This can be done by calling [`approveBurnOnBehalf`](https://docs.synthetix.io/contracts/source/contracts/DelegateApprovals/#approveburnonbehalf) on the [`DelegateApprovals`](https://docs.synthetix.io/contracts/source/contracts/DelegateApprovals/) contract. The caller must also approve `snxAmount` of SNX to be spent by the contract. Both of these must be done before calling the contract.

- Solidity:
  ```
  IDelegateApprovals(delegateApprovals).approveBurnOnBehalf(address(snxFlashLoanTool));
  IERC20(snx).approve(address(snxFlashLoanTool), snxAmount);
  ```
- JavaScript:
  ```
  await delegateApprovals.approveBurnOnBehalf(snxFlashLoanTool.address);
  await snx.approve(snxFlashLoanTool.address, snxAmount);
  ```

## Directory Structure

- [`packages`](./packages): Contains all the typescript packages and contracts
  - [`contracts`](./packages/contracts): Solidity smart contracts for the tool
  - [`interface`](./packages/interface): Web interface for interacting with the contracts
