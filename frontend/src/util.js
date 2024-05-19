import prettyBytes from 'pretty-bytes';
// Convert Number from the formal PostgreSQL uses.
// I HATE that I have to rewrite this because VueJS doesn't want me to use "require"
// Like, why the fuck not? Let me require shit VueJS!
export function numberFromPSQL(input) {
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

export function prettyBytesPSQL(bytes) {
    const converted = numberFromPSQL(bytes);
    return prettyBytes(converted);
}