export function dateToString(originalDate) {
    let dateString = `(never)`;
    const dateObj = new Date(originalDate);

    if (originalDate && dateObj) {
        // format the date as "24th October 2024, 12:00:00"

        // Check if dateObj is an invalid date or the Unix epoch
        if (isNaN(dateObj.getTime()) || dateObj.getTime() === 0) {
            return dateString;
        }

        const day = dateObj.toLocaleDateString('en-GB', { day: 'numeric' });
        const month = dateObj.toLocaleDateString('en-GB', { month: 'long' });
        const year = dateObj.toLocaleDateString('en-GB', { year: 'numeric' });
        const time = dateObj.toLocaleTimeString('en-GB');

        const ordinal = (day === '1' || day === '21' || day === '31') ? 'st' :
            (day === '2' || day === '22') ? 'nd' :
                (day === '3' || day === '23') ? 'rd' : 'th';

        dateString = `${day}${ordinal} ${month} ${year}, ${time}`
    }
    return dateString;
}