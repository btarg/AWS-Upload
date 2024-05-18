export function prettyPrintBytes(bytes) {
    console.log("bytes to pretty print: " + bytes);

    // Convert string to BigInt
    if (typeof bytes === 'string') {
        bytes = BigInt(bytes);
    }

    // Convert BigInt to a number
    if (typeof bytes === 'bigint') {
        bytes = Number(bytes);
        if (isNaN(bytes)) {
            throw new Error(`BigInt value is too large to be represented as a number.`);
        }
    }

    if (typeof bytes !== 'number') {
        throw new Error(`Invalid argument: ${bytes}. 'bytes' must be a number.`);
    }

    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    let i = 0;
    while (bytes >= 1024) {
        bytes /= 1024;
        ++i;
    }
    return `${bytes.toFixed(2)} ${units[i]}`;
}