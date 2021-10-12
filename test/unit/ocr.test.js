import { computerVisionFromFile } from '../../server-middleware/OCR'
import { checkUpload } from '../../server-middleware/poi'
import { POI_STATUS } from '../../store/types'
const Path = require('path')
const fs = require('fs')
const nodeHtmlToImage = require('node-html-to-image')

const LOOP_ITERATIONS = 20
const TIMEOUT = 120000
jest.setTimeout(TIMEOUT)

// eslint-disable-next-line no-extend-native
String.prototype.replaceAt = function (index, replacement) {
  return (
    this.substr(0, index) +
    replacement +
    this.substr(index + replacement.length)
  )
}

function makeID(length) {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

afterAll(() => {
  // Clean up all created files.
  fs.readdir(__dirname, (err, files) => {
    if (err) throw err

    for (const file of files) {
      if (file.match(/.\.png/)) {
        fs.unlink(Path.join(__dirname, file), (err) => {
          if (err) throw err
        })
      }
    }
  })
})

test(`It Can OCR ${LOOP_ITERATIONS} good quality codes`, async () => {
  // Loop X Times
  const results = { pass: 0, fail: 0, confidenceAvg: 0 }
  for (let i = 0; i < LOOP_ITERATIONS; i++) {
    let code
    if (i === 0) {
      // Code with an O
      let rndUUID = makeID(20)
      rndUUID = rndUUID.replaceAt(0, 'O')
      rndUUID = rndUUID.replaceAt(5, 'O')
      code = rndUUID
    } else if (i === 1) {
      // Code with an l
      let rndUUID = makeID(20)
      rndUUID = rndUUID.replaceAt(0, 'L')
      rndUUID = rndUUID.replaceAt(5, 'L')
      code = rndUUID
    } else if (i === 2) {
      // Code with a g.
      let rndUUID = makeID(20)
      rndUUID = rndUUID.replaceAt(0, 'G')
      rndUUID = rndUUID.replaceAt(5, 'G')
      code = rndUUID
    } else if (i === 3) {
      let rndUUID = makeID(20)
      rndUUID = rndUUID.replaceAt(0, 'G')
      rndUUID = rndUUID.replaceAt(2, 'O')
      rndUUID = rndUUID.replaceAt(4, 'L')
      code = rndUUID
    } else {
      code = makeID(20)
    }

    try {
      await nodeHtmlToImage({
        output: Path.join(__dirname, `./${code}.png`),
        html: `<html  style="
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      "><body    style="
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      "><h1 style="font-family: 'Inconsolata', sans-serif;">${code}</h1></body></html>`,
        options: {
          puppeteerArgs: {
            headless: false,
            args: ['--no-sandbox'],
            executablePath: '/usr/local/bin/chromium',
          },
        },
      })
      const filePath = Path.join(__dirname, `${code}.png`)

      const ocrResult = await computerVisionFromFile(filePath)

      const poiResult = await checkUpload(code, ocrResult[0])
      if (poiResult.verified === POI_STATUS.FAILED) {
        results.fail++
        console.log('Failed Test Code')
        console.log(code)
        console.log(poiResult)
      } else if (poiResult.verified === POI_STATUS.VERIFIED) {
        results.pass++
      }
      results.confidenceAvg =
        (results.confidenceAvg + poiResult.verifiedConfidence) / i + 1
    } catch (e) {
      console.error(e)
      expect(false).toBe(true)
    }
  }
  console.log(results)
  expect(results.fail).toEqual(0)
  expect(results.confidenceAvg).toBeGreaterThan(0.95)
})

test.skip(`It Can OCR ${LOOP_ITERATIONS} poor quality codes`, async () => {
  // Loop X Times
  const results = { pass: 0, fail: 0, confidenceAvg: 0 }
  for (let i = 0; i < LOOP_ITERATIONS; i++) {
    let code, poorlyFormattedCode

    if (i === 0) {
      // Code with an O
      let rndUUID = makeID(20)
      rndUUID = rndUUID.replaceAt(0, 'O')
      rndUUID = rndUUID.replaceAt(5, 'O')
      code = rndUUID
      poorlyFormattedCode = code.replaceAt(4, ' ').replaceAt(5, ' ')
    } else if (i === 1) {
      // Code with an l
      let rndUUID = makeID(20)
      rndUUID = rndUUID.replaceAt(0, 'L')
      rndUUID = rndUUID.replaceAt(5, 'L')
      code = rndUUID
      poorlyFormattedCode = code.replaceAt(2, ' ').replaceAt(9, ' ')
    } else if (i === 2) {
      // Code with a g.
      let rndUUID = makeID(20)
      rndUUID = rndUUID.replaceAt(0, 'G')
      rndUUID = rndUUID.replaceAt(5, 'G')
      poorlyFormattedCode = code.replaceAt(2, ' ')
      code = rndUUID
    } else if (i === 3) {
      let rndUUID = makeID(20)
      rndUUID = rndUUID.replaceAt(0, 'G')
      rndUUID = rndUUID.replaceAt(2, 'O')
      rndUUID = rndUUID.replaceAt(4, 'L')
      poorlyFormattedCode = code.replaceAt(2, ' ').replaceAt(4, ' ')
      code = rndUUID
    } else {
      code = makeID(20)
      poorlyFormattedCode = code
    }

    try {
      await nodeHtmlToImage({
        output: Path.join(__dirname, `./${code}.png`),
        html: `<html  style="
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      "><body    style="
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      "><h1 style="font-family: 'Inconsolata', sans-serif;">${poorlyFormattedCode}</h1></body></html>`,
      })
      const filePath = Path.join(__dirname, `${code}.png`)

      const ocrResult = await computerVisionFromFile(filePath)

      const poiResult = await checkUpload(code, ocrResult[0])
      if (poiResult.verified === POI_STATUS.FAILED) {
        results.fail++
      } else if (poiResult.verified === POI_STATUS.VERIFIED) {
        results.pass++
      }
      results.confidenceAvg =
        (results.confidenceAvg + poiResult.verifiedConfidence) / i + 1
    } catch (e) {
      console.error(e)
      expect(false).toBe(true)
    }
  }
  console.log(results)
  expect(results.fail).toEqual(0)
  expect(results.confidenceAvg).toBeGreaterThan(0.95)
})
