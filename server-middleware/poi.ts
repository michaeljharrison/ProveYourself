import { ReadResult } from '@azure/cognitiveservices-computervision/esm/models'
import { POI_STATUS, Verification } from '../store/types'

export function checkUpload(poi: any, ocrResult: ReadResult): Verification {
  let verificationCode: string
  if (poi.initialProof) {
    verificationCode = poi.initialProof.proof.metadata.txnId
      .substring(0, 20)
      .toUpperCase()
  } else {
    // Workaround for test cases with no proof attached.
    verificationCode = poi.substring(0, 20).toUpperCase()
  }

  const { lines } = ocrResult
  let verified = POI_STATUS.FAILED
  let verifiedConfidence = 0
  let lineFound = 0
  let wordFound = 0
  let joiningWords = false
  let joinedWord = ''
  // Iterate through each line
  console.log(lines)
  if (lines) {
    lines.forEach((line, lineNumber) => {
      // Iterate through each word on that line.
      const { words } = line
      words.forEach((word, wordNumber) => {
        if (joinedWord) {
          console.log(`${joinedWord} + ${word.text} === ${verificationCode}`)
        } else {
          console.log(`${word.text} === ${verificationCode}`)
        }

        // First, see if this word is the entire verification code.
        if (word.text === verificationCode) {
          console.log('MATCH')
          verified = POI_STATUS.VERIFIED
          verifiedConfidence = word.confidence
          lineFound = lineNumber
          wordFound = wordNumber
          return {
            verified,
            verifiedConfidence,
            lineFound,
            wordFound,
            verificationCode,
          }
        } else if (joiningWords) {
          // We already have the starting prefix, see if this is a continuation of the code.
          const remainingCode = verificationCode.substring(joinedWord.length)
          if (remainingCode.lastIndexOf(word.text, 0) === 0) {
            // New suffix, add to joined word.
            joinedWord += word.text
            if (joinedWord === verificationCode) {
              // Entire word has been found!
              verified = POI_STATUS.VERIFIED
              verifiedConfidence = word.confidence
              lineFound = lineNumber
              wordFound = wordNumber
              return {
                verified,
                verifiedConfidence,
                lineFound,
                wordFound,
                verificationCode,
              }
            }
          } else {
            // Not a matching suffix, restart.
            joinedWord = ''
            joiningWords = false
          }
        } else if (verificationCode.lastIndexOf(word.text, 0) === 0) {
          // Current word is a starting prefix.
          joiningWords = true
          joinedWord = word.text
        }
      })
    })
  }

  return {
    verified,
    verifiedConfidence,
    lineFound,
    wordFound,
    verificationCode,
  }
}
