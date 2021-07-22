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
    it("should set synthetix", async () => {
      const { snxFlashLoanTool, synthetix } = await loadFixture(snxFlashLoanToolFixture);
      const getSynthetix: string = await snxFlashLoanTool.synthetix();
      expect(getSynthetix).to.equal(synthetix.address);
    });

    it("should set SNX", async () => {
      const { snxFlashLoanTool, SNX } = await loadFixture(snxFlashLoanToolFixture);
      const getSNX: string = await snxFlashLoanTool.SNX();
      expect(getSNX).to.equal(SNX.address);
    });

    it("should set sUSD", async () => {
      const { snxFlashLoanTool, sUSD } = await loadFixture(snxFlashLoanToolFixture);
      const getSUSD: string = await snxFlashLoanTool.sUSD();
      expect(getSUSD).to.equal(sUSD.address);
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
    //   const { snxFlashLoanTool, SNX, delegateApprovals } = await loadFixture(snxFlashLoanToolFixture);
    //   const snxAmount = BigNumber.from("1410547409233276473878735");
    //   const sUSDAmount = BigNumber.from("245799795116289250050873");
    //   await SNX.connect(impersonateAddressWallet).approve(snxFlashLoanTool.address, snxAmount);
    //   await delegateApprovals.connect(impersonateAddressWallet).approveBurnOnBehalf(snxFlashLoanTool.address);
    //   await snxFlashLoanTool
    //     .connect(impersonateAddressWallet)
    //     .burn(
    //       ethers.constants.AddressZero,
    //       snxAmount,
    //       "0xdef1c0ded9bec7f1a1670819833240f027b25eff",
    //       "0x415565b0000000000000000000000000c011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f00000000000000000000000057ab1ec28d129707052df4df418d58a2d46d5f5100000000000000000000000000000000000000000000340cd5665b22e81c4339000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000300000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000420000000000000000000000000000000000000000000000000000000000000076000000000000000000000000000000000000000000000000000000000000000140000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000036000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000003200000000000000000000000000000000000000000000000000000000000000320000000000000000000000000000000000000000000000000000000000000030000000000000000000000000000000000000000000000340cd5665b22e81c43390000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000d42616e636f720000000000000000000000000000000000000000000000000000000000000000340cd5665b22e81c43390000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000001000000000000000000000000002f9ec37d6ccfff1cab21733bdadede11c823ccb000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000005000000000000000000000000c011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f000000000000000000000000adaa88ca9913f2d6f8caa0616ff01ee8d4223fde0000000000000000000000001f573d6fb3f13d689ff844b4ce37794d79a7ff1c000000000000000000000000874d8de5b26c9d9f6aa8d7bab283f9a9c6f777f4000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000014000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000002e000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb4800000000000000000000000057ab1ec28d129707052df4df418d58a2d46d5f51000000000000000000000000000000000000000000000000000000000000012000000000000000000000000000000000000000000000000000000000000002a000000000000000000000000000000000000000000000000000000000000002a00000000000000000000000000000000000000000000000000000000000000280ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000143757276650000000000000000000000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000080000000000000000000000000a5407eae9ba41422680e2e00537571bcc53efbfda6417ed60000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000003000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000007000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000001200000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000e00000000000000000000000000000000000000000000000000000000000000004000000000000000000000000c011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f00000000000000000000000057ab1ec28d129707052df4df418d58a2d46d5f51000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb480000000000000000000000000000000000000000000000000000000000000000869584cd000000000000000000000000100000000000000000000000000000000000001100000000000000000000000000000000000000000000009ea9bd5ded60f8dead",
    //     );
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

    it("should revert if initiator is not contract", async () => {
      const { snxFlashLoanTool, sUSD, sUSDDecimals, lendingPool } = await loadFixture(snxFlashLoanToolFixture);
      const sUSDTransferAmount: BigNumber = ethers.utils.parseUnits("100", sUSDDecimals);
      await expect(
        lendingPool
          .connect(owner)
          .flashLoan(
            snxFlashLoanTool.address,
            [sUSD.address],
            [sUSDTransferAmount],
            [0],
            snxFlashLoanTool.address,
            "0x",
            0,
          ),
      ).to.be.revertedWith("SNXFlashLoanTool: Invalid initiator");
    });
  });

  describe("transferToken", async () => {
    it("should revert if not owner", async () => {
      const { snxFlashLoanTool } = await loadFixture(snxFlashLoanToolFixture);
      await expect(
        snxFlashLoanTool.connect(impersonateAddressWallet).transferToken(ethers.constants.AddressZero),
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should transfer token", async () => {
      const { snxFlashLoanTool, sUSD, sUSDDecimals } = await loadFixture(snxFlashLoanToolFixture);
      const sUSDTransferAmount: BigNumber = ethers.utils.parseUnits("100", sUSDDecimals);
      await sUSD.connect(impersonateAddressWallet).transfer(snxFlashLoanTool.address, sUSDTransferAmount);

      const sUSDBalanceCTokenSwap0: BigNumber = await sUSD.balanceOf(snxFlashLoanTool.address);
      expect(sUSDBalanceCTokenSwap0).to.equal(sUSDTransferAmount);
      const sUSDBalanceOwner0: BigNumber = await sUSD.balanceOf(owner.address);

      await snxFlashLoanTool.connect(owner).transferToken(sUSD.address);

      const sUSDBalanceCTokenSwap1: BigNumber = await sUSD.balanceOf(snxFlashLoanTool.address);
      expect(sUSDBalanceCTokenSwap1).to.equal(BigNumber.from("0"));
      const sUSDBalanceOwner1: BigNumber = await sUSD.balanceOf(owner.address);
      expect(sUSDBalanceOwner1).to.equal(sUSDBalanceOwner0.add(sUSDTransferAmount));
    });
  });
});
