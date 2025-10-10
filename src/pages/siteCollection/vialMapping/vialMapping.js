import mapping20251009 from './mapping20251009.js';
import defaultMapping from './defaultMapping.js';

const vialMappingHistory = [
    mapping20251009,
    defaultMapping, // effectiveDate is null
]

/**
 * Get the vial mapping determined by the input date.
 * 
 * The function sorts all known effective dates in descending order (most recent first). It compares the user's input date to each known effective date using UTC epoch time
 * (milliseconds since January 1st, 1970).
 * 
 * It returns the first mapping that has the input date on or before the user's input date. 
 * If the input date precedes all known effective dates,the default mapping is returned.
 * 
 * @param {string} inputDate - Date string in the format "YYYY-MM-DDTHH:MM:SS.SSSZ"
 * @returns {object} - The vial mapping object corresponding to the input date or the default mapping if no effective date matches.
*/
export const getVialMappingByDate = (inputDate) => {
    const isoDate = new Date(inputDate).toISOString().split('T')[0] || '1970-01-01'; // fallback to unix epoch start date if invalid date input

    const sortedMappingHistory = [...vialMappingHistory].sort((a,b) => {
        const dateA = a.effectiveDate ? Date.parse(a.effectiveDate) : 0;
        const dateB = b.effectiveDate ? Date.parse(b.effectiveDate) : 0;

        return dateB - dateA;
    });
    
    const inputTime = Date.parse(isoDate);
    let selectedMapping;

    for (let currentMap of sortedMappingHistory) {
        const currentMapTime = currentMap.effectiveDate 
            ? Date.parse(currentMap.effectiveDate) 
            : 0;
        
        if (inputTime >= currentMapTime) {
            selectedMapping = currentMap;
            break;
        }
    }

    if (!selectedMapping) {
        selectedMapping = sortedMappingHistory.at(-1);
    }

    return selectedMapping;
};