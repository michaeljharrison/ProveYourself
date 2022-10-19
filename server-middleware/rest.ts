// Imports.
import path from 'path'
import crypto from 'crypto'

import { v4 as uuidv4 } from 'uuid'
// eslint-disable-next-line
import colors from 'colors'
import _ from 'lodash'

import {
  MESSAGES,
  POI,
  HOLE_STATUS,
  PROOF_STATUS,
  Verification,
  HOLE,
} from '../store/types'
import { computerVisionFromFile } from './OCR'
import {
  create,
  get,
  getAll,
  getExistingRequestProofs,
  getExistingValidationProofs,
  getPendingRequestProofs,
  getPendingValidationProofs,
  updateCreatedStatus,
  updateFile,
  updateInitalProof,
  updateMessage,
  updateStatus,
  updateToken,
  updateVerificationProof,
} from './db'
import { tokenize } from './tokenize'
import { checkUpload } from './poi'
import { hashImage } from './pdb'
const { promisify } = require('util')
const fs = require('fs')
const JSZip = require('jszip')
const expressWinston = require('express-winston')
const winston = require('winston')
const bodyParser = require('body-parser')
const express = require('express')
const jwt = require('jsonwebtoken')
const config = require('./auth/auth.config')
const multer = require('multer')
const upload = multer({ dest: 'uploads/' })
const cors = require('cors')
const db = require('./auth/models')
const sizeof = require('object-sizeof')
const MemoryStream = require('./MemoryStream')
const unlinkAsync = promisify(fs.unlink)

