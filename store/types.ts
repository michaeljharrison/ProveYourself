export enum Blockchain {
  HEDERA,
  BITCOIN,
  ETHEREUM
}

export enum POI_STATUS {
  CREATING = "CREATING",
  CREATED = "CREATED",
  UPLOADING = "UPLOADING",
  FAILED = "FAILED",
  VERIFIED = "VERIFIED",
}

export interface Verification {
  verified: POI_STATUS,
  verifiedConfidence: number,
  wordFound: number,
  lineFound: number
  verificationCode: string
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
  initialProof: any,
  verificationProof: any,
  file: any,

}
