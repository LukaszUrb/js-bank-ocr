export class validator {
    public static validate(account: string): boolean {
        if (isNaN(+account)) return false;

        let
            currentResult = 0,
            pointer = 9;

        [...account].forEach((num) => {
            currentResult += +num * pointer--;
        });

        return currentResult % 11 === 0;
    }
}
