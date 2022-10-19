import { HOLE, HOLE_STATUS, Verification } from '../store/types'
const winston = require('winston')
const { MongoClient } = require('mongodb')
// Replace the uri string with your MongoDB deployment's connection string.
const URI = process.env.NFTEE_DB || 'mongodb://localhost:27017'
const DB = process.env.NFTEE_DATABASE || 'nftees'

const WINSTON_FORMAT = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp(),
  winston.format.align(),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...args } = info
    return `${timestamp} - [DATABASE] - [${level}]: ${message} \n${
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
const client = new MongoClient(URI)
let database = null

async function init() {
  LOGGER.info({
    message: 'Creating connection to MongoDB...',
    DB,
    URI,
    LOOP_TIMER: process.env.PROVE_YOURSELF_LOOP_INTERVAL,
    SDK_INSECURE: process.env.PROVENDB_SDK_INSECURE,
    SDK_AWAIT: (process.env.PROVENDB_SDK_AWAIT === 'true' && true) || false,
    SDK_SKIP: process.env.PROVENDB_SDK_SKIP,
    SDK_ENDPOINT: process.env.PROVENDB_SDK_ENDPOINT,
    SDK_ANCHOR:
      process.env.PROVENDB_SDK_ANCHOR || anchor.Anchor.Type.HEDERA_MAINNET,
  })
  try {
    await client.connect()
    database = client.db(DB)
  } catch (e) {
    LOGGER.error({ message: 'Could not connect to MongoDB', DB, URI, e })
  }
}
init()

export async function create(code: string, request: HOLE) {
  // First make sure the record doesn't already exist.
  LOGGER.debug({ message: 'Creating new record', code, request })
  const requests = database.collection('requests')
  try {
    const doesExist = await requests.findOne({ code })
    if (doesExist) {
      // Fail, use update method to update.
      LOGGER.error('Request Key already exists.', code)
      return false
    }
  } catch (e) {
    // Not found, move on.
  }

  await requests.insertOne({ code, ...request })
  return request
}

export async function updateCreatedStatus(code: string, initialProof: any) {
  const requests = database.collection('requests')
  await requests.updateOne(
    { code },
    { $set: { status: HOLE_STATUS.CREATED, initialProof } }
  )
  return true
}

export async function updateUploadingStatus(code: string) {
  const requests = database.collection('requests')
  await requests.updateOne(
    { code },
    { $set: { status: HOLE_STATUS.UPLOADING } }
  )
  return true
}

export async function updateStatus(code: string, status: HOLE_STATUS) {
  const requests = database.collection('requests')
  await requests.updateOne({ code }, { $set: { status } })
  return true
}

export async function updateInitalProof(code: string, proof: any) {
  const requests = database.collection('requests')
  await requests.updateOne({ code }, { $set: { initialProof: proof } })
  return true
}

export async function updateVerificationProof(code: string, proof: any) {
  const requests = database.collection('requests')
  await requests.updateOne({ code }, { $set: { verificationProof: proof } })
  return true
}

export async function updateToken(code: string, token: any) {
  const requests = database.collection('requests')
  await requests.updateOne({ code }, { $set: { token } })
  return true
}

export async function updateMessage(code: string, message: string) {
  const requests = database.collection('requests')
  await requests.updateOne({ code }, { $set: { message } })
  return true
}

export async function getPendingRequestProofs() {
  const requests = database.collection('requests')
  const pending = await requests
    .find({ status: HOLE_STATUS.CREATING })
    .toArray()
  return pending
}

export async function getExistingRequestProofs() {
  const requests = database.collection('requests')
  const pending = await requests
    .find({
      status: HOLE_STATUS.CREATING,
      'initialProof.proof.id': { $exists: true },
    })
    .toArray()
  return pending
}

export async function getExistingValidationProofs() {
  const requests = database.collection('requests')
  const pending = await requests
    .find({
      status: HOLE_STATUS.UPLOADING,
      'verificationProof.proof.id': { $exists: true },
    })
    .toArray()
  return pending
}

export async function getPendingValidationProofs() {
  const requests = database.collection('requests')
  const pending = await requests
    .find({ status: HOLE_STATUS.UPLOADING })
    .toArray()
  return pending
}

export async function updateFile(code: string, file: any, status: HOLE_STATUS) {
  const requests = database.collection('requests')
  await requests.updateOne(
    { code },
    {
      $set: {
        status,
        file,
      },
    }
  )
  return true
}

export async function get(code: string) {
  const requests = database.collection('requests')
  const request = await requests.findOne({ code })
  return request
}

export async function getAll(userId: string) {
  const requests = database.collection('requests')
  const request = await requests.find({ userId }).toArray()
  return request
}
