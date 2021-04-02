import { validator } from "../src/validator";

describe("UserStory 2 Unit Tests / ", () => {
    const testCases = [
        {
            input: "711111111",
            output: true
        },
        {
            input: "123456789",
            output: true
        },
        {
            input: "490867715",
            output: true
        },
        {
            input: "888888888",
            output: false
        },
        {
            input: "490067715",
            output: false
        },
        {
            input: "012345678",
            output: false
        }
    ];

    testCases.forEach((test, index) => {
        it(`should validate account number ${test.input}`, () => {
            const result = validator.validate(test.input);
            expect(result).toBe(test.output);
        });
    });
});
