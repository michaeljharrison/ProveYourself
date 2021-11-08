import {tokenize} from '../../server-middleware/tokenize.ts'

const TIMEOUT = 360000
jest.setTimeout(TIMEOUT)

afterAll(() => {
})

test.skip(`It Can Tokenize some generic JSON data`, async () => {
    // Generic Data
    const myData = {
        id: 1,
        name: 'John Smith',
        createdOn: Date.now()
    };

    // Tokenize it.
    try {
        const token = await tokenize(myData);
        console.log(token);
        expect(token).toEqual({})
    } catch(error) {
        console.log(error)
        expect(1).toEqual(0)
    }

})

