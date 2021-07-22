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
