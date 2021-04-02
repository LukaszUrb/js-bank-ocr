import { validator } from "./validator";
import { Constants } from "./constants";
import { FLATTENED_CHAR_MAP } from "./charmap";

enum STATUS {
    error = "ERR",
    illegal = "ILL",
    ambiguous = "AMB"
}
interface IAccount {
    flattenedRawRec: string;
    accountNumber: string;
    illegalDigitCounter: number;
    illegalIndexes: number[];
    invalidCheckSum: boolean;
}

export class reader {
    public static parse(rawRec: string): string {
        let accNumber = "";
        const flattenedDigits = reader.flattenDigits(rawRec);

        flattenedDigits.forEach((e) => {
            const translated: string = FLATTENED_CHAR_MAP[e] || Constants.QUESTION_MARK;
            accNumber += translated;
        });

        return accNumber;
    }

    public static checkErrors(rawRec: string): string {
        const accStat = this.analyze(rawRec);

        if (accStat.illegalDigitCounter) return `${accStat.accountNumber} ${STATUS.illegal}`;

        if (accStat.invalidCheckSum) return `${accStat.accountNumber} ${STATUS.error}`;

        return accStat.accountNumber;
    }

    public static fixAccount(rawRec: string): string {
        const accStat = this.analyze(rawRec);

        if (accStat.illegalDigitCounter) return reader.mutate(accStat, true);

        if (accStat.invalidCheckSum) return reader.mutate(accStat);

        return accStat.accountNumber;
    }

    private static removeNewLines(rawRecInput: string): string {
        return rawRecInput.replace(/\n/g, "");
    }

    private static flattenDigits(rawRecInput: string): string[] {
        const
            rawRec = reader.removeNewLines(rawRecInput),
            flagDigits: string[] = [];

        for (let i = 0; i < Constants.DIGIT_SIZE * Constants.DIGITS_PER_ROW; i = i + Constants.DIGIT_SIZE) {
            flagDigits[i] =
                `${rawRec[i]}${rawRec[i + 1]}${rawRec[i + 2]}` +
                `${rawRec[i + Constants.CHARS_PER_LINE + 0]}${rawRec[i + Constants.CHARS_PER_LINE + 1]}${rawRec[i + Constants.CHARS_PER_LINE + 2]}` +
                `${rawRec[i + 2 * Constants.CHARS_PER_LINE + 0]}${rawRec[i + 2 * Constants.CHARS_PER_LINE + 1]}${rawRec[i + 2 * Constants.CHARS_PER_LINE + 2]}`;
        }

        return flagDigits;
    }

    private static customArrayPrint(arr: string[]): string {
        let output = "[";

        arr.forEach((el) => (output += `'${el}', `));
        output = output.slice(0, output.length - 2);
        output += "]";

        return output;
    }

    private static mapDigitsToIndexes(i: number): number[] {
        const
            numbs: number[] = [],
            startRow0 = i * Constants.DIGIT_SIZE,
            startRow1 = startRow0 + Constants.CHARS_PER_LINE,
            startRow2 = startRow1 + Constants.CHARS_PER_LINE;

        numbs.push(...[startRow0, startRow0 + 1, startRow0 + 2]);
        numbs.push(...[startRow1, startRow1 + 1, startRow1 + 2]);
        numbs.push(...[startRow2, startRow2 + 1, startRow2 + 2]);

        return numbs;
    }

    private static replaceAt(word: string, index: number, replacement: string): string {
        return word.substr(0, index) + replacement + word.substr(index + replacement.length);
    }

    private static analyze(rawRec: string): IAccount {
        const accStat: IAccount = {
            flattenedRawRec: reader.removeNewLines(rawRec),
            accountNumber: reader.parse(rawRec),
            invalidCheckSum: false,
            illegalDigitCounter: 0,
            illegalIndexes: []
        };

        const digits = accStat.accountNumber;

        [...digits].forEach((el, idx) => {
            if (el === Constants.QUESTION_MARK) {
                accStat.illegalIndexes.push(...this.mapDigitsToIndexes(idx));
                accStat.illegalDigitCounter++;
            }
        });

        if (accStat.illegalDigitCounter === 0) accStat.invalidCheckSum = !validator.validate(accStat.accountNumber);

        return accStat;
    }

    private static mutate(accStat: IAccount, readIllegalIndexes = false): string {

        //UNFIXABLE -> Cannot fix more than one invalid character.
        if (accStat.illegalDigitCounter > 1) return `${accStat.accountNumber} ${STATUS.illegal}`;

        const
            possibleAccounts: string[] = [],
            toMutate = readIllegalIndexes ? accStat.illegalIndexes : Array.from(Array(Constants.CHARS_PER_ENTRY).keys());

        toMutate.forEach((idx) => {
            const el = accStat.flattenedRawRec[idx];

            if (el === Constants.SPACE) {
                const
                    mutatedWithUnd = reader.replaceAt(accStat.flattenedRawRec, idx, Constants.UNDERSCORE),
                    mutatedWithPipe = reader.replaceAt(accStat.flattenedRawRec, idx, Constants.PIPE),
                    analyzedUnderscore = reader.analyze(mutatedWithUnd),
                    analyzedPipe = reader.analyze(mutatedWithPipe);

                if (!analyzedUnderscore.invalidCheckSum && analyzedUnderscore.illegalDigitCounter === 0) possibleAccounts.push(analyzedUnderscore.accountNumber);

                if (!analyzedPipe.invalidCheckSum && analyzedPipe.illegalDigitCounter === 0) possibleAccounts.push(analyzedPipe.accountNumber);
            }

            if (el !== Constants.SPACE) {
                const
                    mutated = reader.replaceAt(accStat.flattenedRawRec, idx, Constants.SPACE),
                    analyzed = reader.analyze(mutated);

                if (!analyzed.invalidCheckSum && analyzed.illegalDigitCounter === 0) possibleAccounts.push(analyzed.accountNumber);
            }
        });

        //FIXED
        if (possibleAccounts.length === 1) return possibleAccounts[0];

        //UNFIXABLE -> AMB
        if (possibleAccounts.length > 0) return `${accStat.accountNumber} ${STATUS.ambiguous} ${reader.customArrayPrint(possibleAccounts)}`;

        //UNFIXABLE -> Cannot fix the one bad character.
        if (possibleAccounts.length === 0 && accStat.illegalDigitCounter) return `${possibleAccounts[0]} ${STATUS.illegal}`;

        //UNFIXABLE -> Cannot reach a valid checksum.
        if (possibleAccounts.length === 0 && accStat.invalidCheckSum) return `${possibleAccounts[0]} ${STATUS.error}`;
    }
}
