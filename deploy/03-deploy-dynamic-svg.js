const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { network, ethers } = require("hardhat")
const { verify } = require("../utils/verify")
require("dotenv").config()
const fs = require("fs")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const signer = await ethers.getSigner(deployer)
    const chainId = network.config.chainId
    let ethUsdPriceFeedAddress

    if (developmentChains.includes(network.name)) {
        ethUsdPriceFeedAddress = (await deployments.get("MockV3Aggregator"))
            .address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed
    }

    const lowSVG = fs.readFileSync("./images/dynamicNft/frown.svg", {
        encoding: "utf8",
    })
    const highSVG = fs.readFileSync("./images/dynamicNft/happy.svg", {
        encoding: "utf8",
    })

    const args = [ethUsdPriceFeedAddress, lowSVG, highSVG]
    log("Deploying DynamicSvg...")

    const dynamicSvgNft = await deploy("DynamicSvgNft", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log("Deployed DynamicSvg...", dynamicSvgNft.address)

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        log("Verifying...")
        await verify(dynamicSvgNft.address, args)
    }
}
module.exports.tags = ["all", "dynamicsvg", "main"]
