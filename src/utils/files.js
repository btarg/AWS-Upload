import { resolveFileType } from 'friendly-mimes';
import { isValidUrl } from './urls.js';

import path from 'path';

export async function getFriendlyFileType(fileName) {
    const ext = path.extname(fileName); // get file extension
    try {
        const fileMime = resolveFileType(ext); // get friendly mime data
        return {
            mime: fileMime.mime,
            friendlyName: fileMime.name ? fileMime.name : `${ext} file`
        };
    } catch (error) {
        console.error("Failed to get friendly file type:", error);
        return {
            mime: ext,
            friendlyName: `${ext} file`
        };
    }
}
export async function getThumbnailUrl(fileName) {
    let ext = path.extname(fileName); // get file extension
    // remove dot for the url
    if (ext.startsWith(".")) {
        ext = ext.slice(1);
    }
    const thumbnailUrlBase = "https://raw.githubusercontent.com/redbooth/free-file-icons/master/512px";
    const isValid = await isValidUrl(`${thumbnailUrlBase}/${ext}.png`);
    return isValid ? `${thumbnailUrlBase}/${ext}.png` : `${thumbnailUrlBase}/_page.png`;
}