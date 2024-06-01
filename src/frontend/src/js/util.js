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