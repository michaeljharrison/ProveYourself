import { ReadResult } from '@azure/cognitiveservices-computervision/esm/models'
import { POI_STATUS, Verification } from '../store/types'
import { computerVisionFromFile } from './OCR'

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

  const verified = POI_STATUS.FAILED
  const verifiedConfidence = 0
  const lineFound = 0
  const wordFound = 0
  const joiningWords = false
  const joinedWord = ''
  let result
  const substitutes = [
    { from: 'O', to: '0' },
    { from: '1', to: 'I' },
    // { from: 'g', to: '9' },
    // { from: 'l', to: '1' },
  ]

  if (lines) {
    // Iterate through each line
    lines.forEach((line, lineNumber) => {
      const { words } = line
      // Iterate through each word, searching for a match.
      words.forEach((word, wordNumber) => {
        result = checkWord(
          word,
          joinedWord,
          verificationCode,
          verified,
          verifiedConfidence,
          lineFound,
          wordFound,
          wordNumber,
          lineNumber,
          joiningWords
        )
        // console.log(result)
        if (result && result.verified === POI_STATUS.VERIFIED) {
          return result
        }

        // If no match has been found yet, run through the substitutes array trying to find a correct match.
        substitutes.forEach((sub) => {
          if (word.text.includes(sub.from)) {
            debugger
            result = checkWord(
              {
                text: word.text.replace(RegExp(sub.from, 'g'), sub.to),
                confidence: word.confidence,
              },
              joinedWord,
              verificationCode.replace(RegExp(sub.from, 'g'), sub.to),
              verified,
              verifiedConfidence,
              lineFound,
              wordFound,
              wordNumber,
              lineNumber,
              joiningWords
            )
            // console.log(result)
            if (result && result.verified === POI_STATUS.VERIFIED) {
              return result
            }
          }
          if (word.text.includes(sub.to)) {
            result = checkWord(
              {
                text: word.text.replace(RegExp(sub.to, 'g'), sub.from),
                confidence: word.confidence,
              },
              joinedWord,
              verificationCode.replace(RegExp(sub.to, 'g'), sub.from),
              verified,
              verifiedConfidence,
              lineFound,
              wordFound,
              wordNumber,
              lineNumber,
              joiningWords
            )
            if (result && result.verified === POI_STATUS.VERIFIED) {
              return result
            }
          }
        })
      })
    })
  }
  if (!result || result.verified !== POI_STATUS.VERIFIED) {
    return {
      verified,
      verifiedConfidence,
      lineFound,
      wordFound,
      verificationCode,
    }
  } else {
    return result
  }
}

function checkWord(
  word: { text: string; confidence: number },
  joinedWord: string,
  verificationCode: string,
  verified: POI_STATUS,
  verifiedConfidence: number,
  lineFound: number,
  wordFound: number,
  wordNumber: number,
  lineNumber: number,
  joiningWords: any
) {
  if (joinedWord) {
    console.log(`${joinedWord} + ${word.text} === ${verificationCode}`)
  } else {
    console.log(`${word.text} === ${verificationCode}`)
  }
  if (word.text === verificationCode) {
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
}
