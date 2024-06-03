import { resolveFileType } from 'friendly-mimes';

export function formatMoney(number) {
    return number.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}
export function getJSONPayloadFromCookie(prefix) {
    try {
        // signed json cookie
        if (!prefix.endsWith("=s:j:")) {
            prefix += "=s:j:"; 
        }

        const foundCookie = decodeURIComponent(document.cookie).split('; ').find(row => row.startsWith(prefix));
        const decoded = decodeURIComponent(foundCookie).replace(prefix, '');
        const payload = decoded.split('.')[0];
        const json = JSON.parse(payload);
        return json;
    } catch (error) {
        console.error('Error parsing JSON payload from cookie:', error);
        return null;
    }
}
export function getExt(fileName) {
    return fileName.slice((Math.max(0, fileName.lastIndexOf(".")) || Infinity) + 1);
}

export async function getFileType(fileName) {
    const ext = getExt(fileName);
    try {
        const fileMime = resolveFileType("." + ext); // get friendly mime data
        return {
            mime: fileMime.mime,
            friendlyName: fileMime.name ? fileMime.name : `${ext} file`,
            extension: ext
        };
    } catch (error) {
        console.error("Failed to get friendly file type:", error);
        return {
            mime: ext,
            friendlyName: `${ext} file`,
            extension: ext
        };
    }
}
