// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.7.6;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IAddressResolver } from "synthetix/contracts/interfaces/IAddressResolver.sol";
import { ISynthetix } from "synthetix/contracts/interfaces/ISynthetix.sol";
import { IFlashLoanReceiver } from "./interfaces/IFlashLoanReceiver.sol";
import { ILendingPoolAddressesProvider } from "./interfaces/ILendingPoolAddressesProvider.sol";
import { ILendingPool } from "./interfaces/ILendingPool.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import { SafeMath } from "@openzeppelin/contracts/math/SafeMath.sol";

contract SNXFlashLoanTool is IFlashLoanReceiver {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    IAddressResolver public immutable synthetixResolver;
    address public immutable synthetix;
    address public immutable sUSD;
    ILendingPoolAddressesProvider public immutable override ADDRESSES_PROVIDER;
    ILendingPool public immutable override LENDING_POOL;
    uint16 public constant referralCode = 185;
    bool public lock = false;

    constructor(address _snxResolver, address _provider) {
        IAddressResolver snxResolver = IAddressResolver(_snxResolver);
        synthetixResolver = snxResolver;
        synthetix = snxResolver.getAddress("Synthetix");
        sUSD = snxResolver.getSynth("sUSD");
        ILendingPoolAddressesProvider provider = ILendingPoolAddressesProvider(_provider);
        ADDRESSES_PROVIDER = provider;
        LENDING_POOL = ILendingPool(provider.getLendingPool());
    }

    function burn(
        uint256 sUSDAmount,
        uint256 snxAmount,
        address exchange,
        bytes calldata exchangeData
    ) external {
        address[] memory assets = new address[](1);
        assets[0] = sUSD;
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = sUSDAmount == type(uint256).max
            ? ISynthetix(synthetix).debtBalanceOf(msg.sender, "sUSD")
            : sUSDAmount;
        uint256[] memory modes = new uint256[](0);
        modes[0] = 0;
        bytes memory data = abi.encode(snxAmount, msg.sender, exchange, exchangeData);
        LENDING_POOL.flashLoan(address(this), assets, amounts, modes, address(this), data, referralCode);
    }

    function executeOperation(
        address[] calldata assets,
        uint256[] calldata amounts,
        uint256[] calldata premiums,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        require(msg.sender == address(LENDING_POOL), "SNXFlashLoanTool: Invalid msg.sender");
        require(initiator == address(this), "SNXFlashLoanTool: Invalid initiator");
        require(!lock, "SNXFlashLoanTool: Must not reenter");
        (uint256 snxAmount, address user, address exchange, bytes memory exchangeData) = abi.decode(
            params,
            (uint256, address, address, bytes)
        );
        ISynthetix(synthetix).burnSynthsOnBehalf(user, amounts[0]);
        IERC20(synthetix).safeTransferFrom(user, address(this), snxAmount);
        uint256 receivedSUSD = swap(snxAmount, synthetix, sUSD, exchange, exchangeData);
        uint256 amountOwing = amounts[0].add(premiums[0]);
        IERC20(sUSD).safeApprove(msg.sender, amountOwing);
        if (amountOwing < receivedSUSD) {
            IERC20(sUSD).safeTransfer(user, receivedSUSD.sub(amountOwing));
        }
        return true;
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
        lock = true;
        (bool success, ) = exchange.call(data);
        require(success, "CTokenSwap: Swap failed");
        lock = false;
        return IERC20(token1).balanceOf(address(this));
    }
}
