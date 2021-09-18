export enum Blockchain {
  HEDERA,
  BITCOIN,
  ETHEREUM
}

export enum POI_STATUS {
  CREATED = "CREATED",
  FAILED = "FAILED",
  VERIFIED = "VERIFIED",
}

export interface Verification {
  verified: POI_STATUS,
  verifiedConfidence: number,
  wordFound: number,
  lineFound: number
}

export interface POI {
  _id: string,
  name: string,
  code: string,
  email: string,
  blockchain: Blockchain,
  expiry: any,
  status: POI_STATUS,
  verification: Verification
  createdOn: Date,
  verifiedOn: Date,
  requestProof: any,
  verificationProof: any,
  file: any,

}
