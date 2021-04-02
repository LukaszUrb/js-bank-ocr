import { reader } from "../src/reader";

describe("UserStory 3 Unit Tests / ", () => {
    const testCases = [
        {
            input: `
 _  _  _  _  _  _  _  _    
| || || || || || || ||_   |
|_||_||_||_||_||_||_| _|  |`,
            output: "000000051"
        },
        {
            input: `
    _  _  _  _  _  _     _ 
|_||_|| || ||_   |  |  | _ 
  | _||_||_||_|  |  |  | _|`,
            output: "49006771? ILL"
        },
        {
            input: `
    _  _     _  _  _  _  _ 
  | _| _||_| _ |_   ||_||_|
  ||_  _|  | _||_|  ||_| _ `,
            output: "1234?678? ILL"
        },
        {
            input: `
                           
  |  |  |  |  |  |  |  |  |
  |  |  |  |  |  |  |  |  |`,
            output: "111111111 ERR"
        }
    ];

    testCases.forEach((test, index) => {
        it(`should parse account number ${test.input}`, () => {
            const result = reader.checkErrors(test.input);
            expect(result).toBe(test.output);
        });
    });
});
