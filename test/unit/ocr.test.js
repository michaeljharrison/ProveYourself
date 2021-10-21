import { computerVisionFromFile } from '../../server-middleware/OCR'
import { checkUpload } from '../../server-middleware/poi'
import { POI_STATUS } from '../../store/types'
const Path = require('path')
const fs = require('fs')
const nodeHtmlToImage = require('node-html-to-image')

const LOOP_ITERATIONS = 10
const TIMEOUT = 360000
jest.setTimeout(TIMEOUT)

// eslint-disable-next-line no-extend-native
String.prototype.replaceAt = function (index, replacement) {
  return (
    this.substr(0, index) +
    replacement +
    this.substr(index + replacement.length)
  )
}

function makeID(length, safe) {
  let result = ''
  let characters
  if (safe) {
    characters = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789'
  } else {
    characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  }
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

test.concurrent(
  `It Can OCR ${LOOP_ITERATIONS} good quality codes`,
  async () => {
    // Loop X Times
    const results = { pass: 0, fail: 0, confidenceAvg: 0 }
    for (let i = 0; i < LOOP_ITERATIONS; i++) {
      const code = makeID(20, true)

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
          console.log(`Failed Test Code ${code}`)
          console.log(code)
        } else if (poiResult.verified === POI_STATUS.VERIFIED) {
          results.pass++
        }
      } catch (e) {
        console.error(e)
        expect(false).toBe(true)
      }
    }
    console.log(results)
    expect(results.fail).toEqual(0)
  }
)

test(`It Can OCR ${LOOP_ITERATIONS} poor quality codes`, async () => {
  // Loop X Times
  const results = { pass: 0, fail: 0, confidenceAvg: 0 }
  for (let i = 0; i < LOOP_ITERATIONS; i++) {
    let code, poorlyFormattedCode

    if (i === 0) {
      // Code with an O
      let rndUUID = makeID(20, false)
      rndUUID = rndUUID.replaceAt(0, 'O')
      code = rndUUID.replaceAt(5, 'O')
      poorlyFormattedCode = code.replaceAt(4, ' ').replaceAt(5, ' ')
    } else if (i === 1) {
      // Code with an l
      let rndUUID = makeID(20, false)
      rndUUID = rndUUID.replaceAt(0, 'L')
      code = rndUUID.replaceAt(5, 'L')
      poorlyFormattedCode = code.replaceAt(2, ' ').replaceAt(9, ' ')
    } else if (i === 2) {
      // Code with a g.
      let rndUUID = makeID(20, false)
      rndUUID = rndUUID.replaceAt(0, 'G')
      code = rndUUID.replaceAt(5, 'G')
      poorlyFormattedCode = code.replaceAt(2, ' ')
    } else if (i === 3) {
      let rndUUID = makeID(20, false)
      rndUUID = rndUUID.replaceAt(0, 'G')
      rndUUID = rndUUID.replaceAt(2, 'O')
      code = rndUUID.replaceAt(4, 'L')
      poorlyFormattedCode = code.replaceAt(2, ' ').replaceAt(4, ' ')
    } else {
      code = makeID(20, false)
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
    } catch (e) {
      console.error(e)
      expect(false).toBe(true)
    }
  }
  console.log(results)
  expect(results.fail).toEqual(0)
})
