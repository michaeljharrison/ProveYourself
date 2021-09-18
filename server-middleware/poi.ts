import { ReadResult } from "@azure/cognitiveservices-computervision/esm/models";
import { POI, POI_STATUS, Verification } from "../store/types";


export function checkUpload(poi: POI, ocrResult: ReadResult) : Verification{
  const verificationCode = poi.requestProof.proof.metadata.txnId.substring(0, 20)
  const {lines} = ocrResult;
  let verified = POI_STATUS.FAILED;
  let verifiedConfidence = 0;
  let lineFound = 0;
  let wordFound = 0;
  // Iterate through each line
  lines.forEach((line, lineNumber) => {
    // Iterate through each word on that line.
    const {words} = line;
    words.forEach((word, wordNumber) => {
      if(word.text === verificationCode) {
        verified = POI_STATUS.VERIFIED;
        verifiedConfidence = word.confidence
        lineFound = lineNumber;
        wordFound = wordNumber;
      }
    })
  })
  return {verified, verifiedConfidence, lineFound, wordFound};
}