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

module.exports = app