// Logging
const WINSTON_FORMAT = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp(),
  winston.format.align(),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...args } = info
    return `${timestamp} - [REST] - [${level}]: ${message} \n${
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

const User = db.user
const Role = db.role

// Setup.
const app = express()
const corsOptions = {
  origin: 'http://localhost:8081',
}
app.use(cors())
app.use(
  expressWinston.logger({
    transports: [new winston.transports.Console()],
    format: WINSTON_FORMAT,
    meta: false,
    expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
    colorize: true, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
  })
)
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// Routes.
app.use(express.json())

// Auth Routes
require('./auth/auth_routes')(app)
// User authorised routes.
require('./user.routes')(app)

app.get('/health', (_req: any, res: any) => {
  res.status(200).send(true)
})

app.post('/create', async (req: any, res: any) => {
  LOGGER.debug({
    message: 'New create hole request',
    body: req.body,
    token: req.headers['x-access-token'],
  })
  // First Get User
  const token = req.headers['x-access-token'].replace('Bearer ', '')

  if (!token) {
    LOGGER.error({
      message: 'No token provided',
      token: req.headers['x-access-token'],
    })
    return res.status(403).send({ message: 'No token provided!' })
  }

  jwt.verify(token, config.secret, async (err, decoded) => {
    if (err) {
      LOGGER.error({ message: 'Error decoding token', err })
      return res.status(500).send({ message: 'Error decoding token', err })
    }
    LOGGER.debug({ message: 'Decoded token', decoded })

    const hole = req.body
    // Generate a unique code based on the blockchain:
    const code = uuidv4()
    hole.code = code
    hole.userId = decoded.id
    hole.status = HOLE_STATUS.CREATED
    hole.createdOn = new Date()
    hole.message = MESSAGES.CREATED

    // Create initial database record.
    const createRes = await create(code, hole)
    if (createRes) {
      res.json({ ok: 1, ...hole })
    } else {
      res.status(400).send({
        ok: 0,
        error: 'Failed to create record in levelDB.',
        result: createRes,
      })
    }

    updateMessage(code, MESSAGES.CREATED)
  })
})

app.get('/getHoles', async (req: any, res: any) => {
  LOGGER.debug({
    message: 'New get all holes request',
    body: req.body,
    token: req.headers['x-access-token'],
  })
  // First Get User
  const token = req.headers['x-access-token'].replace('Bearer ', '')

  if (!token) {
    LOGGER.error({
      message: 'No token provided',
      token: req.headers['x-access-token'],
    })
    return res.status(403).send({ message: 'No token provided!' })
  }

  jwt.verify(token, config.secret, async (err, decoded) => {
    if (err) {
      LOGGER.error({ message: 'Error decoding token', err })
      return res.status(500).send({ message: 'Error decoding token', err })
    }
    LOGGER.debug({ message: 'Decoded token', decoded })

    LOGGER.debug({ message: 'Holes query:', userId: decoded.id })
    const holes = await getAll(decoded.id)
    if (holes) {
      LOGGER.debug({ message: 'Holes fetched', holes })
      res.json({ ok: 1, holes })
    } else {
      res.status(400).send({
        ok: 0,
        error: 'Failed to fetch records in database.',
        result: holes,
      })
    }
  })
})

app.post('/get', async (req: any, res: any) => {
  const code = req.body
  // Save the request to the database.
  const getRes: POI = await get(code.code)

  if (getRes) {
    res.json({ ok: 1, ...getRes })
    LOGGER.debug({
      message: 'Result of find operation',
      code: code.code,
      status: getRes.status,
      email: getRes.email,
    })
  } else {
    res
      .status(404)
      .send({ ok: 0, error: 'No request found for that code.', result: getRes })
  }
})

app.post('/upload/:code', upload.single('file'), async (req: any, res: any) => {
  try {
    const { params, body } = req
    const { file } = req
    const { code } = params

    if (!code) {
      res.status(404).send({
        ok: 0,
        error: '404: Please provide a code along with the upload.',
      })
    } else {
      // First get the POI for the associated code.
      const hole: HOLE = await get(code)
      if (!hole) {
        res.status(404).send({
          ok: 0,
          error: '404: No POI request for that code was found.',
        })
      } else {
        updateMessage(hole.code, MESSAGES.VERIFYING)
        // Get File Path and file Hash.
        const filePath = path.join(__dirname, '..', 'uploads', file.filename)
        const fileData = {
          name: file.originalname,
          mimetype: file.mimetype,
          encoding: file.encoding,
          size: file.size,
          hash: hashImage(filePath),
          binaryData: null,
        }
        LOGGER.debug({
          message: 'Uploading File',
          code: hole.code,
          filePath,
          body,
        })

        // Add a binary representation of the image to mongodb.
        const fileBuffer = fs.readFileSync(filePath)
        const hashSum = crypto.createHash('sha256')
        hashSum.update(fileBuffer)
        fileData.binaryData = fileBuffer
        delete hole._id

        // Clean up POI data before submitting proof.
        hole.status = HOLE_STATUS.COMPLETE
        hole.file = fileData

        // Update database to UPLOADING before submitting proof.
        updateMessage(hole.code, MESSAGES.COMPLETE)
        await updateFile(code, fileData, HOLE_STATUS.COMPLETE)
        res.status(200).send({ ok: 1 })

        // Clean File
        const deleteFileResult = await unlinkAsync(filePath)
        LOGGER.debug({ message: 'Clean File Result', deleteFileResult })
      }
    }
  } catch (error) {
    console.error(error)
    LOGGER.error({ message: 'Error in /upload/:code route', error })
    res.status(500).send({ ok: 0, error: error.toString() })
  }
})

app.get('/certificate/:code', async (req: any, res: any) => {
  const { params } = req
  const { code } = params
  LOGGER.debug({ message: 'Fetching POI for code', params })
  const poi: POI = await get(code)

  // First, fetch the certificate from the Compliance Vault API
  try {
    LOGGER.debug({
      message: 'Fetching cert for poi',
      request: {
        rowProof: poi.verificationProof.proof,
        rowData: { key: poi.file.name, hash: poi.file.hash },
      },
    })

    const certMetadata = {
      code: poi.code,
      person: poi.name,
      email: poi.email,
      start: poi.createdOn,
      end: poi.verifiedOn,
      blockchain: poi.blockchain,
    }
    const response = await getCertificate(
      poi.verificationProof.proof,
      { key: poi.file.name, hash: poi.file.hash },
      certMetadata
    )
    if (response.status !== 200 || !response) {
      LOGGER.error({
        message: 'Error creating PDF for POI',
        result: response.toString(),
      })
      res.status(500).send(response)
      return
    }

    response.data.pipe(res)
  } catch (e) {
    console.error(e)
    LOGGER.error({ message: 'Error fetching PDF', error: e.toString() })
    res.status(500).send(e)
  }
})

app.get('/image/:code', async (req: any, res: any) => {
  const { params } = req
  const { code } = params
  LOGGER.debug({ message: 'Fetching POI for code', params })
  const poi: POI = await get(code)

  // First, fetch the certificate from the Compliance Vault API
  try {
    // Get the binary data from the POI.
    const { file } = poi
    const { binaryData } = file
    LOGGER.debug({
      message: 'Returning Image Preview',
      file,
      length: binaryData.length,
    })
    const data = `data:image/png;base64,${binaryData.toString('base64')}`
    res.status(200).send(data)
  } catch (e) {
    console.error(e)
    LOGGER.error({
      message: 'Error fetching upload preview',
      error: e.toString(),
    })
    res.status(500).send(e)
  }
})

app.get('/download/:code', async (req: any, res: any) => {
  const { params } = req
  const { code } = params
  LOGGER.debug({ message: 'Downloading Proof for Code', params })
  const poi: POI = await get(code)

  try {
    // Get the binary data from the POI.
    const { file } = poi
    const { binaryData } = file
    LOGGER.debug({
      message: 'Returning Image Preview',
      file,
      length: binaryData.length,
    })
    fs.writeFileSync(
      path.join(__dirname, `image_${poi.code.substring(0, 5)}.png`),
      binaryData.toString('base64'),
      { encoding: 'base64' }
    )

    LOGGER.debug({
      message: 'Writing to file',
      file,
      length: binaryData.length,
    })
    const zip = new JSZip()
    // Add Proof
    zip.file('proof.json', JSON.stringify(poi))
    // Add Image
    const data = fs.readFileSync(
      path.join(__dirname, `image_${poi.code.substring(0, 5)}.png`)
    )
    zip.file(`image_${poi.code.substring(0, 5)}.png`, data)
    // Add Certificate
    LOGGER.debug({
      message: 'Fetching cert for download',
      request: { rowData: { key: poi.file.name, hash: poi.file.hash } },
    })

    const certMetadata = {
      code: poi.code,
      person: poi.name,
      email: poi.email,
      start: poi.createdOn,
      end: poi.verifiedOn,
      blockchain: poi.blockchain,
    }
    const response = await getCertificate(
      poi.verificationProof.proof,
      { key: poi.file.name, hash: poi.file.hash },
      certMetadata
    )
    if (response.status !== 200 || !response) {
      LOGGER.error({
        message: 'Error creating PDF for POI',
        result: response.toString(),
      })
      res.status(500).send(response)
      return
    } else {
      // Write Cert to file.
      // const contentType = response.headers['content-type'];
      let contentLength = response.headers['content-length']
      const writer = new MemoryStream()

      response.data.pipe(writer)
      writer.on('finish', function () {
        const b = writer.toBuffer()

        const computedContentLength = b.byteLength

        if (!contentLength) {
          contentLength = computedContentLength
        }

        zip.file('certificate.pdf', b)
        // Write out .zip
        // JSZip can generate Buffers so you can do the following
        zip
          .generateNodeStream({ type: 'nodebuffer', streamFiles: true })
          .pipe(
            fs.createWriteStream(
              path.join(__dirname, `POI_${poi.code.substring(0, 5)}.zip`)
            )
          )
          .on('finish', function () {
            // JSZip generates a readable stream with a "end" event,
            // but is piped here in a writable stream which emits a "finish" event.

            // Send the file
            res.sendFile(
              path.join(__dirname, `POI_${poi.code.substring(0, 5)}.zip`)
            )

            // Clean up all files.
            setTimeout(async () => {
              let deleteFileResult = await unlinkAsync(
                path.join(__dirname, `POI_${poi.code.substring(0, 5)}.zip`)
              )
              LOGGER.debug({
                message: 'Clean Image File Result',
                deleteFileResult,
              })
              deleteFileResult = await unlinkAsync(
                path.join(__dirname, `POI_${poi.code.substring(0, 5)}.zip`)
              )
              LOGGER.debug({
                message: 'Clean Zip File Result',
                deleteFileResult,
              })
            }, 5000)
          })
      })
    }
  } catch (e) {
    console.error(e)
    LOGGER.error({
      message: 'Error fetching upload preview',
      error: e.toString(),
    })
    res.status(500).send(e)
  }
})

const debouncedCheckValidationProofs = _.debounce(
  async () => {
    // Run a find to get a list of non-proven proofs.
    const pending = await getPendingValidationProofs()
    // For each pending proof
    pending.forEach(async (poi: POI) => {
      LOGGER.debug({
        message: 'Picked up stale validation proof',
        code: poi.code,
        status: poi.status,
        proof: poi.verificationProof,
      })
      const { code } = poi

      // Check proof (if existing) first before submitting.
      let proofStatus = null
      if (
        poi.verificationProof &&
        poi.verificationProof.proof &&
        poi.verificationProof.proof.id
      ) {
        updateMessage(poi.code, MESSAGES.VERIFYING)
        proofStatus = await checkProof(poi.verificationProof.proof)
        LOGGER.debug({
          message: 'Current Status of Validation Proof',
          code: poi.code,
          status: poi.status,
          proofStatus,
        })
        if (proofStatus && proofStatus.status === PROOF_STATUS.CONFIRMED) {
          // If complete, update database.
          await updateVerificationProof(code, {
            tree: poi.verificationProof.tree,
            proof: proofStatus,
          })
          updateMessage(poi.code, MESSAGES.TOKENIZING)
          const token = await tokenize(
            poi.code,
            poi.verificationProof.proof.hash
          )
          await updateToken(code, token)
          await updateStatus(code, POI_STATUS.VERIFIED)
          updateMessage(poi.code, MESSAGES.COMPLETE)
        }
      } else {
        // No proof created, create new proof.
        LOGGER.debug({
          message: 'Creating new proof for Validation poi...',
          code: poi.code,
          status: poi.status,
        })
        const proofResult = await anchorPOI(poi)
        LOGGER.debug({
          message: 'New Proof created for Validation poi.',
          code: poi.code,
          status: poi.status,
          sizeOfProof: sizeof(proofResult),
          sizeOfDoc: sizeof(poi),
        })
        // Check if finished in mean time (anchorPOI can take some time)
        const oldPoi: POI = await get(poi.code)
        if (oldPoi.status === POI_STATUS.UPLOADING)
          await updateVerificationProof(code, proofResult)
      }
    })
  },
  3000,
  {
    leading: true,
    trailing: true,
  }
)

const debouncedCheckRequestProofs = _.debounce(
  async () => {
    // Run a find to get a list of non-proven proofs.
    const pending = await getPendingRequestProofs()
    // For each pending proof
    pending.forEach(async (poi: POI) => {
      LOGGER.debug({
        message: 'Picked up stale request proof',
        code: poi.code,
        status: poi.status,
        proofId:
          (poi && poi.initialProof && poi.initialProof.proof.id) || 'null',
      })

      const { code } = poi
      // Check proof (if existing) first before submitting.
      let proofStatus = null
      if (poi.initialProof && poi.initialProof.proof.id) {
        proofStatus = await checkProof(poi.initialProof.proof)
        LOGGER.debug({
          message: 'Current Status of request Proof',
          code: poi.code,
          status: poi.status,
          proofStatus,
        })
        if (proofStatus && proofStatus.status === PROOF_STATUS.CONFIRMED) {
          // If complete, update database.
          await updateCreatedStatus(code, {
            tree: poi.initialProof.tree,
            proof: proofStatus,
          })
          updateMessage(poi.code, MESSAGES.CREATED)
        } else if (proofStatus === false) {
          LOGGER.warn({
            message: 'Proof cannot be fetched, creating new...',
            code: poi.code,
            status: poi.status,
            proofStatus,
          })
          // No proof created, create new proof.
          LOGGER.debug({
            message: 'Creating new proof for request poi...',
            code: poi.code,
            status: poi.status,
          })
          const proofResult = await anchorPOI(poi)
          updateMessage(poi.code, MESSAGES.INITIAL_ANCHORING)
          LOGGER.debug({
            message: 'New Proof created for request poi.',
            code: poi.code,
            status: poi.status,
            sizeOfProof: sizeof(proofResult),
            sizeOfDoc: sizeof(poi),
          })
        }
      } else {
        // No proof created, create new proof.
        LOGGER.debug({
          message: 'Creating new proof for request poi...',
          code: poi.code,
          status: poi.status,
        })
        const proofResult = await anchorPOI(poi)
        updateMessage(poi.code, MESSAGES.INITIAL_ANCHORING)
        LOGGER.debug({
          message: 'New Proof created for request poi.',
          code: poi.code,
          status: poi.status,
          sizeOfProof: sizeof(proofResult),
          sizeOfDoc: sizeof(poi),
        })
        const oldPoi: POI = await get(poi.code)
        if (oldPoi.status === POI_STATUS.CREATING)
          await updateInitalProof(code, proofResult)
      }
    })
  },
  3000,
  {
    leading: true,
    trailing: true,
  }
)

const debouncedCheckExistingRequestProofs = _.debounce(
  async () => {
    // Run a find to get a list of non-proven proofs.
    const pending = await getExistingRequestProofs()
    // For each pending proof
    pending.forEach(async (poi: POI) => {
      LOGGER.debug({
        message: 'Picked up stale request proof',
        code: poi.code,
        status: poi.status,
        proofId:
          (poi && poi.initialProof && poi.initialProof.proof.id) || 'null',
      })

      const { code } = poi
      // Check if proof is valid.
      let proofStatus = null
      proofStatus = await checkProof(poi.initialProof.proof)
      LOGGER.debug({
        message: 'Current Status of request Proof',
        code: poi.code,
        status: poi.status,
        proofStatus,
      })
      if (proofStatus && proofStatus.status === PROOF_STATUS.CONFIRMED) {
        // If complete, update database.
        await updateCreatedStatus(code, {
          tree: poi.initialProof.tree,
          proof: proofStatus,
        })
        updateMessage(poi.code, MESSAGES.CREATED)
      }
    })
  },
  3000,
  {
    leading: true,
    trailing: true,
  }
)

const debouncedCheckExistingValidationProofs = _.debounce(
  async () => {
    // Run a find to get a list of non-proven proofs.
    const pending = await getExistingValidationProofs()
    // For each pending proof
    pending.forEach(async (poi: POI) => {
      LOGGER.debug({
        message: 'Picked up stale validation proof',
        code: poi.code,
        status: poi.status,
      })

      const { code } = poi
      // Check if proof is valid.
      let proofStatus = null
      proofStatus = await checkProof(poi.verificationProof.proof)
      LOGGER.debug({
        message: 'Current Status of request Proof',
        code: poi.code,
        status: poi.status,
        proofStatus,
      })
      if (proofStatus && proofStatus.status === PROOF_STATUS.CONFIRMED) {
        // If complete, update database.
        await updateVerificationProof(code, {
          tree: poi.verificationProof.tree,
          proof: proofStatus,
        })
        updateMessage(poi.code, MESSAGES.TOKENIZING)
        const token = await tokenize(poi.code, poi.verificationProof.proof.hash)
        await updateToken(code, token)
        await updateStatus(code, POI_STATUS.VERIFIED)
        updateMessage(poi.code, MESSAGES.COMPLETE)
      }
    })
  },
  3000,
  {
    leading: true,
    trailing: true,
  }
)

setInterval(() => {
  debouncedCheckExistingValidationProofs()
}, parseInt(process.env.PROVE_YOURSELF_LOOP_INTERVAL) || 10000)

setInterval(() => {
  debouncedCheckExistingRequestProofs()
}, parseInt(process.env.PROVE_YOURSELF_LOOP_INTERVAL) || 10000)

setInterval(() => {
  debouncedCheckValidationProofs()
}, parseInt(process.env.PROVE_YOURSELF_LOOP_LONG_INTERVAL) || 120000)

setInterval(() => {
  debouncedCheckRequestProofs()
}, parseInt(process.env.PROVE_YOURSELF_LOOP_LONG_INTERVAL) || 120000)

>>>>>>> parent of 359d9d1 (Tokenization first cut:)
module.exports = app
