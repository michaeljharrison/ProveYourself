import { POI, POI_STATUS, Verification } from "../store/types";

const winston = require('winston');
const { MongoClient } = require("mongodb");
// Replace the uri string with your MongoDB deployment's connection string.
const URI =
  process.env.PROVE_YOURSELF_DB || "mongodb://localhost:27017";
const DB = process.env.PROVE_YOURSELF_DATABASE || 'proveYourself';

const WINSTON_FORMAT = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp(),
  winston.format.align(),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...args } = info;
    return `${timestamp} - [DATABASE] - [${level}]: ${message} \n${
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
const client = new MongoClient(URI);
let database = null;

async function init() {
  LOGGER.info({message: 'Creating connection to MongoDB...', DB, URI});
  try {
    await client.connect();
    database = client.db(DB)
  } catch(e) {
    LOGGER.error({message: 'Could not connect to MongoDB', DB, URI, e});
  }  
}
init();

export async function create(code: string, request: POI) {
  // First make sure the record doesn't already exist.
  LOGGER.debug({message: 'Creating new record', code, request})
  const requests = database.collection('requests');
  try {
    const doesExist = await requests.findOne({code});
    if (doesExist) {
      // Fail, use update method to update.
      LOGGER.error('Request Key already exists.', code);
      return false;
    }
  } catch(e) {
    // Not found, move on.
  }
  
  await requests.insertOne({code, ...request});
  return request;
};

export async function updateCreatedStatus(code: string, initialProof: any) {
  const requests = database.collection('requests');
  await requests.updateOne({code}, {$set: {status: POI_STATUS.CREATED , initialProof,}});
  return true;
};

export async function updateUploadingStatus(code: string) {
  const requests = database.collection('requests');
  await requests.updateOne({code}, {$set: {status: POI_STATUS.UPLOADING}});
  return true;
};

export async function updateStatus(code:string, status: POI_STATUS) {
  const requests = database.collection('requests');
  await requests.updateOne({code}, {$set: {status}});
  return true;
}

export async function updateVerificationProof(code: string, proof: any) {
  const requests = database.collection('requests');
  await requests.updateOne({code}, {$set: {verificationProof: proof}});
  return true;
};

export async function getPendingProofs() {
  const requests = database.collection('requests');
  const pending = await requests.find({status: POI_STATUS.UPLOADING}).toArray();
  return pending;
}




export async function updateVerificationStatus(code: string, verification: Verification, verificationProof: any, file: any, status: POI_STATUS) {
  const requests = database.collection('requests');
  await requests.updateOne({code}, {$set: { status, verification, verifiedOn: new Date(), verificationProof, file}});
  return true;
};

export async function get(code: string) {
  const requests = database.collection('requests');
  const request = await requests.findOne({code});
  return request;
}