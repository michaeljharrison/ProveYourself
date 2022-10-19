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
} = require('@hashgraph/sdk')

// Config client
const privateKey = PrivateKey.fromString(process.env.HEDERA_PRIVATE_KEY)
const accountId = AccountId.fromString(process.env.HEDERA_ACCOUNT_ID)
const client = Client.forTestnet()
client.setOperator(accountId, privateKey)

/**
 * tokenize
 * @param poi The Proof of Identity object to be tokenized.
 * @returns A token result from the Hedera API.
 */
export async function tokenize(name: string, hash: string) {
  const createTokenTx = await new TokenCreateTransaction()
    .setTokenName(name)
    .setTokenSymbol(hash)
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
    message: 'Create Receipt for NFT',
    status: createReceipt.status,
    newTokenId,
  })
  return createReceipt
}
