// vial mappings and their effective dates
// This was started for issue#1047
const vialMappingHistory = [
    {
        effectiveDate: null, // default mapping before any effective date
        research: {
            default: {
                '0001': ['10 ml Serum separator tube', 'SST', 'Serum', '10'],
                '0002': ['10 ml Serum separator tube', 'SST', 'Serum', '10'],
                '0003': ['10 ml Vacutainer', 'Lithium Heparin', 'WHOLE BL', '10'],
                '0004': ['10 ml Vacutainer', 'EDTA = K2', 'WHOLE BL', '10'],
                '0005': ['6 ml Vacutainer', 'ACD', 'WHOLE BL', '6'],
                '0006': ['10 ml Vacutainer', 'No Additive', 'Urine', '10'],
                '0007': ['15ml Nalgene jar', 'Crest Alcohol Free', 'Saliva', '15'],
                '0060': ['Streck Tube', 'Streck DNA', 'WHOLE BL', '10'],
            },
        },
        clinical: {
            henryFordHealth: {
                '0001': ['10 ml Serum separator tube', 'SST', 'Serum', '10'],
                '0002': ['10 ml Serum separator tube', 'SST', 'Serum', '10'],
                '0003': ['10 ml Vacutainer', 'Lithium Heparin', 'WHOLE BL', '10'],
                '0004': ['10 ml Vacutainer', 'EDTA = K2', 'WHOLE BL', '10'],
                '0005': ['6 ml Vacutainer', 'ACD', 'WHOLE BL', '6'],
                '0006': ['10 ml Vacutainer', 'No Additive', 'Urine', '10'],
                '0060': ['Streck Tube', 'Streck DNA', 'WHOLE BL', '10'],
            },
            healthPartners: {
                '0001': ['10 ml Serum separator tube', 'SST', 'Serum', '10'],
                '0002': ['10 ml Serum separator tube', 'SST', 'Serum', '10'],
                '0003': ['10 ml Vacutainer', 'Lithium Heparin', 'WHOLE BL', '10'],
                '0004': ['10 ml Vacutainer', 'EDTA = K2', 'WHOLE BL', '10'],
                '0005': ['6 ml Vacutainer', 'ACD', 'WHOLE BL', '6'],
                '0006': ['10 ml Vacutainer', 'No Additive', 'Urine', '10'],
                '0060': ['Streck Tube', 'Streck DNA', 'WHOLE BL', '10'],
            },
            kpCO: {
                '0001': ['5 ml Serum separator tube', 'SST', 'Serum', '5'],
                '0002': ['5 ml Serum separator tube', 'SST', 'Serum', '5'],
                '0011': ['5 ml Serum separator tube', 'SST', 'Serum', '5'],
                '0012': ['5 ml Serum separator tube', 'SST', 'Serum', '5'],
                '0003': ['4 ml Vacutainer', 'Lithium Heparin', 'WHOLE BL', '4'],
                '0013': ['4 ml Vacutainer', 'Lithium Heparin', 'WHOLE BL', '4'],
                '0004': ['4 ml Vacutainer', 'EDTA = K2', 'WHOLE BL', '4'],
                '0014': ['4 ml Vacutainer', 'EDTA = K2', 'WHOLE BL', '4'],
                '0005': ['6 ml Vacutainer', 'ACD', 'WHOLE BL', '6'],
                '0006': ['6 ml Vacutainer', 'No Additive', 'Urine', '6'],
                '0060': ['Streck Tube', 'Streck DNA', 'WHOLE BL', '10'],
            },
            kpGA: {
                '0001': ['5 ml Serum separator tube', 'SST', 'Serum', '5'],
                '0002': ['5 ml Serum separator tube', 'SST', 'Serum', '5'],
                '0011': ['5 ml Serum separator tube', 'SST', 'Serum', '5'],
                '0012': ['5 ml Serum separator tube', 'SST', 'Serum', '5'],
                '0003': ['4.5 ml Vacutainer', 'Lithium Heparin', 'WHOLE BL', '4.5'],
                '0013': ['4.5 ml Vacutainer', 'Lithium Heparin', 'WHOLE BL', '4.5'],
                '0004': ['4 ml Vacutainer', 'EDTA = K2', 'WHOLE BL', '4'],
                '0014': ['4 ml Vacutainer', 'EDTA = K2', 'WHOLE BL', '4'],
                '0005': ['6 ml Vacutainer', 'ACD', 'WHOLE BL', '6'],
                '0006': ['10 ml Vacutainer', 'No Additive', 'Urine', '10'],
                '0060': ['Streck Tube', 'Streck DNA', 'WHOLE BL', '10'],
            },
            kpHI: {
                '0001': ['5 ml Serum separator tube', 'SST', 'Serum', '5'],
                '0002': ['5 ml Serum separator tube', 'SST', 'Serum', '5'],
                '0011': ['5 ml Serum separator tube', 'SST', 'Serum', '5'],
                '0012': ['5 ml Serum separator tube', 'SST', 'Serum', '5'],
                '0003': ['4 ml Vacutainer', 'Lithium Heparin', 'WHOLE BL', '4'],
                '0013': ['4 ml Vacutainer', 'Lithium Heparin', 'WHOLE BL', '4'],
                '0004': ['3 ml Vacutainer', 'EDTA = K2', 'WHOLE BL', '3'],
                '0014': ['3 ml Vacutainer', 'EDTA = K2', 'WHOLE BL', '3'],
                '0024': ['3 ml Vacutainer', 'EDTA = K2', 'WHOLE BL', '3'],
                '0005': ['6 ml Vacutainer', 'ACD', 'WHOLE BL', '6'],
                '0006': ['10 ml Vacutainer', 'No Additive', 'Urine', '10'],
                '0060': ['Streck Tube', 'Streck DNA', 'WHOLE BL', '10'],
            },
            kpNW: {
                '0001': ['3.5 ml Serum separator tube', 'SST', 'Serum', '3.5'],
                '0002': ['3.5 ml Serum separator tube', 'SST', 'Serum', '3.5'],
                '0011': ['3.5 ml Serum separator tube', 'SST', 'Serum', '3.5'],
                '0012': ['3.5 ml Serum separator tube', 'SST', 'Serum', '3.5'],
                '0021': ['3.5 ml Serum separator tube', 'SST', 'Serum', '3.5'],
                '0003': ['4 ml Vacutainer', 'Lithium Heparin', 'WHOLE BL', '4'],
                '0013': ['4 ml Vacutainer', 'Lithium Heparin', 'WHOLE BL', '4'],
                '0004': ['4 ml Vacutainer', 'EDTA = K2', 'WHOLE BL', '4'],
                '0014': ['4 ml Vacutainer', 'EDTA = K2', 'WHOLE BL', '4'],
                '0005': ['6 ml Vacutainer', 'ACD', 'WHOLE BL', '6'],
                '0006': ['10 ml Vacutainer', 'No Additive', 'Urine', '10'],
                '0060': ['Streck Tube', 'Streck DNA', 'WHOLE BL', '10'],
            },
            sanfordHealth: {
                '0001': ['5 mL Serum separator tube', 'SST', 'Serum', '5'],
                '0002': ['5 mL Serum separator tube', 'SST', 'Serum', '5'],
                '0011': ['5 mL Serum separator tube', 'SST', 'Serum', '5'],
                '0012': ['5 mL Serum separator tube', 'SST', 'Serum', '5'],
                '0003': ['4.5 ml Vacutainer', 'Lithium Heparin Separator', 'Plasma', '4.5'],
                '0013': ['4.5 ml Vacutainer', 'Lithium Heparin Separator', 'Plasma', '4.5'],
                '0004': ['3 ml Vacutainer', 'EDTA = K2', 'WHOLE BL', '3'],
                '0014': ['3 ml Vacutainer', 'EDTA = K2', 'WHOLE BL', '3'],
                '0024': ['3 ml Vacutainer', 'EDTA = K2', 'WHOLE BL', '3'],
                '0006': ['10 ml Vacutainer', 'No Additive', 'Urine', '10']
            },
            uOfChicagoMed: {
                '0001': ['10 ml Serum separator tube', 'SST', 'Serum', '10'],
                '0002': ['10 ml Serum separator tube', 'SST', 'Serum', '10'],
                '0003': ['10 ml Vacutainer', 'Lithium Heparin', 'WHOLE BL', '10'],
                '0004': ['10 ml Vacutainer', 'EDTA = K2', 'WHOLE BL', '10'],
                '0060': ['Streck Tube', 'Streck DNA', 'WHOLE BL', '10'],
                '0006': ['10 ml Vacutainer', 'No Additive', 'Urine', '10']
            },
            default: {
                '0001': ['5 ml Serum separator tube', 'SST', 'Serum', '5'],
                '0002': ['5 ml Serum separator tube', 'SST', 'Serum', '5'],
                '0011': ['5 ml Serum separator tube', 'SST', 'Serum', '5'],
                '0012': ['5 ml Serum separator tube', 'SST', 'Serum', '5'],
                '0021': ['5 ml Serum separator tube', 'SST', 'Serum', '5'],
                '0003': ['4 ml Vacutainer', 'Lithium Heparin', 'WHOLE BL', '4'],
                '0013': ['4 ml Vacutainer', 'Lithium Heparin', 'WHOLE BL', '4'],
                '0004': ['4 ml Vacutainer', 'EDTA = K2', 'WHOLE BL', '4'],
                '0014': ['4 ml Vacutainer', 'EDTA = K2', 'WHOLE BL', '4'],
                '0024': ['4 ml Vacutainer', 'EDTA = K2', 'WHOLE BL', '4'],
                '0005': ['6 ml Vacutainer', 'ACD', 'WHOLE BL', '6'],
                '0006': ['10 ml Vacutainer', 'No Additive', 'Urine', '10'],
                '0007': ['15ml Nalgene jar', 'Crest Alcohol Free', 'Saliva', '15'],
                '0060': ['Streck Tube', 'Streck DNA', 'WHOLE BL', '10'],
            },
        }
    },
    {
        effectiveDate: "2023-10-01",
        research: {
            default: {
                "0001": ["10 ml Serum separator tube", "SST", "Serum", "10"],
                "0002": ["10 ml Serum separator tube", "SST", "Serum", "10"],
                "0003": ["10 ml Vacutainer", "Lithium Heparin", "WHOLE BL", "10"],
                "0004": ["10 ml Vacutainer", "EDTA = K2", "WHOLE BL", "10"],
                "0005": ["6 ml Vacutainer", "ACD", "WHOLE BL", "6"],
                "0006": ["10 ml Vacutainer", "No Additive", "Urine", "10"],
                "0007": ["15ml Nalgene jar", "Crest Alcohol Free", "Saliva", "15"],
                "0060": ["Streck Tube", "Streck Nucleic Acid", "WHOLE BL", "10"],
            },
        },
        clinical: {
            henryFordHealth: {
                "0001": ["10 ml Serum separator tube", "SST", "Serum", "10"],
                "0002": ["10 ml Serum separator tube", "SST", "Serum", "10"],
                "0003": ["10 ml Vacutainer", "Lithium Heparin", "WHOLE BL", "10"],
                "0004": ["10 ml Vacutainer", "EDTA = K2", "WHOLE BL", "10"],
                "0005": ["6 ml Vacutainer", "ACD", "WHOLE BL", "6"],
                "0006": ["10 ml Vacutainer", "No Additive", "Urine", "10"],
                "0060": ["Streck Tube", "Streck Nucleic Acid", "WHOLE BL", "10"],
            },
            healthPartners: {
                "0001": ["10 ml Serum separator tube", "SST", "Serum", "10"],
                "0002": ["10 ml Serum separator tube", "SST", "Serum", "10"],
                "0003": ["10 ml Vacutainer", "Lithium Heparin", "WHOLE BL", "10"],
                "0004": ["10 ml Vacutainer", "EDTA = K2", "WHOLE BL", "10"],
                "0005": ["6 ml Vacutainer", "ACD", "WHOLE BL", "6"],
                "0006": ["10 ml Vacutainer", "No Additive", "Urine", "10"],
                "0060": ["Streck Tube", "Streck Nucleic Acid", "WHOLE BL", "10"],
            },
            kpCO: {
                "0001": ["5 ml Serum separator tube", "SST", "Serum", "5"],
                "0002": ["5 ml Serum separator tube", "SST", "Serum", "5"],
                "0011": ["5 ml Serum separator tube", "SST", "Serum", "5"],
                "0012": ["5 ml Serum separator tube", "SST", "Serum", "5"],
                "0003": ["4 ml Vacutainer", "Lithium Heparin", "WHOLE BL", "4"],
                "0013": ["4 ml Vacutainer", "Lithium Heparin", "WHOLE BL", "4"],
                "0004": ["4 ml Vacutainer", "EDTA = K2", "WHOLE BL", "4"],
                "0014": ["4 ml Vacutainer", "EDTA = K2", "WHOLE BL", "4"],
                "0005": ["6 ml Vacutainer", "ACD", "WHOLE BL", "6"],
                "0006": ["6 ml Vacutainer", "No Additive", "Urine", "6"],
                "0060": ["Streck Tube", "Streck DNA", "WHOLE BL", "10"],
            },
            kpGA: {
                "0001": ["5 ml Serum separator tube", "SST", "Serum", "5"],
                "0002": ["5 ml Serum separator tube", "SST", "Serum", "5"],
                "0011": ["5 ml Serum separator tube", "SST", "Serum", "5"],
                "0012": ["5 ml Serum separator tube", "SST", "Serum", "5"],
                "0003": ["4.5 ml Vacutainer", "Lithium Heparin", "WHOLE BL", "4.5"],
                "0013": ["4.5 ml Vacutainer", "Lithium Heparin", "WHOLE BL", "4.5"],
                "0004": ["4 ml Vacutainer", "EDTA = K2", "WHOLE BL", "4"],
                "0014": ["4 ml Vacutainer", "EDTA = K2", "WHOLE BL", "4"],
                "0005": ["6 ml Vacutainer", "ACD", "WHOLE BL", "6"],
                "0006": ["10 ml Vacutainer", "No Additive", "Urine", "10"],
                "0060": ["Streck Tube", "Streck DNA", "WHOLE BL", "10"],
            },
            kpHI: {
                "0001": ["5 ml Serum separator tube", "SST", "Serum", "5"],
                "0002": ["5 ml Serum separator tube", "SST", "Serum", "5"],
                "0011": ["5 ml Serum separator tube", "SST", "Serum", "5"],
                "0012": ["5 ml Serum separator tube", "SST", "Serum", "5"],
                "0003": ["4 ml Vacutainer", "Lithium Heparin", "WHOLE BL", "4"],
                "0013": ["4 ml Vacutainer", "Lithium Heparin", "WHOLE BL", "4"],
                "0004": ["3 ml Vacutainer", "EDTA = K2", "WHOLE BL", "3"],
                "0014": ["3 ml Vacutainer", "EDTA = K2", "WHOLE BL", "3"],
                "0024": ["3 ml Vacutainer", "EDTA = K2", "WHOLE BL", "3"],
                "0005": ["6 ml Vacutainer", "ACD", "WHOLE BL", "6"],
                "0006": ["10 ml Vacutainer", "No Additive", "Urine", "10"],
                "0060": ["Streck Tube", "Streck DNA", "WHOLE BL", "10"],
            },
            kpNW: {
                "0001": ["3.5 ml Serum separator tube", "SST", "Serum", "3.5"],
                "0002": ["3.5 ml Serum separator tube", "SST", "Serum", "3.5"],
                "0011": ["3.5 ml Serum separator tube", "SST", "Serum", "3.5"],
                "0012": ["3.5 ml Serum separator tube", "SST", "Serum", "3.5"],
                "0021": ["3.5 ml Serum separator tube", "SST", "Serum", "3.5"],
                "0003": ["4 ml Vacutainer", "Lithium Heparin", "WHOLE BL", "4"],
                "0013": ["4 ml Vacutainer", "Lithium Heparin", "WHOLE BL", "4"],
                "0004": ["4 ml Vacutainer", "EDTA = K2", "WHOLE BL", "4"],
                "0014": ["4 ml Vacutainer", "EDTA = K2", "WHOLE BL", "4"],
                "0005": ["6 ml Vacutainer", "ACD", "WHOLE BL", "6"],
                "0006": ["10 ml Vacutainer", "No Additive", "Urine", "10"],
                "0060": ["Streck Tube", "Streck DNA", "WHOLE BL", "10"],
            },
            sanfordHealth: {
                "0001": ["5 mL Serum separator tube", "SST", "Serum", "5"],
                "0002": ["5 mL Serum separator tube", "SST", "Serum", "5"],
                "0011": ["5 mL Serum separator tube", "SST", "Serum", "5"],
                "0012": ["5 mL Serum separator tube", "SST", "Serum", "5"],
                "0003": [
                    "4.5 ml Vacutainer",
                    "Lithium Heparin Separator",
                    "Plasma",
                    "4.5",
                ],
                "0013": [
                    "4.5 ml Vacutainer",
                    "Lithium Heparin Separator",
                    "Plasma",
                    "4.5",
                ],
                "0004": ["3 ml Vacutainer", "EDTA = K2", "WHOLE BL", "3"],
                "0014": ["3 ml Vacutainer", "EDTA = K2", "WHOLE BL", "3"],
                "0024": ["3 ml Vacutainer", "EDTA = K2", "WHOLE BL", "3"],
                "0006": ["10 ml Vacutainer", "No Additive", "Urine", "10"],
            },
            uOfChicagoMed: {
                "0001": ["10 ml Serum separator tube", "SST", "Serum", "10"],
                "0002": ["10 ml Serum separator tube", "SST", "Serum", "10"],
                "0003": ["10 ml Vacutainer", "Lithium Heparin", "WHOLE BL", "10"],
                "0004": ["10 ml Vacutainer", "EDTA = K2", "WHOLE BL", "10"],
                "0060": ["Streck Tube", "Streck DNA", "WHOLE BL", "10"],
                "0006": ["10 ml Vacutainer", "No Additive", "Urine", "10"],
            },
            default: {
                "0001": ["5 ml Serum separator tube", "SST", "Serum", "5"],
                "0002": ["5 ml Serum separator tube", "SST", "Serum", "5"],
                "0011": ["5 ml Serum separator tube", "SST", "Serum", "5"],
                "0012": ["5 ml Serum separator tube", "SST", "Serum", "5"],
                "0021": ["5 ml Serum separator tube", "SST", "Serum", "5"],
                "0003": ["4 ml Vacutainer", "Lithium Heparin", "WHOLE BL", "4"],
                "0013": ["4 ml Vacutainer", "Lithium Heparin", "WHOLE BL", "4"],
                "0004": ["4 ml Vacutainer", "EDTA = K2", "WHOLE BL", "4"],
                "0014": ["4 ml Vacutainer", "EDTA = K2", "WHOLE BL", "4"],
                "0024": ["4 ml Vacutainer", "EDTA = K2", "WHOLE BL", "4"],
                "0005": ["6 ml Vacutainer", "ACD", "WHOLE BL", "6"],
                "0006": ["10 ml Vacutainer", "No Additive", "Urine", "10"],
                "0007": ["15ml Nalgene jar", "Crest Alcohol Free", "Saliva", "15"],
                "0060": ["Streck Tube", "Streck DNA", "WHOLE BL", "10"],
            },
        },
    },
    {
        effectiveDate: "2025-10-04", // 
        dummyData: "2025-10-04"
    },
    {
        effectiveDate: "2025-09-04", // 
        dummyData: "2025-09-04"
    },
    {
        effectiveDate: "2025-11-04", // 
        dummyData: "2025-11-04"
    },

];

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

const getVialMapping = (vialMappingHistory, inputDate) => {
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
}

getVialMapping(vialMappingHistory, "2023-09-30") // should return default map
getVialMapping(vialMappingHistory, "2023-10-01") // should return 2023-10-01 map