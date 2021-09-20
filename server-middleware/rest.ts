

// Imports.
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
// eslint-disable-next-line
import colors from 'colors';
import { POI, POI_STATUS, Verification } from '../store/types';
import {computerVisionFromFile} from './OCR'
import {create, get, update} from './db'
import { checkUpload } from './poi';
import { anchorPOI, getCertificate, hashImage } from './pdb';
const { promisify } = require('util')
const fs = require('fs')
const JSZip = require('jszip')
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
  // TODO WATERMARK WITH LOWER BOUND
  try {
    const {params, body} = req;
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
        // Get File Path and file Hash.
        const filePath = path.join(__dirname, '..', 'uploads', file.filename);
        const fileData = {name: file.originalname, mimetype: file.mimetype, encoding: file.encoding, size: file.size, hash: hashImage(filePath)};
        LOGGER.debug({message: 'Uploading File', poi, fileData, filePath, body})

        // Run OCR over file.
        const ocrResult = await computerVisionFromFile(filePath)
        // LOGGER.debug({message: 'OCR Result', ocrResult})

        // TODO Add a new stage for facial recognition, make sure it's a photo of a person.

        // TODO Check for a specific document number (EG License Number)

        // TODO Australia Post Drivers API real.

        // Verify OCR Data for code.
        const verificationResult: Verification = await checkUpload(poi, ocrResult[0]);
        LOGGER.debug({message: 'Verification Result', verificationResult})

        // Don't bother proving if the verification fails.
        if(verificationResult.verified === "FAILED") {
          const writeResult = await update(code, verificationResult, {}, fileData)
          LOGGER.debug({message: 'Update Result', writeResult})
          res.status(401).send(verificationResult);
          return;
        }

        // Clean up POI data before submitting proof.
        poi.status = verificationResult.verified;
        poi.verification = verificationResult;
        poi.file = fileData.toString();
        // Add a binary representation of the image to mongodb.
        poi.file.binaryData = fs.readFileSync(filePath);
        delete poi._id;

        // Submit Proof.
        LOGGER.debug({message:'Creating proof for verification poi', poi });
        const proofResult = await anchorPOI(poi)
        LOGGER.debug({message:'Result of anchor verification proof', poi, proofResult });

        // Update DB
        const writeResult = await update(code, verificationResult, proofResult, fileData)
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

app.get('/certificate/:code', async (req: any, res: any) => {

  const {params} = req;
  const {code} = params;
  LOGGER.debug({message:'Fetching POI for code', params });
  const poi: POI = await get(code);

  // First, fetch the certificate from the Compliance Vault API
  try {
    LOGGER.debug({message:'Fetching cert for poi', request: {rowProof: poi.verificationProof.proof, rowData: {key: poi.file.name, hash: poi.file.hash}} });

    const response = await getCertificate(poi.verificationProof.proof, {key: poi.file.name, hash: poi.file.hash})
    if(response.status !== 200 || !response) {
      LOGGER.error({message:'Error creating PDF for POI', result: response.toString()});
      res.status(500).send(response);
      return;
    }

    response.data.pipe(res);
    
  } catch (e) {
    console.error(e);
    LOGGER.error({message:'Error fetching PDF', error: e.toString()});
    res.status(500).send(e);
  }



})

app.get('/image/:code', async (req: any, res: any) => {

  const {params} = req;
  const {code} = params;
  LOGGER.debug({message:'Fetching POI for code', params });
  const poi: POI = await get(code);

  // First, fetch the certificate from the Compliance Vault API
  try {
    // Get the binary data from the POI.
    const {file} = poi;
    const {binaryData} = file;
    LOGGER.debug({message:'Returning Image Preview', file, length: binaryData.length });
    const data = `data:image/png;base64,${binaryData.toString('base64')}`
    res.status(200).send(data)
  } catch (e) {
    console.error(e);
    LOGGER.error({message:'Error fetching upload preview', error: e.toString()});
    res.status(500).send(e);
  }
})

app.get('/download/:code', async (req: any, res: any) => {
  const {params} = req;
  const {code} = params;
  LOGGER.debug({message:'Downloading Proof for Code', params });
  const poi: POI = await get(code);

  try {
    // Get the binary data from the POI.
    const {file} = poi;
    const {binaryData} = file;
    LOGGER.debug({message:'Returning Image Preview', file, length: binaryData.length });
    fs.writeFileSync(path.join(__dirname,`image_${poi.code.substring(0,5)}.png`), binaryData.toString('base64'), {encoding: 'base64'});

    LOGGER.debug({message:'Writing to file', file, length: binaryData.length });
    const zip = new JSZip();
    // Add Proof
    zip.file("proof.json", JSON.stringify(poi));
    // Add Image
    const data = fs.readFileSync(path.join(__dirname,`image_${poi.code.substring(0,5)}.png`));
    zip.file(`image_${poi.code.substring(0,5)}.png`, data)


    // Write out .zip
    // JSZip can generate Buffers so you can do the following
    zip.generateNodeStream({type:'nodebuffer',streamFiles:true})
   .pipe(fs.createWriteStream(path.join(__dirname, `POI_${poi.code.substring(0,5)}.zip`)))
   .on('finish', function () {
       // JSZip generates a readable stream with a "end" event,
       // but is piped here in a writable stream which emits a "finish" event.

       // Send the file
       res.sendFile(path.join(__dirname, `POI_${poi.code.substring(0,5)}.zip`))

       // Clean up all files.
       setTimeout(async() => {
        let deleteFileResult = await unlinkAsync(path.join(__dirname, `POI_${poi.code.substring(0,5)}.zip`));
        LOGGER.debug({message: 'Clean Image File Result', deleteFileResult})
        deleteFileResult = await unlinkAsync(path.join(__dirname, `POI_${poi.code.substring(0,5)}.zip`));
        LOGGER.debug({message: 'Clean Zip File Result', deleteFileResult})
       }, 5000)
   })
  } catch (e) {
    console.error(e);
    LOGGER.error({message:'Error fetching upload preview', error: e.toString()});
    res.status(500).send(e);
  }
})

module.exports = app