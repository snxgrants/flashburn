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
    it("should burn sUSD with SNX", async () => {
      const { synthetix, snxFlashLoanTool, SNX, delegateApprovals } = await loadFixture(snxFlashLoanToolFixture);
      const snxAmount = BigNumber.from("11366004710098787245");
      const sUSDAmount = BigNumber.from("99073034504547801217");
      console.log(
        (await synthetix.transferableSynthetix(impersonateAddress)).toString(),
        (await synthetix.debtBalanceOf(impersonateAddress, ethers.utils.formatBytes32String("sUSD"))).toString(),
      );
      await SNX.connect(impersonateAddressWallet).approve(snxFlashLoanTool.address, snxAmount);
      await delegateApprovals.connect(impersonateAddressWallet).approveBurnOnBehalf(snxFlashLoanTool.address);
      // https://api.0x.org/swap/v1/quote?sellToken=0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F&buyToken=0x57Ab1ec28D129707052df4dF418D58a2D46d5f51&buyAmount=101000000000000000000&slippagePercentage=1
      await snxFlashLoanTool
        .connect(impersonateAddressWallet)
        .burn(
          sUSDAmount,
          snxAmount,
          "0x11111112542d85b3ef69ae05771c2dccff4faa26",
          "0x2e95b6c8000000000000000000000000c011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f0000000000000000000000000000000000000000000000009dbc29106cdadbad000000000000000000000000000000000000000000000004d56c4ff9313b2fa70000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000000200000000000000003b6d034043ae24960e5534731fc831386c07755a2dc33d4780000000000000003b6d0340f1f85b2c54a2bd284b1cf4141d64fd171bd85539",
        );
      console.log(
        (await synthetix.transferableSynthetix(impersonateAddress)).toString(),
        (await synthetix.debtBalanceOf(impersonateAddress, ethers.utils.formatBytes32String("sUSD"))).toString(),
      );
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
