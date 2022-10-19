import { tokenize } from '../../server-middleware/tokenize.ts'

const TIMEOUT = 360000
jest.setTimeout(TIMEOUT)

afterAll(() => {})

test(`It Can Tokenize some generic JSON data`, async () => {
  // Generic Data
  const myData = {
    _id: 1,
    name: 'John Smith',
    code: 'abc-123-abc-123',
    createdOn: Date.now(),
  }

  // Tokenize it.
  try {
    const token = await tokenize(myData)
    console.log(token)
    expect(token.status._code).toEqual(22)
  } catch (error) {
    console.log(error)
    expect(1).toEqual(0)
  }
})
