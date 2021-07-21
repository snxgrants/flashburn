// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.7.6;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IAddressResolver } from "synthetix/contracts/interfaces/IAddressResolver.sol";
import { ISynthetix } from "synthetix/contracts/interfaces/ISynthetix.sol";
import { ISNXFlashLoanTool } from "./interfaces/ISNXFlashLoanTool.sol";
import { IFlashLoanReceiver } from "./interfaces/IFlashLoanReceiver.sol";
import { ILendingPoolAddressesProvider } from "./interfaces/ILendingPoolAddressesProvider.sol";
import { ILendingPool } from "./interfaces/ILendingPool.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import { SafeMath } from "@openzeppelin/contracts/math/SafeMath.sol";

/// @author Ganesh Gautham Elango
/// @title Burn sUSD debt with SNX using a flash loan
contract SNXFlashLoanTool is ISNXFlashLoanTool, IFlashLoanReceiver, Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    /// @dev Synthetix AddressResolver contract
    IAddressResolver public immutable synthetixResolver;
    /// @dev Synthetix address
    address public immutable synthetix;
    /// @dev sUSD address
    address public immutable sUSD;
    /// @dev Aave LendingPoolAddressesProvider contract
    ILendingPoolAddressesProvider public immutable override ADDRESSES_PROVIDER;
    /// @dev Aave LendingPool contract
    ILendingPool public immutable override LENDING_POOL;
    /// @dev Aave LendingPool referral code
    uint16 public constant referralCode = 185;
    /// @dev Lock in order to prevent a reentrancy attack
    bool public lock = false;

    /// @dev Constructor
    /// @param _snxResolver Synthetix AddressResolver address
    /// @param _provider Aave LendingPoolAddressesProvider address
    constructor(address _snxResolver, address _provider) {
        IAddressResolver snxResolver = IAddressResolver(_snxResolver);
        synthetixResolver = snxResolver;
        synthetix = snxResolver.getAddress("Synthetix");
        sUSD = snxResolver.getSynth("sUSD");
        ILendingPoolAddressesProvider provider = ILendingPoolAddressesProvider(_provider);
        ADDRESSES_PROVIDER = provider;
        LENDING_POOL = ILendingPool(provider.getLendingPool());
    }

    /// @notice Burn sUSD debt with SNX using a flash loan
    /// @dev To burn all sUSD debt, pass in type(uint256).max for sUSDAmount
    /// @param sUSDAmount Amount of sUSD debt to burn (set to type(uint256).max to burn all debt)
    /// @param snxAmount Amount of SNX to sell in order to burn sUSD debt
    /// @param exchange Exchange address to swap on
    /// @param exchangeData Calldata to call exchange with
    function burn(
        uint256 sUSDAmount,
        uint256 snxAmount,
        address exchange,
        bytes calldata exchangeData
    ) external override {
        address[] memory assets = new address[](1);
        assets[0] = sUSD;
        uint256[] memory amounts = new uint256[](1);
        // If sUSDAmount is max, get the sUSD debt of the user, otherwise just use sUSDAmount
        amounts[0] = sUSDAmount == type(uint256).max
            ? ISynthetix(synthetix).debtBalanceOf(msg.sender, "sUSD")
            : sUSDAmount;
        uint256[] memory modes = new uint256[](0);
        modes[0] = 0;
        bytes memory data = abi.encode(snxAmount, msg.sender, exchange, exchangeData);
        // Initiate flash loan
        LENDING_POOL.flashLoan(address(this), assets, amounts, modes, address(this), data, referralCode);
    }

    /// @dev Aave flash loan callback. Receives the token amounts and gives it back + premiums.
    /// @param assets The addresses of the assets being flash-borrowed
    /// @param amounts The amounts amounts being flash-borrowed
    /// @param premiums Fees to be paid for each asset
    /// @param initiator The msg.sender to Aave
    /// @param params Arbitrary packed params to pass to the receiver as extra information
    function executeOperation(
        address[] calldata assets,
        uint256[] calldata amounts,
        uint256[] calldata premiums,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        require(msg.sender == address(LENDING_POOL), "SNXFlashLoanTool: Invalid msg.sender");
        require(initiator == address(this), "SNXFlashLoanTool: Invalid initiator");
        // Revert if contract is locked, to prevent a reentrancy attack
        require(!lock, "SNXFlashLoanTool: Must not reenter");
        (uint256 snxAmount, address user, address exchange, bytes memory exchangeData) = abi.decode(
            params,
            (uint256, address, address, bytes)
        );
        // Burn sUSD with flash loaned amount
        ISynthetix(synthetix).burnSynthsOnBehalf(user, amounts[0]);
        // Transfer specified SNX amount from user
        IERC20(synthetix).safeTransferFrom(user, address(this), snxAmount);
        // Swap SNX to sUSD on the specified DEX
        uint256 receivedSUSD = swap(snxAmount, synthetix, sUSD, exchange, exchangeData);
        uint256 amountOwing = amounts[0].add(premiums[0]);
        // Approve owed sUSD amount to Aave
        IERC20(sUSD).safeApprove(msg.sender, amountOwing);
        // If there is leftover sUSD on the contract, transfer it to the user
        if (amountOwing < receivedSUSD) {
            IERC20(sUSD).safeTransfer(user, receivedSUSD.sub(amountOwing));
        }
        return true;
    }

    /// @notice Transfer a tokens balance left on this contract to the owner
    /// @dev Can only be called by owner
    /// @param token Address of token to transfer the balance of (if Ether, pass in address(0))
    function transferToken(address token) external onlyOwner {
        if (token == address(0)) {
            msg.sender.transfer(address(this).balance);
        } else {
            IERC20(token).safeTransfer(msg.sender, IERC20(token).balanceOf(address(this)));
        }
    }

    /// @dev Swap token for token
    /// @param amount Amount of token0 to swap
    /// @param token0 Token to swap from
    /// @param token1 Token to swap to
    /// @param exchange Exchange address to swap on
    /// @param data Calldata to call exchange with
    /// @return token1 received from swap
    function swap(
        uint256 amount,
        address token0,
        address token1,
        address exchange,
        bytes memory data
    ) internal returns (uint256) {
        IERC20(token0).safeApprove(exchange, amount);
        // Lock contract during external calls to prevent a reentrancy attack
        lock = true;
        (bool success, ) = exchange.call(data);
        require(success, "CTokenSwap: Swap failed");
        // Unlock once the external call has completed
        lock = false;
        return IERC20(token1).balanceOf(address(this));
    }
}
