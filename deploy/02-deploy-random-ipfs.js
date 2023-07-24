const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { network, ethers } = require("hardhat")
const { verify } = require("../utils/verify")
require("dotenv").config()
const {
    storeImages,
    storeTokenUriMetadata,
} = require("../utils/uploadToPinata")

const imagesLocation = "./images/randomNft"
const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            trait_type: "Cuteness",
            value: "100",
        },
    ],
}

let tokenUris = [
    "ipfs://QmdbBAgRLkZCg973i71TMmnKk77DxEo5cKVsrjkLE2c1GS",
    "ipfs://QmUja33YDHgTVKv7GWUh9sLzRSYP7mFtYFuqHKQ3yNeqp6",
    "ipfs://QmS12u1GB4wTWcHfPnPMBY1UjuP4cQ2n6DWN9nSgsRGGNr",
]

const FUND_AMOUNT = "1000000000000000000"

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const signer = await ethers.getSigner(deployer)

    const chainId = network.config.chainId

    if (process.env.UPLOAD_TO_PINATA == "true") {
        tokenUris = await handleTokenUis()
    }

    let vrfCoordinatorV2Address, subscriptionId, vrfCoordinatorV2Mock

    if (developmentChains.includes(network.name)) {
        const mockAddress = (await deployments.get("VRFCoordinatorV2Mock"))
            .address
        vrfCoordinatorV2Mock = await ethers.getContractAt(
            "VRFCoordinatorV2Mock",
            mockAddress,
            signer
        )

        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address

        const tx = await vrfCoordinatorV2Mock.createSubscription()
        const txReipt = await tx.wait(1)
        subscriptionId = txReipt.events[0].args.subId
        vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT)
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2
        subscriptionId = networkConfig[chainId].subscriptionId
    }

    log("----------------------------------------------------")
    const args = [
        vrfCoordinatorV2Address,
        subscriptionId,
        networkConfig[chainId].gasLane,
        networkConfig[chainId].mintFee,
        networkConfig[chainId].callbackGasLimit,
        tokenUris,
    ]
    log("----------Deploying---RandomIpfsNft-------------------------")

    const randomIpfsNft = await deploy("RandomIpfsNft", {
        from: deployer,
        args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log("-------------------------Deployed---------------------------")

    if (chainId == 31337) {
        await vrfCoordinatorV2Mock.addConsumer(
            subscriptionId,
            randomIpfsNft.address
        )
    }

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        log("Verifing.....")
        verify(randomIpfsNft.address, args)
        log("Verified...........")
    }
}

async function handleTokenUis() {
    let tokenUris = []

    const { responses: imageUpLoadResponses, files } = await storeImages(
        imagesLocation
    )

    for (imageUploadIndex in imageUpLoadResponses) {
        // create metadata
        // upload meta data
        let tokenUriMetadata = { ...metadataTemplate }
        tokenUriMetadata.name = files[imageUploadIndex].replace(".pmg", "")
        tokenUriMetadata.description = `An Adorable ${tokenUriMetadata.name} pup!`
        tokenUriMetadata.image = `ipfs://${imageUpLoadResponses[imageUploadIndex].IpfsHash}`
        console.log(`Uploading ${tokenUriMetadata.name}...`)
        // Store JSON to pinata / IPFS
        const metadataUploadResponse = await storeTokenUriMetadata(
            tokenUriMetadata
        )
        tokenUris.push(`ipfs://${metadataUploadResponse.IpfsHash}`)
    }
    console.log("Token Uris uploaded! they are :")
    console.log(tokenUris)
    return tokenUris
}

module.exports.tags = ["all", "randomipfs", "main"]
