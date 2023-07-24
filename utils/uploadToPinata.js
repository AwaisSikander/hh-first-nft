const pinataSdk = require("@pinata/sdk")
const path = require("path")
const fs = require("fs")
require("dotenv").config()

const PINATA_API_KEY = process.env.PINATA_API_KEY
const PINATA_API_SECRET = process.env.PINATA_API_SECRET

const pinata = new pinataSdk({
    pinataApiKey: PINATA_API_KEY,
    pinataSecretApiKey: PINATA_API_SECRET,
})

async function storeImages(imagesFilePath) {
    const fullImagesPath = path.resolve(imagesFilePath)
    const files = fs.readdirSync(fullImagesPath)
    let responses = []
    console.log("Uploading to pinata")

    for (fileIndex in files) {
        console.log("Uploading to pinata file index # ", fileIndex)
        const options = {
            pinataMetadata: {
                name: files[fileIndex],
            },
        }
        const readableStreamForFiles = fs.createReadStream(
            `${fullImagesPath}/${files[fileIndex]}`
        )
        try {
            const response = await pinata.pinFileToIPFS(
                readableStreamForFiles,
                options
            )
            responses.push(response)
        } catch (e) {
            console.error(e)
        }
    }
    return { responses, files }
}

async function storeTokenUriMetadata(metadata) {
    try {
        const response = await pinata.pinJSONToIPFS(metadata)
        return response
    } catch (e) {
        console.log(e)
    }
    return null
}

module.exports = { storeImages, storeTokenUriMetadata }
