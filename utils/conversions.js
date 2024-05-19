function numberFromPSQL(input) {
    var converted = input;

    // Convert string to BigInt
    if (typeof converted === 'string') {
        converted = BigInt(input);
    }

    // Convert BigInt to a number
    if (typeof converted === 'bigint') {
        converted = Number(converted);
        if (isNaN(converted)) {
            reject({ error: "BigInt value is too large to be represented as a number.", statusCode: 403 });
        }
    }
    return converted;
}
module.exports = numberFromPSQL;