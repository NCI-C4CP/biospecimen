// function to get the correct vial mapping based on effective date, collection type, and site

/*
This can be done by comparing the input date... with the all the effective dates in the array. 
The only problem is making this better for future changes, making this easier to update and modular.


Input date

We have one or more effectiveDate keys....
Keep null in mapping history


Can we sort the array of objects first and then 
sort array of objects by latests effective date first

*/

import mapping20251004 from './mapping20251004.js';
import mapping20251029 from './mapping20251029.js';
import mapping20250904 from './mapping20250904.js';
import defaultMapping from './defaultMapping.js';

const vialMappingHistory = [
    mapping20251029, // launch date
    mapping20251004,
    mapping20250904,
    defaultMapping,
]

export const getVialMappingByDate = (inputDate) => {
    // console.log("🚀 ~ getVialMapping ~ vialMappingHistory, inputDate:", vialMappingHistory, inputDate)
    // sort array by most recent date first, descending order 
    
    const sortedMappingHistory = [...vialMappingHistory].sort((a,b) => {
        // handle objects with non date values
        const dateA = a.effectiveDate ? new Date(a.effectiveDate) : new Date(0)
        const dateB = b.effectiveDate ? new Date(b.effectiveDate) : new Date(0)
        console.log("dateA and dateB",dateA, "---", dateB)
        // sort from newest to oldest, descending order
        return dateB - dateA;
    });
    
    // create a comparison function for the inputDate and the sorted Mapping history

    let arrayOfDates = []
    for (let obj of sortedMappingHistory) {
        arrayOfDates.push(obj.effectiveDate)
    }
    console.log("arrayOfDates", arrayOfDates)

    console.log(new Date(inputDate))

    let returnMap;

    for (let map of sortedMappingHistory) {
        // dates are already sorted from newest to oldest
        // current map will be compared to see if it's equal to or greater than the 
        // intended input date
        if (inputDate >= map.effectiveDate) {
            console.log(map.effectiveDate, inputDate, "--", map.effectiveDate >= inputDate)
            // assign to previousMap if effective date is 
            // if previous Map 
            // assign the current Map
            returnMap = map;
            break;
        }
    }
    // console.log("return Map value", returnMap)

    if (!returnMap) {
    // If input date is before all known effective dates, use the oldest map
        returnMap = sortedMappingHistory.at(-1); // this will be default
    }
    console.log("Final return Map value", returnMap)
    return returnMap
}

getVialMappingByDate("2023-09-30") // should return default map
getVialMappingByDate("2023-10-01") // should return 2023-10-01 map