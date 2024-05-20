import { resolveFileType } from 'friendly-mimes';
import { isValidUrl } from './urls.js';

export async function getExtension(fileName) {
    const ext = fileName
        .split('.')
        .filter(Boolean) // removes empty extensions (e.g. `filename...txt`)
        .slice(1)
        .join('.');
    return ext;
}
export async function getFriendlyFileType(fileName) {
    const ext = await getExtension(fileName); // get file extension
    const fileMime = resolveFileType("." + ext); // get friendly mime data
    return fileMime.name ? fileMime.name : fileMime.mime;
}
export async function getThumbnailUrl(fileName) {
    const ext = await getExtension(fileName); // get file extension
    const thumbnailUrlBase = "https://raw.githubusercontent.com/redbooth/free-file-icons/master/512px";
    const isValid = await isValidUrl(`${thumbnailUrlBase}/${ext}.png`);
    return isValid ? `${thumbnailUrlBase}/${ext}.png` : `${thumbnailUrlBase}/_page.png`;
}