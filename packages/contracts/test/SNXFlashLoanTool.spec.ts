import { ethers, network, waffle } from "hardhat";
import { BigNumber, Signer, Wallet } from "ethers";
import { expect } from "chai";
import { snxFlashLoanToolFixture } from "./shared";
import { impersonateAddress } from "../constants";

const { createFixtureLoader } = waffle;
let loadFixture: ReturnType<typeof createFixtureLoader>;

describe("unit/SNXFlashLoanTool", () => {
  let accounts: Signer[];
  let owner: Wallet;
  let impersonateAddressWallet: Wallet;

  before(async () => {
    accounts = await ethers.getSigners();
    owner = <Wallet>accounts[0];
    const impersonateAddressSigner: Signer = await ethers.provider.getSigner(impersonateAddress);
    impersonateAddressWallet = <Wallet>impersonateAddressSigner;
    loadFixture = createFixtureLoader([owner, impersonateAddressWallet], waffle.provider);
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [impersonateAddress],
    });
  });

  after(async () => {
    await network.provider.request({
      method: "hardhat_stopImpersonatingAccount",
      params: [impersonateAddress],
    });
  });

  describe("constructor", async () => {
    it("should set synthetixResolver", async () => {
      const { snxFlashLoanTool, synthetixResolver } = await loadFixture(snxFlashLoanToolFixture);
      const getSynthetixResolver: string = await snxFlashLoanTool.synthetixResolver();
      expect(getSynthetixResolver).to.equal(synthetixResolver.address);
    });

    it("should set synthetix", async () => {
      const { snxFlashLoanTool, synthetix } = await loadFixture(snxFlashLoanToolFixture);
      const getSynthetix: string = await snxFlashLoanTool.synthetix();
      expect(getSynthetix).to.equal(synthetix.address);
    });

    it("should set sUSD", async () => {
      const { snxFlashLoanTool, sUSD, sUSDToken } = await loadFixture(snxFlashLoanToolFixture);
      const getSUSD: string = await snxFlashLoanTool.sUSD();
      expect(getSUSD).to.equal(sUSD.address);
      expect(getSUSD).to.equal(sUSDToken.address);
    });

    it("should set ADDRESSES_PROVIDER", async () => {
      const { snxFlashLoanTool, addressesProvider } = await loadFixture(snxFlashLoanToolFixture);
      const getAddressesProvider: string = await snxFlashLoanTool.ADDRESSES_PROVIDER();
      expect(getAddressesProvider).to.equal(addressesProvider.address);
    });

    it("should set LENDING_POOL", async () => {
      const { snxFlashLoanTool, lendingPool } = await loadFixture(snxFlashLoanToolFixture);
      const getLendingPool: string = await snxFlashLoanTool.LENDING_POOL();
      expect(getLendingPool).to.equal(lendingPool.address);
    });
  });

  describe("burn", async () => {
    // it("should burn sUSD with SNX", async () => {
    //   const { snxFlashLoanTool, synthetixToken, delegateApprovals } = await loadFixture(snxFlashLoanToolFixture);
    //   const snxAmount = BigNumber.from("133414659859748271293838");
    //   const sUSDAmount = BigNumber.from("15062318741654064773782");
    //   await synthetixToken.connect(impersonateAddressWallet).approve(snxFlashLoanTool.address, snxAmount);
    //   await delegateApprovals.connect(impersonateAddressWallet).approveBurnOnBehalf(snxFlashLoanTool.address);
    //   await snxFlashLoanTool.burn(
    //     sUSDAmount,
    //     snxAmount,
    //     "0xdef1c0ded9bec7f1a1670819833240f027b25eff",
    //     "0x415565b0000000000000000000000000c011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f00000000000000000000000057ab1ec28d129707052df4df418d58a2d46d5f5100000000000000000000000000000000000000000000036151ac238b8aceba96000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000003c0000000000000000000000000000000000000000000000000000000000000074000000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000002c000000000000000000000000000000000000000000000000000000000000002c000000000000000000000000000000000000000000000000000000000000002a000000000000000000000000000000000000000000000036151ac238b8aceba96000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000025368696261537761700000000000000000000000000000000000000000000000000000000000036151ac238b8aceba960000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000003f7724180aa6b939894b5ca4314783b0b36b32900000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000002000000000000000000000000c011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000032000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc200000000000000000000000057ab1ec28d129707052df4df418d58a2d46d5f51000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000002e000000000000000000000000000000000000000000000000000000000000002e000000000000000000000000000000000000000000000000000000000000002c0ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000012556e6973776170563300000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000c0000000000000000000000000e592427a0aece92de3edee1f18e0157c0586156400000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000042c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20001f4a0b86991c6218b36c1d19d4a2e9eb0ce3606eb480001f457ab1ec28d129707052df4df418d58a2d46d5f51000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000007000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000004000000000000000000000000c011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f00000000000000000000000057ab1ec28d129707052df4df418d58a2d46d5f51000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000000000000000000000000000000000000000000000869584cd000000000000000000000000100000000000000000000000000000000000001100000000000000000000000000000000000000000000006f72fd2aaf60f8bf68",
    //   );
    // });
  });

  describe("executeOperation", async () => {
    it("should revert if not lending pool", async () => {
      const { snxFlashLoanTool } = await loadFixture(snxFlashLoanToolFixture);
      await expect(
        snxFlashLoanTool
          .connect(impersonateAddressWallet)
          .executeOperation([], [], [], ethers.constants.AddressZero, "0x"),
      ).to.be.revertedWith("SNXFlashLoanTool: Invalid msg.sender");
    });

    // it("should revert if initiator is not contract", async () => {
    //   const { snxFlashLoanTool, sUSD, sUSDDecimals, lendingPool } = await loadFixture(snxFlashLoanToolFixture);
    //   const sUSDTransferAmount: BigNumber = ethers.utils.parseUnits("100", sUSDDecimals);
    //   await expect(
    //     lendingPool
    //       .connect(impersonateAddressWallet)
    //       .flashLoan(
    //         snxFlashLoanTool.address,
    //         [sUSD.address],
    //         [sUSDTransferAmount],
    //         [0],
    //         snxFlashLoanTool.address,
    //         "0x",
    //         0,
    //       ),
    //   ).to.be.revertedWith("SNXFlashLoanTool: Invalid initiator");
    // });
  });

  describe("transferToken", async () => {
    it("should revert if not owner", async () => {
      const { snxFlashLoanTool } = await loadFixture(snxFlashLoanToolFixture);
      await expect(
        snxFlashLoanTool.connect(impersonateAddressWallet).transferToken(ethers.constants.AddressZero),
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should transfer token", async () => {
      const { snxFlashLoanTool, sUSDToken, sUSDDecimals } = await loadFixture(snxFlashLoanToolFixture);
      const sUSDTransferAmount: BigNumber = ethers.utils.parseUnits("100", sUSDDecimals);
      await sUSDToken.connect(impersonateAddressWallet).transfer(snxFlashLoanTool.address, sUSDTransferAmount);

      const sUSDBalanceCTokenSwap0: BigNumber = await sUSDToken.balanceOf(snxFlashLoanTool.address);
      expect(sUSDBalanceCTokenSwap0).to.equal(sUSDTransferAmount);
      const sUSDBalanceOwner0: BigNumber = await sUSDToken.balanceOf(owner.address);

      await snxFlashLoanTool.connect(owner).transferToken(sUSDToken.address);

      const sUSDBalanceCTokenSwap1: BigNumber = await sUSDToken.balanceOf(snxFlashLoanTool.address);
      expect(sUSDBalanceCTokenSwap1).to.equal(BigNumber.from("0"));
      const sUSDBalanceOwner1: BigNumber = await sUSDToken.balanceOf(owner.address);
      expect(sUSDBalanceOwner1).to.equal(sUSDBalanceOwner0.add(sUSDTransferAmount));
    });
  });
});
