export enum Blockchain {
  HEDERA,
  BITCOIN,
  ETHEREUM,
}

export enum HOLE_STATUS {
  CREATING = 'CREATING',
  CREATED = 'CREATED',
  UPLOADING = 'UPLOADING',
  FAILED = 'FAILED',
  VERIFIED = 'VERIFIED',
  COMPLETE = 'COMPLETE',
}

export enum MESSAGES {
  CREATING = 'Creating Proof of Identity Request...',
  INITIAL_ANCHORING = 'Anchoring Request...',
  CREATED = 'Awaiting Proof upload...',
  UPLOADING = 'Uploading Proof documents...',
  VERIFYING = 'Verifying Proof documents...',
  TOKENIZING = 'Creating NFT...',
  FINAL_ANCHORING = 'Anchoring Proof...',
  COMPLETE = 'Completed Upload.',
}

export enum PROOF_STATUS {
  CONFIRMED = 'CONFIRMED',
  CREATING = 'CREATING',
}

export interface Verification {
  verified: HOLE_STATUS
  verifiedConfidence: number
  wordFound: number
  lineFound: number
  verificationCode: string
}

export interface File {
  name: string
  mimetype: string
  encoding: string
  size: number
  hash: string
  binaryData: any
}

export interface POI {
  _id: string
  name: string
  code: string
  email: string
  blockchain: Blockchain
  expiry: any
  status: HOLE_STATUS
  verification: Verification
  createdOn: Date
  verifiedOn: Date
  initialProof: any
  verificationProof: any
  file: File
}

export interface HOLE {
  _id: string
  code: string
  file: any
  courseName: string
  state: string
  suburb: string
  coursePar: number
  holeNumber: number
  status: HOLE_STATUS
  nickname: string
  holePar: number
}
