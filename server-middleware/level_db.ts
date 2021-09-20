const winston = require('winston');
const level = require('level')
// 1) Create our database, supply location and options.
//    This will create or open the underlying store.
const db = level('my-db');
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
export async function create(key: string, record: Object) {
  // First make sure the record doesn't already exist.
  LOGGER.debug({message: 'Creating new record', key, record})
  try {
    const doesExist = await db.get(key);
    if (doesExist) {
      // Fail, use update method to update.
      LOGGER.error('Key already exists.', key);
      return false;
    }
  } catch(e) {
    // Not found, move on.
  }
  
  await db.put(key, record);
  return true;
};

export async function update(key: string, record: Object) {
  const result = await db.put(key, record);
  return true;
};

export async function get(key: string) {
  const record = await db.get(key);
  return record;
}

export async function updateUserRequests(email: string, requestID: string) {
  // Fetch the current user requests record (if it exists)
  // First make sure the record doesn't already exist.
  LOGGER.debug({message: 'Updating user requests', email, requestID})
  try {
    const doesExist = await db.get(email);
    if (doesExist) {
      console.log(doesExist.toString());
      // User already exists, update record.
      return true;
    }
  } catch(e) {
    // Not found, create new
    await db.put(email, {requests: [requestID]});
    return true;
  }
  

}