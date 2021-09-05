import { POI, Verification } from "../store/types";

const winston = require('winston');
const { MongoClient } = require("mongodb");
// Replace the uri string with your MongoDB deployment's connection string.
const uri =
  process.env.PROVE_YOURSELF_DB || "mongodb://localhost:27017";
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
const client = new MongoClient(uri);
let database = null;

async function init() {
  await client.connect();
  database = client.db('prove_yourself')
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

export async function update(code: string, verification: Verification, verificationProof: any) {
  const requests = database.collection('requests');
  await requests.updateOne({code}, {$set: {status: verification.verified , verification, verifiedOn: new Date(), verificationProof}});
  return true;
};

export async function get(code: string) {
  console.log(code);
  const requests = database.collection('requests');
  const request = await requests.findOne({code});
  return request;
}