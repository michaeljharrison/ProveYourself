

// Imports.
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
// eslint-disable-next-line
import colors from 'colors';
import { POI, POI_STATUS, Verification } from '../store/types';
import {computerVisionFromFile} from './OCR'
import {create, get, update} from './db'
import { checkUpload } from './poi';
import { anchorPOI } from './pdb';
const { promisify } = require('util')
const fs = require('fs')
const expressWinston = require('express-winston');
const winston = require('winston');
const bodyParser = require("body-parser");
const express = require('express')
const multer  =   require('multer');  
const upload = multer({ dest: 'uploads/' })
const unlinkAsync = promisify(fs.unlink)
// Logging
const WINSTON_FORMAT = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp(),
  winston.format.align(),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...args } = info;
    return `${timestamp} - [REST] - [${level}]: ${message} \n${
      Object.keys(args).length ? JSON.stringify(args, null, 2) : ''
    }`;
  }),
);
const LOGGER = winston.createLogger({
  format: WINSTON_FORMAT,
    transports: [
        new winston.transports.Console({
          level: process.env.DEBUG_LEVEL || 'debug',
          json: true,
          colorize: true,
        })
    ]
});

// Setup.
const app = express()

app.use(expressWinston.logger({
  transports: [
    new winston.transports.Console()
  ],
  format: WINSTON_FORMAT,
  meta: false,
  expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
  colorize: true, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Routes.
app.use(express.json())

app.post('/create', async (req: any, res: any) => {
  const poi = req.body;
  // Generate a unique code based on the blockchain:
  const code = uuidv4();
  poi.code = code
  poi.status = POI_STATUS.CREATED;
  poi.createdOn = new Date();

  // SubmitProof
  LOGGER.debug({message:'Creating proof for initial poi', poi });
  const proofResult = await anchorPOI(poi)

  LOGGER.debug({message:'Result of anchor initial proof', poi, proofResult });
  poi.requestProof = proofResult;

  // Save the request to the database.
  const createRes = await create(code, poi)

  if(createRes) {
      res.json({ok: 1, ...poi})
  } else {
    res.status(400).send({ok: 0, error: 'Failed to create record in levelDB.', result: createRes})
  }
  
})

app.post('/get', async (req: any, res: any) => {
  const code = req.body;
  // Save the request to the database.
  const getRes = await get(code.code);
  LOGGER.debug({message:'Result of find operation', code: code.code, getRes });
  if(getRes) {
      res.json({ok: 1, ...getRes})
  } else {
    res.status(404).send({ok: 0, error: 'No request found for that code.', result: getRes})
  }
  
})

app.post('/upload/:code', upload.single('file'), async (req: any, res: any) => {
  // TODO Steganography embed information within the image.
  try {
    const {params} = req;
    const {file} = req;
    const {code} = params;
    if(!code) {
      res.status(404).send({ok: 0, error: '404: Please provide a code along with the upload.'})
    } else {
      // First get the POI for the associated code.
      const poi: POI = await get(code);
      if(!poi) {
        res.status(404).send({ok: 0, error: '404: No POI request for that code was found.'})
      } else {
        // Get File Path.
        const filePath = path.join(__dirname, '..', 'uploads', file.filename);
        LOGGER.debug({message: 'Uploading File', poi, file, filePath})

        // Run OCR over file.
        const ocrResult = await computerVisionFromFile(filePath)
        LOGGER.debug({message: 'OCR Result', ocrResult})

        // TODO Add a new stage for facial recognition, make sure it's a photo of a person.

        // TODO Check for a specific document number.

        // TODO Australia Post Drivers API real.

        // Verify OCR Data for code.
        const verificationResult: Verification = await checkUpload(poi, ocrResult[0]);
        LOGGER.debug({message: 'Verification Result', verificationResult})

        // SubmitProof
        delete poi._id;
        LOGGER.debug({message:'Creating proof for verification poi', poi });
        const proofResult = await anchorPOI(poi)
        LOGGER.debug({message:'Result of anchor verification proof', poi, proofResult });

        // Update DB
        const writeResult = await update(code, verificationResult, proofResult )
        LOGGER.debug({message: 'Update Result', writeResult})

        // Clean File
        const deleteFileResult = await unlinkAsync(filePath);
        LOGGER.debug({message: 'Clean File Result', deleteFileResult})
        res.status(200).send({ok: 1, proofResult})
      }
    }
  } catch(error) {
    console.error(error);
    LOGGER.error({message: 'Error in /upload/:code route', error})
    res.status(500).send({ok: 0, error: error.toString()})
  }
})
module.exports = app