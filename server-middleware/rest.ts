

// Imports.
import path from 'path';
import {computerVisionFromURL, computerVisionFromFile} from './OCR'
const express = require('express')
const printedTextSampleURL = 'https://moderatorsampleimages.blob.core.windows.net/samples/sample2.jpg';

// Setup.
const app = express()

// Routes.
app.use(express.json())

app.all('/getJSON', (_req: any, res: any) => {
  res.json({ data: 'data' })
})

app.all('/OCRFromWeb', async (_req: any, res: any) => {
  try {
    const result = await computerVisionFromURL(printedTextSampleURL)
    res.json({data: result})
  } catch(error) {
    res.status(400).send(error);
  }
})

app.all('/OCRFromFile', async (_req: any, res: any) => {
  try {
    const handwrittenImagePath = path.join(__dirname, '/handwritten_text.jpg');
    const result = await computerVisionFromFile(handwrittenImagePath)
    res.json({data: result})
  } catch(error) {
    res.status(400).send(error);
  }
})

module.exports = app