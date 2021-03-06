// Imports
// import fs from 'fs';
// import https from 'https';
import path from 'path'
import fs from 'fs'
const sleep = require('util').promisify(setTimeout)
const createReadStream = require('fs').createReadStream
const ComputerVisionClient =
  require('@azure/cognitiveservices-computervision').ComputerVisionClient
const ApiKeyCredentials = require('@azure/ms-rest-js').ApiKeyCredentials

// const multiLingualTextURL = 'https://raw.githubusercontent.com/Azure-Samples/cognitive-services-sample-data-files/master/ComputerVision/Images/MultiLingual.png';
// const mixedMultiPagePDFURL = 'https://raw.githubusercontent.com/Azure-Samples/cognitive-services-sample-data-files/master/ComputerVision/Images/MultiPageHandwrittenForm.pdf';

// Status strings returned from Read API. NOTE: CASING IS SIGNIFICANT.
// Before Read 3.0, these are "Succeeded" and "Failed"
const STATUS_SUCCEEDED = 'succeeded'
const STATUS_FAILED = 'failed'

// Setup.
const computerVisionClient = new ComputerVisionClient(
  new ApiKeyCredentials({
    inHeader: { 'Ocp-Apim-Subscription-Key': process.env.AZURE_CV_KEY_ONE },
  }),
  process.env.AZURE_CV_ENDPOINT
)
const options = {
  language: 'en',
}

async function readTextFromFile(client: any, filePath: string) {
  // Call API, returns a Promise<Models.readInStreamResponse>
  if (fs.existsSync(filePath)) {
    // file exists
  } else {
    // console.log('File doesnt exist');
  }
  const streamResponse = await client
    .readInStream(() => createReadStream(filePath), options)
    .then((response: any) => {
      return response
    })
    .catch((error: Error) => {
      console.error(error)
      return error
    })

  // Get operation location from response, so you can get the operation ID.
  const operationLocationLocal = streamResponse.operationLocation
  // Get the operation ID at the end of the URL
  const operationIdLocal = operationLocationLocal.substring(
    operationLocationLocal.lastIndexOf('/') + 1
  )

  // Wait for read recognition to complete
  // result.status is initially undefined, since it's the result of read
  while (true) {
    const readOpResult = await client
      .getReadResult(operationIdLocal)
      .then((result: any) => {
        return result
      })
    if (readOpResult.status === STATUS_FAILED) {
      // console.log('The Read File operation has failed.')
      break
    }
    if (readOpResult.status === STATUS_SUCCEEDED) {
      // console.log('The Read File operation was a success.');
      // console.log();
      // console.log('Read File local image result:');
      // Print the text captured

      // Looping through: pages of result from readResults[], then Line[]
      for (const textRecResult of readOpResult.analyzeResult.readResults) {
        for (const line of textRecResult.lines) {
          // console.log(line.text)
        }
      }
      return readOpResult.analyzeResult.readResults // Return the first page of result. Replace [0] with the desired page if this is a multi-page file such as .pdf or .tiff.
    }
    await sleep(1000)
  }
}

// Prints all text from Read result
function printRecText(readResults: Array<any>) {
  // console.log('Recognized text:');
  for (const page in readResults) {
    if (readResults.length > 1) {
      // console.log(`==== Page: ${page}`);
    }
    const result = readResults[page]
    if (result.lines.length) {
      for (const line of result.lines) {
        // console.log(line.words.map((w:any)  => w.text).join(' '));
      }
    } else {
      // console.log('No recognized text.');
    }
  }
}

export async function computerVisionFromFile(filePath: any) {
  // Recognize text in printed image from a URL
  try {
    // console.log('Read printed text from File...', path.basename(filePath));
    // Call API, returns a Promise<Models.readInStreamResponse>
    const printedResult = await readTextFromFile(computerVisionClient, filePath)
    printRecText(printedResult)

    return printedResult
  } catch (error) {
    return error
  }
}
