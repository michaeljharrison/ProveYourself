import { createHash } from 'crypto'
import { tokenize } from '../../server-middleware/tokenize.ts'

const TIMEOUT = 360000
jest.setTimeout(TIMEOUT)

afterAll(() => {})

test(`It Can Tokenize some generic JSON data`, async () => {
  // Generic Data
  const myData = createHash('sha256').update('abc').digest('hex')

  // Tokenize it.
  try {
    const token = await tokenize(myData)
    console.log(token)
    expect(token.tokenID).toBeGreaterThan(0)
  } catch (error) {
    console.log(error)
    expect(1).toEqual(0)
  }
})
