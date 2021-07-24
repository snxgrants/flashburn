import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "./tasks/clean";

const ALCHEMY_MAINNET: string = `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`;

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      forking: {
        url: ALCHEMY_MAINNET,
        blockNumber: 12887443,
      },
      chainId: 1337,
    },
    mainnet: {
      url: ALCHEMY_MAINNET,
    },
  },
  solidity: {
    version: "0.7.6",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  mocha: {
    timeout: 600000,
  },
  typechain: {
    outDir: "types/typechain",
    target: "ethers-v5",
  },
};

if (process.env.PRIVATE_KEY && config.networks && config.networks.mainnet) {
  config.networks.mainnet.accounts = [`0x${process.env.PRIVATE_KEY}`];
}

if (process.env.COINMARKETCAP) {
  config.gasReporter = {
    currency: "USD",
    gasPrice: 15,
    coinmarketcap: process.env.COINMARKETCAP,
  };
}

if (process.env.ETHERSCAN) {
  config.etherscan = {
    apiKey: process.env.ETHERSCAN,
  };
}

export default config;
