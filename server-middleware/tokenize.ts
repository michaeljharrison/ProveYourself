import { POI } from '../store/types'
const winston = require('winston')
const WINSTON_FORMAT = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp(),
  winston.format.align(),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...args } = info
    return `${timestamp} - [pdb.js] - [${level}]: ${message} \n${
      Object.keys(args).length ? JSON.stringify(args, null, 2) : ''
    }`
  })
)

const LOGGER = winston.createLogger({
  format: WINSTON_FORMAT,
  transports: [
    new winston.transports.Console({
      level: process.env.DEBUG_LEVEL || 'debug',
      json: true,
      colorize: true,
    }),
  ],
})

const {
  Client,
  AccountId,
  PrivateKey,
  TokenCreateTransaction,
  TokenId,
  TokenType,
  TokenSupplyType,
  TokenNftInfoQuery,
  TokenMintTransaction,
  NftId,
} = require('@hashgraph/sdk')

// Config client
const privateKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY)
const accountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID)
const client = Client.forTestnet()
let tokenID: any = process.env.TOKEN_ID
client.setOperator(accountId, privateKey)

/**
 * Create Token Family.
 * @returns A token result from the Hedera API.
 */
export async function initTokenize() {
  LOGGER.debug({
    message: 'Initializing Token Family...',
    name: process.env.TOKEN_NAME || 'PoiNFT',
    symbol: process.env.TOKEN_SYMBOL || 'POIS',
  })
  const createTokenTx = await new TokenCreateTransaction()
    .setTokenName(process.env.TOKEN_NAME || 'PoiNFT')
    .setTokenSymbol(process.env.TOKEN_SYMBOL || 'POIS')
    .setDecimals(0)
    .setInitialSupply(0)
    .setSupplyKey(privateKey)
    .setTokenType(TokenType.NonFungibleUnique)
    .setSupplyType(TokenSupplyType.Finite)
    .setMaxSupply(1000)
    .setTreasuryAccountId(accountId)
    .execute(client)

  const createReceipt = await createTokenTx.getReceipt(client)
  const newTokenId = createReceipt.tokenId
  LOGGER.debug({
    message: 'Create Receipt for NFT Family',
    status: createReceipt.status,
    newTokenId,
  })
  tokenID = newTokenId
  return newTokenId
}

export async function tokenize(metadata: string) {
  // First, check if the token family exists:
  let id = tokenID
  if (!tokenID) {
    id = await initTokenize()
  }

  // Convert metadata to uint8array
  const mintTokenTx = await new TokenMintTransaction()
    .setTokenId(id)
    .setMetadata([Buffer.from(metadata)])
    .freezeWith(client)

  // Sign with the supply private key of the token
  const signTx = await mintTokenTx.sign(privateKey)
  // Submit the transaction to a Hedera network
  const txResponse = await signTx.execute(client)
  // Request the receipt of the transaction
  const receipt = await txResponse.getReceipt(client)
  // Get the NFT serial number
  const serialNo = receipt.serials[0].toNumber()

  LOGGER.debug({
    message: 'Minted NFT',
    serialNo,
    TokenId: id.num.toNumber(),
  })

  // Retrieve the token data
  const nftInfos = await new TokenNftInfoQuery()
    .setNftId(new NftId(tokenID, serialNo))
    .execute(client)

  const tokenData = nftInfos[0].metadata.toString()

  LOGGER.debug({
    message: 'Token Metadata',
    tokenData,
  })

  return { tokenID: id.num.toNumber(), nftInfos }
}
