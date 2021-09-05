import { anchor, merkle } from "provendb-sdk-node";
import { POI } from "../store/types";
const winston = require('winston');
const _ = require('lodash');
// Create a new anchor client using your credentials
const client = anchor.connect(anchor.withCredentials(process.env.PROVENDB_SDK_KEY || "sdk_key"));
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

// TODO This function should probably just be part of the SDK.
function buildTree(path: string, object: Object, builder: merkle.Builder) {
  LOGGER.debug({message: 'Building Tree for Object', object})
  _.forOwn(object, (value, key) => {
    if(_.isObject(value) && Object.keys(value).length > 0 ) {
      // Value is an object with keys, recursively build object.
      buildTree(path + key + '.', value, builder);
    } else {
      // Value is not an object, add string value.
      builder.add(path + key, Buffer.from(value.toString()))
    }
  })
  return builder;
}

export async function anchorPOI(poi: POI) {

  // Create Builder
  const builder = merkle.newBuilder("sha-256");

  // Build tree from POI document (recursive).
  buildTree('', poi, builder);
  const tree = builder.build();
  LOGGER.debug({message: 'Result of Building Tree for POI', tree})

// Submit your proof.
const proof = await client.submitProof(tree.getRoot(), 
    anchor.submitProofWithAnchorType(anchor.Anchor.Type.HEDERA_MAINNET), // Optional. Add your anchor type.
    anchor.submitProofWithAwaitConfirmed(true)); // Optional. Resolve the promise only when the proof is confirmed.

  return {tree, proof};
}