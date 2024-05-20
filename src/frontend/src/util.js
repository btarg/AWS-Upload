import prettyBytes from 'pretty-bytes';
import { numberFromPSQL } from '../../utils/conversions.js';

export function prettyBytesPSQL(bytes) {
    const converted = numberFromPSQL(bytes);
    return prettyBytes(converted);
}