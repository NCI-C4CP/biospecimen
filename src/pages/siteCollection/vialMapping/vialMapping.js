import mapping20251009 from './mapping20251009.js';
import defaultMapping from './defaultMapping.js';

const vialMappingHistory = [
    mapping20251009,
    defaultMapping, // effectiveDate is null
]

/**
 * Get the vial mapping determined by the input date. Sort the known effective dates in descending order. 
 * Compare the input date to each known effective date via "MMMM-DD-YYYY" string comparison. 
 * Return the first mapping where the input date is on or after the known effective date.
 * If the input date is before all known effective dates, return the default mapping.
 * @param {string} inputDate - Date string in the format "YYYY-MM-DDTHH:MM:SS.SSSZ"
 * @returns {object} - The vial mapping object corresponding to the input date or default mapping if all known effective dates are after the input date
*/
export const getVialMappingByDate = (inputDate) => {
    const isoDate = new Date(inputDate).toISOString().split('T')[0] || '1970-01-01'; // fallback to unix epoch start date if invalid date input

    const sortedMappingHistory = [...vialMappingHistory].sort((a,b) => {
        const dateA = a.effectiveDate ? Date.parse(a.effectiveDate) : 0;
        const dateB = b.effectiveDate ? Date.parse(b.effectiveDate) : 0;

        return dateB - dateA;
    });
    
    let arrayOfDates = [];
    for (let obj of sortedMappingHistory) {
        arrayOfDates.push(obj.effectiveDate);
    }

    let selectedMapping;

    for (let currentMap of sortedMappingHistory) {
        if (isoDate >= currentMap.effectiveDate) {
            selectedMapping = currentMap;
            break;
        }
    }

    if (!selectedMapping) {
        selectedMapping = sortedMappingHistory.at(-1);
    }

    return selectedMapping;
};