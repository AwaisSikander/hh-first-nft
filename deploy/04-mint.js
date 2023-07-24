const { ethers, network } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deployer } = await getNamedAccounts()
    const signer = await ethers.getSigner(deployer)

    basicNftAddress = (await deployments.get("BasicNft")).address
    randomIpfsNftAddress = (await deployments.get("RandomIpfsNft")).address
    dynamicSvgNftAddress = (await deployments.get("DynamicSvgNft")).address

    // // Basic NFT
    // const basicNft = await ethers.getContractAt(
    //     "BasicNft",
    //     basicNftAddress,
    //     signer
    // )
    // const basicMintTx = await basicNft.mintNft()
    // await basicMintTx.wait(1)
    // console.log(`Basic NFT index 0 tokenURI: ${await basicNft.tokenURI(0)}`)
    // -----------------------------------------------------------------------------------------------------------------------------
    // Random IPFS NFT
    const randomIpfsNft = await ethers.getContractAt(
        "RandomIpfsNft",
        randomIpfsNftAddress,
        signer
    )
    const mintFee = await randomIpfsNft.getMintFee()
    const randomIpfsNftMintTx = await randomIpfsNft.requestNft({
        value: mintFee.toString(),
    })
    const randomIpfsNftMintTxReceipt = await randomIpfsNftMintTx.wait(1)

    // Need to listen for response
    await new Promise(async (resolve, reject) => {
        setTimeout(
            () => reject("Timeout: 'NFTMinted' event did not fire"),
            300000
        ) // 5 minute timeout time
        // setup listener for our event
        randomIpfsNft.once("NftMinted", async () => {
            console.log(
                `Random IPFS NFT index 0 tokenURI: ${await randomIpfsNft.tokenURI(
                    0
                )}`
            )
            resolve()
        })
        if (developmentChains.includes(network.name)) {
            const requestId =
                randomIpfsNftMintTxReceipt.events[1].args.requestId.toString()
            mockaddress = (await deployments.get("VRFCoordinatorV2Mock"))
                .address

            const vrfCoordinatorV2Mock = await ethers.getContractAt(
                "VRFCoordinatorV2Mock",
                mockaddress,
                signer
            )
            await vrfCoordinatorV2Mock.fulfillRandomWords(
                requestId,
                randomIpfsNft.address
            )
        }
    })
    console.log(
        `Random IPFS NFT index 0 token uri ${await randomIpfsNft.tokenURI(0)}`
    )
    // -----------------------------------------------------------------------------------------------------------------
    // Dynamic SVG  NFT
    // const highValue = ethers.utils.parseEther("4000")
    // const dynamicSvgNft = await ethers.getContractAt(
    //     "DynamicSvgNft",
    //     dynamicSvgNftAddress,
    //     signer
    // )
    // const dynamicSvgNftMintTx = await dynamicSvgNft.mintNft(highValue)
    // await dynamicSvgNftMintTx.wait(1)
    // console.log(
    //     `Dynamic SVG NFT index 0 tokenURI: ${await dynamicSvgNft.tokenURI(0)}`
    // )
}
module.exports.tags = ["all", "mint"]
