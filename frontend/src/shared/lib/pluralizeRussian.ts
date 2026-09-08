export function pluralizeRussian(value: number, forms: readonly [string, string, string]) {
    const remainder100 = Math.abs(value) % 100
    const remainder10 = remainder100 % 10

    if (remainder100 >= 11 && remainder100 <= 19) {
        return forms[2]
    }

    if (remainder10 === 1) {
        return forms[0]
    }

    if (remainder10 >= 2 && remainder10 <= 4) {
        return forms[1]
    }

    return forms[2]
}