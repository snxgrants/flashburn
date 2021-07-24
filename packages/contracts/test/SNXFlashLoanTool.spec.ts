import { ethers, network, waffle } from "hardhat";
import { BigNumber, Signer, Wallet } from "ethers";
import { expect, use } from "chai";
import { snxFlashLoanToolFixture } from "./shared";
import { impersonateAddress, oneInchAddress, oneInchTrade0, oneInchTrade1 } from "../constants";

const { solidity, createFixtureLoader } = waffle;
use(solidity);
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
    it("should burn sUSD with SNX via 1inch", async () => {
      const { synthetix, snxFlashLoanTool, SNX, sUSD, sUSDDecimals, delegateApprovals } = await loadFixture(
        snxFlashLoanToolFixture,
      );
      const snxTransferrable: BigNumber = await synthetix.transferableSynthetix(impersonateAddress);
      await SNX.connect(impersonateAddressWallet).transfer(owner.address, snxTransferrable);
      const sUSDBalance: BigNumber = await sUSD.balanceOf(impersonateAddress);
      await sUSD.connect(impersonateAddressWallet).transfer(owner.address, sUSDBalance);

      const snxBalance0: BigNumber = await SNX.balanceOf(impersonateAddress);
      const sUSDBalance0: BigNumber = await sUSD.balanceOf(impersonateAddress);
      const sUSDDebtBalance0: BigNumber = await synthetix.debtBalanceOf(
        impersonateAddress,
        ethers.utils.formatBytes32String("sUSD"),
      );

      const sUSDAmount = BigNumber.from("100000000000000000000");
      const snxAmount = BigNumber.from("11980809705297140381");
      await SNX.connect(impersonateAddressWallet).approve(snxFlashLoanTool.address, snxAmount);
      await delegateApprovals.connect(impersonateAddressWallet).approveBurnOnBehalf(snxFlashLoanTool.address);
      await expect(
        snxFlashLoanTool.connect(impersonateAddressWallet).burn(sUSDAmount, snxAmount, oneInchAddress, oneInchTrade0),
      )
        .to.emit(snxFlashLoanTool, "Burn")
        .withArgs(impersonateAddress, sUSDAmount, snxAmount);

      const snxBalance1: BigNumber = await SNX.balanceOf(impersonateAddress);
      const sUSDBalance1: BigNumber = await sUSD.balanceOf(impersonateAddress);
      const sUSDDebtBalance1: BigNumber = await synthetix.debtBalanceOf(
        impersonateAddress,
        ethers.utils.formatBytes32String("sUSD"),
      );
      expect(snxBalance1).to.be.lt(snxBalance0);
      expect(sUSDBalance1).to.be.gte(sUSDBalance0);
      const delta: BigNumber = ethers.utils.parseUnits("0.0001", sUSDDecimals);
      expect(sUSDDebtBalance0.sub(sUSDDebtBalance1)).to.be.closeTo(sUSDAmount, delta.toNumber());
    });

    it("should burn max sUSD with SNX via 1inch", async () => {
      const { synthetix, snxFlashLoanTool, SNX, sUSD, delegateApprovals } = await loadFixture(snxFlashLoanToolFixture);
      const snxTransferrable: BigNumber = await synthetix.transferableSynthetix(impersonateAddress);
      await SNX.connect(impersonateAddressWallet).transfer(owner.address, snxTransferrable);
      const sUSDBalance: BigNumber = await sUSD.balanceOf(impersonateAddress);
      await sUSD.connect(impersonateAddressWallet).transfer(owner.address, sUSDBalance);

      const snxBalance0: BigNumber = await SNX.balanceOf(impersonateAddress);
      const sUSDBalance0: BigNumber = await sUSD.balanceOf(impersonateAddress);
      const sUSDDebtBalance0: BigNumber = await synthetix.debtBalanceOf(
        impersonateAddress,
        ethers.utils.formatBytes32String("sUSD"),
      );

      const sUSDAmount = ethers.constants.MaxUint256;
      const snxAmount = BigNumber.from("18048646982183153765");
      await SNX.connect(impersonateAddressWallet).approve(snxFlashLoanTool.address, snxAmount);
      await delegateApprovals.connect(impersonateAddressWallet).approveBurnOnBehalf(snxFlashLoanTool.address);
      await expect(
        snxFlashLoanTool.connect(impersonateAddressWallet).burn(sUSDAmount, snxAmount, oneInchAddress, oneInchTrade1),
      )
        .to.emit(snxFlashLoanTool, "Burn")
        .withArgs(impersonateAddress, sUSDDebtBalance0, snxAmount);

      const snxBalance1: BigNumber = await SNX.balanceOf(impersonateAddress);
      const sUSDBalance1: BigNumber = await sUSD.balanceOf(impersonateAddress);
      const sUSDDebtBalance1: BigNumber = await synthetix.debtBalanceOf(
        impersonateAddress,
        ethers.utils.formatBytes32String("sUSD"),
      );
      expect(snxBalance1).to.be.lt(snxBalance0);
      expect(sUSDBalance1).to.be.gte(sUSDBalance0);
      expect(sUSDDebtBalance1).to.equal(BigNumber.from("0"));
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

    it("should revert if flash loan is reentrant", async () => {
      const { lendingPool, snxFlashLoanTool, SNX, snxDecimals, sUSD, sUSDDecimals, delegateApprovals } =
        await loadFixture(snxFlashLoanToolFixture);
      const snxAmount = ethers.utils.parseUnits("1", snxDecimals);
      const sUSDAmount = ethers.utils.parseUnits("1", sUSDDecimals);
      await SNX.connect(impersonateAddressWallet).approve(snxFlashLoanTool.address, snxAmount);
      await delegateApprovals.connect(impersonateAddressWallet).approveBurnOnBehalf(snxFlashLoanTool.address);
      await expect(
        snxFlashLoanTool
          .connect(impersonateAddressWallet)
          .burn(
            sUSDAmount,
            snxAmount,
            lendingPool.address,
            lendingPool.interface.encodeFunctionData("flashLoan", [
              snxFlashLoanTool.address,
              [sUSD.address],
              [sUSDAmount],
              [0],
              snxFlashLoanTool.address,
              "0x",
              0,
            ]),
          ),
      ).to.be.revertedWith("SNXFlashLoanTool: Swap failed");
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
