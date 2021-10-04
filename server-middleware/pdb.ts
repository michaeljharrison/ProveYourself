import { anchor, merkle } from "provendb-sdk-node";
import { POI } from "../store/types";
const fs = require('fs');
const crypto = require('crypto');
const winston = require('winston');
const axios = require('axios').default;
const _ = require('lodash');
const COMP_VAULT_KEY = process.env.PROVENDB_COMP_VAULT_KEY || "cv_key"
const WINSTON_FORMAT = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp(),
  winston.format.align(),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...args } = info;
    return `${timestamp} - [pdb.js] - [${level}]: ${message} \n${
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


function buildTree(path: string, object: Object, builder: merkle.Builder) {
  _.forOwn(object, (value, key) => {
    if(_.isObject(value) && Object.keys(value).length > 0 ) {
      // Value is an object with keys, recursively build object.
      buildTree(path + key + '.', value, builder);
    } else if(value) {
      // Value is not an object, add string value.
      builder.add(path + key, Buffer.from(value.toString()))
    }
  })
  return builder;
}

export function hashImage(filePath: string) {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

export async function getCertificate(rowProof: any, rowData: any, metadata: any) {
  const config = {
    method: 'post',
    // url: 'http://localhost:8188/api/getCertificate',
    url: 'https://api.dev.provendocs.com/api/getCertificate/',
    responseType: 'stream',
    headers: { 
      'Authorization': COMP_VAULT_KEY,
    },
    data: {rowProof, rowData, custom: {
      pageOne: {
        subtitle: `For the Proof of Identity Request (POI)`,
        id: metadata.code,
        bodyOne: `This certificate constitutes proof that the Proof of Identity request with the above code has been anchored to a Blockchain using the ${metadata.blockchain} protocol between:`,
        bodyTwo: `This proof includes the request, metadata and all additionally provided identity documents.`,
        date: `${metadata.start} and ${metadata.end}`,
        attestToOne: '(a) The POI has not been altered.',
        attestToTwo: `(b) The POI existed and was completed between the two provided times.`
      }
    }}
  };
    
  try {
    const response = await axios(config);
    return response;
  } catch(e) {
    LOGGER.error({message: 'CV Cert Request Failed', error: e.toString() })
    return e;
  }
}

export async function anchorPOI(poi: POI) {
  // Create Client
  // Create a new anchor client using your credentials
  const client = anchor.connect(anchor.withCredentials(process.env.PROVENDB_SDK_KEY || "sdk_key"), anchor.withInsecure((process.env.PROVENDB_SDK_INSECURE === 'true' && true)|| false), anchor.withAddress(process.env.PROVENDB_SDK_ENDPOINT || 'anchor.proofable.io:443'));

  // Create Builder
  const builder = merkle.newBuilder("sha-256");

  // Filter POI (remove binary file data)
  const filteredPOI = poi;
  if(filteredPOI.verificationProof) {
    delete filteredPOI.verificationProof;
  }
  if(filteredPOI.initialProof) {
    delete filteredPOI.initialProof;
  }
  if(filteredPOI.file && filteredPOI.file.binaryData)
    delete filteredPOI.file.binaryData;
  // Build tree from POI document (recursive).
  buildTree('', filteredPOI, builder);
  const tree = builder.build();
  LOGGER.debug({message: 'Tree built, submitting proof...', tree})

// Submit your proof.
try {
  const proof = await client.submitProof(tree.getRoot(), 
  anchor.submitProofWithAnchorType(anchor.Anchor.Type.HEDERA_MAINNET), // Optional. Add your anchor type.
  anchor.submitProofWithAwaitConfirmed((process.env.PROVENDB_SDK_AWAIT === 'true' && true)|| false),
  anchor.submitProofWithSkipBatching((process.env.PROVENDB_SDK_SKIP === 'true' && true)|| false)
); // Optional. Resolve the promise only when the proof is confirmed.

LOGGER.debug({message: 'Result of Submitting Proof', code: poi.code, proof, tree})
return {tree, proof};
} catch(e) {
  LOGGER.error({message: 'SDK SubmitProof failed with error.', e})
  return {tree, proof: {}}
}

}

export async function checkProof(proof) {
  const client = anchor.connect(anchor.withCredentials(process.env.PROVENDB_SDK_KEY || "sdk_key"), anchor.withInsecure((process.env.PROVENDB_SDK_INSECURE === 'true' && true)|| false));
  const result = await client.getProof(proof.id, proof.anchorType)
  return result;
}