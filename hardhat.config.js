require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("@nomiclabs/hardhat-ethers")
require("hardhat-deploy")
// require("solidity-coverage")
require("hardhat-gas-reporter")
require("hardhat-contract-sizer")
require("dotenv").config()
// require("@nomiclabs/hardhat-waffle")
// require("@nomiclabs/hardhat-etherscan")
// require("hardhat-deploy")
// // require("@nomicfoundation/hardhat-toolbox")
// require("@nomiclabs/hardhat-solhint")
// require("hardhat-deploy")
// require("@nomiclabs/hardhat-ethers")
// require("@nomicfoundation/hardhat-chai-matchers")
/** @type import('hardhat/config').HardhatUserConfig */
const tdly = require("@tenderly/hardhat-tenderly")
tdly.setup()

require("dotenv").config()

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const COIN_MARKET_CAP_API = process.env.COIN_MARKET_CAP_API
const MAIN_NET_RPC_URL = process.env.MAIN_NET_RPC_URL

module.exports = {
    // solidity: "0.8.8",
    solidity: {
        compilers: [
            { version: "0.8.7" },
            { version: "0.8.8" },
            { version: "0.6.6" },
            { version: "0.6.12" },
            { version: "0.4.19" },
        ],
    },
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            forking: {
                // url: SEPOLIA_RPC_URL,
                url: "https://rpc.tenderly.co/fork/1e65fd36-2a38-4dd2-842c-fd6b9fc57db9",
            },
            debug: {
                revertStrings: "all",
            },
            // gasPrice: 130000000000,
        },
        sepolia: {
            url: SEPOLIA_RPC_URL,
            // url: "https://rpc.tenderly.co/fork/1e65fd36-2a38-4dd2-842c-fd6b9fc57db9",
            accounts: [PRIVATE_KEY],
            // accounts: {
            //     mnemonic:
            //         "erosion figure viable giraffe post peace review inform echo conduct cute wheel", // Replace with your MetaMask mnemonic phrase
            // },
            chainId: 11155111,
            blockConfirmations: 6,
        },
    },
    etherscan: {
        // Your API key for Etherscan
        // Obtain one at https://etherscan.io/
        apiKey: ETHERSCAN_API_KEY,
    },
    namedAccounts: {
        deployer: {
            default: 0, // here this will by default take the first account as deployer
            1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
        },
    },
    gasReporter: {
        enabled: false,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: COIN_MARKET_CAP_API,
        token: "ETH",
    },
}
