import { showAnimation, hideAnimation, getParticipantsByKitStatus, convertISODateTime, keyToNameObj } from "../../shared.js";
import { displayKitStatusReportsHeader } from "./participantSelectionHeaders.js";
import { nonUserNavBar } from "../../navbar.js";
import { activeHomeCollectionNavbar } from "./homeCollectionNavbar.js";
import { conceptIds } from "../../fieldToConceptIdMapping.js";


export const displayKitStatusReportsScreen = async (auth, route, status) => {
    console.log("auth", auth, "----","route", route);
    const user = auth.currentUser;
    if (!user) return;
    const username = user.displayName ? user.displayName : user.email;
    kitStatusTemplate(username, auth, route, status); // rename to adjust for different kitStatus reports || createKitStatusReportsTemplate
    // kitStatusReportsTemplate(username, auth, route, status);
};



// rename 
const kitStatusTemplate = async (name , route, status ) => {
    // add logic here to determine the status of kit and what to load
    console.log("Status On load --->", status);

    /*
    Kit Status Single Search 
    */ 
   let reportsData;

    console.log("status", status)
    if (status) {
        showAnimation();
        const kitStatusConceptId = kitStatusSelectionOptions[status]?.conceptId;
        console.log("🚀 ~ kitStatusTemplate ~ kitStatusConceptId:", kitStatusConceptId)
        const response = await getParticipantsByKitStatus(kitStatusConceptId);
        reportsData = response.data; // rename to adjust for different kitStatus reports
        // console.log("🚀 ~ kitStatusTemplate ~ participants:", reportsData)
        hideAnimation();
    }
    
    console.log("🚀 ~ kitStatusTemplate ~ reportsData:", reportsData);
    const template = `
                    ${displayKitStatusReportsHeader()}

                    <!-- Kit Status Table Container -->
                    <div class="container-fluid">
                        <div id="root root-margin">
                            <div class="table">
                            <!-- Kit Status Table Container -->
                                ${displayKitStatusHeader(status)}
                                ${displayKitStatusTable(reportsData, status)}
                            </div>
                        </div>
                    </div>
                    `;
                    
    document.getElementById("contentBody").innerHTML = template;
    document.getElementById("navbarNavAltMarkup").innerHTML = nonUserNavBar(name);
    activeHomeCollectionNavbar();
    handleKitStatusSelectionDropdown();
    console.log("Object of kit status", kitStatusSelectionOptions); 
};

const displayKitStatusTable =  (reportsData, status) => { // rename to create
    

    return `
            <div class="sticky-header" style="overflow:auto;">
                <table class="table table-bordered" id="participantData" style="margin-bottom:1rem; 
                    position:relative; border-collapse:collapse;">
                    <thead> 
                        <tr style="top: 0; position: sticky;">
                        <!-- Create function to manipulate the display headers here  -->
                            ${createColumnHeaders(status)}
                        </tr>
                    </thead>   
                    <tbody>
                        ${createColumnRows(reportsData, status)}
                    </tbody>
                </table>
            </div>
            `;
};

const displayKitStatusHeader = (status) => { 
    // console.log("statusHeaders", statusHeaders, "status", status)
    // console.log("status || !statusHeaders.status", status, statusHeaders[status], )
    if (!status || !kitStatusSelectionOptions[status]?.headerName) return '';
    return `
        <h3 style="text-align: center; margin: 0 0 1rem;">
            ${kitStatusSelectionOptions[status].headerName}
        </h3>
    `;
} 

const createColumnHeaders = (status) => {
    // Using status determine what headers to display
    let columnHeaders;

    if (!status) return `Please select a kit status report from the dropdown to view the report.`;
    
    // console.log(kitStatusSelectionOptions[status]?.columnHeaders)
    // const columnHeadersArray = kitStatusSelectionOptions[status]?.columnHeaders;

    // if (columnHeadersArray) { 
    //     columnHeaders = columnHeadersArray.map(header => {
    //         return `<th class="sticky-row" style="background-color: #f7f7f7;" scope="col">${header}</th>`;
    //     }).join('');
    // }

    // return columnHeaders;

    const columns = kitStatusSelectionOptions[status].columns;

    return columns.map(col => 
        `<th class="sticky-row" style="background-color: #f7f7f7;" scope="col">${col.header}</th>`
    ).join('');
};

/*
    showAnimation();

    // different kit status reports logic herere



*/

/**
 * TODO: Update comments later
 * 
 * Returns rows for the shipped kits table
 * @param {Array} reportsData - an array of custom objects with values from participants and kitAssembly collection that have a shipped kit status
 * @returns {string} - a string of table rows
*/
const createColumnRows = (reportsData, status) => {
    
    let template = ``;
    if (!reportsData || !Array.isArray(reportsData)) {
        return template;
    }

    const columns = kitStatusSelectionOptions[status].columns;

    for (const dataRow of reportsData) {
        template += `<tr class="row-color-enrollment-dark participantRow">`;

        // Loop through the column configuration
        for (const column of columns) {

            let displayValue;

            if (column.renderer) {
                displayValue = column.renderer(dataRow);
            } else {
                displayValue = dataRow[column.key];
            }
            
            template += `<td>${displayValue ?? ''}</td>`;
        }
        template += `</tr>`;
    }

    return template;

    // for (const participantObj of shippedKitStatusParticipantsArray) {

    // const connectID = participantObj["Connect_ID"];
    // const healthcareProvider = keyToNameObj[participantObj[conceptIds.healthcareProvider]];
    // const mouthwashShippedDate = convertISODateTime(participantObj[conceptIds.shippedDateTime]).split(/\s+/)[0];
    // const supplyKitId = participantObj[conceptIds.supplyKitId];
    // const collectionCardId = participantObj[conceptIds.collectionCardId];
    // const supplyKitTrackingNum = participantObj[conceptIds.supplyKitTrackingNum];
    // const returnKitTrackingNum = participantObj[conceptIds.returnKitTrackingNum];
    // const mouthwashSurveyStatus = convertSurveyCompletionStatus(participantObj[conceptIds.mouthwashSurveyCompletionStatus]);
    // const kitIteration = participantObj['kitIteration'];

    // template += `
    //             <tr class="row-color-enrollment-dark participantRow">
    //                 <td>${connectID}</td>
    //                 <td>${healthcareProvider}</td>
    //                 <td>${mouthwashShippedDate}</td>
    //                 <td>${supplyKitId}</td>
    //                 <td>${collectionCardId}</td>
    //                 <td>${supplyKitTrackingNum}</td>
    //                 <td>${returnKitTrackingNum}</td>
    //                 <td>${mouthwashSurveyStatus}</td>
    //                 <td>${kitIteration}</td>
    //             </tr>
    //             `;
    // }
    // return template;
    
};

/**
 * Returns the survey completion status (Not Started, In Progress, Completed) based on the status value
 * @param {number} status - the concept Id status value of the mouthwash survey
*/
const convertSurveyCompletionStatus = (status) => {
    switch (status) {
        case conceptIds.modules.notStarted:
            return "Not Started";
        case conceptIds.modules.started:
            return "Started";
        case conceptIds.modules.submitted:
            return "Submitted";
        default:
            return "Unknown Status";
    }
}

export const handleKitStatusSelectionDropdown = () => {
    const participantDropdown = document.querySelector(".kitStatusSelectionDropdown");
    if (!participantDropdown) { 
        location.hash = '#welcome';
        return;
    }

    const baseHash = '#kitStatusReports';
    let currentHash = window.location.hash;
    let queryPart = currentHash.split('?')[1];
    const queryParams = new URLSearchParams(queryPart);
    const requestedStatus = queryParams.get('status');
    
    const validKitStatusOptions = Object.keys(kitStatusSelectionOptions);
    if (requestedStatus && validKitStatusOptions.includes(requestedStatus.trim().toLowerCase())) { 
        console.log("🚀 ~ handleKitStatusSelectionDropdown ~ requestedStatus:", requestedStatus);
        // Set the dropdown to the requested status
        participantDropdown.value = requestedStatus.trim().toLowerCase();
    } else {
        // Set the dropdown to the default value
        participantDropdown.value = '';
    }

    console.log("🚀 ~ handleKitStatusSelectionDropdown ~ validKitStatusOptions:", validKitStatusOptions)
    participantDropdown.addEventListener("change", (e) => {
        console.log("🚀 ~ participantDropdown.addEventListener ~ participantDropdown:", participantDropdown)
        let selection = e.target.value;
        if (selection === '') {
            location.hash = baseHash;
        } else if (selection === "pending") {
            location.hash = baseHash + '?' + kitStatusSelectionOptions.pending.queryParam;
        } else if (selection === "assigned") {
            location.hash = baseHash + '?' + kitStatusSelectionOptions.assigned.queryParam;
        } else if (selection === "shipped") {
            location.hash = baseHash + '?' + kitStatusSelectionOptions.shipped.queryParam;
        } else if(selection === "received") {
            location.hash = baseHash + '?' + kitStatusSelectionOptions.received.queryParam;
        }
    });
};


// Can be kept here and exported to index.js later
export const kitStatusSelectionOptions = {
    pending: { 
        conceptId: conceptIds.pending,
        headerName: 'Assembled Kits Pending Assignment',
        name: 'pending', 
        queryParam: 'status=pending',
        columns: [
            {
            header: 'Date Assembled',
            key: conceptIds.pendingDateTimeStamp,

            renderer: (dataRow) => {
                const isoDate = dataRow[conceptIds.pendingDateTimeStamp];
                return convertISODateTime(isoDate).split(/\s+/)[0];
                }
            },
            {
            header: 'Return Kit Tracking Number',
            key: conceptIds.returnKitTrackingNum
            },
            {
            header: 'Supply Kit ID',
            key: conceptIds.supplyKitId
            },
            {
            header: 'Return Kit ID',
            key: conceptIds.returnKitId
            },
            {
            header: 'Cup ID',
            key: conceptIds.collectionCardId
            },
            {
            header: 'Card ID',
            key: conceptIds.collectionCardId
            }
        ]
    },
    assigned: {
        conceptId: conceptIds.assigned, 
        headerName: 'Assigned Kits',
        name: 'assigned', 
        queryParam: 'status=assigned',
        columns: [
            {
            header: 'Connect ID',
            key: 'Connect_ID'
            },
            {
            header: 'Full Name',
            key: 'conceptIds.firstName',
            renderer: (dataRow) => { 
                const firstName = dataRow[conceptIds.firstName];
                const lastName = dataRow[conceptIds.lastName];
                return `${firstName} ${lastName}`;
                }
            },
            {
            header: 'Study Site',
            key: conceptIds.healthcareProvider,
            renderer: (dataRow) => {
                const studySite = dataRow[conceptIds.healthcareProvider];
                return keyToNameObj[studySite] || '';
                }
            },
            {
            header: 'Supply Kit ID',
            key: conceptIds.supplyKitId
            },
            {
            header: 'Collection ID',
            key: conceptIds.collectionCardId
            },
            {
            header: 'Supply Kit Tracking Number',
            key: conceptIds.supplyKitTrackingNum
            },
            {
            header: 'Return Kit Tracking Number',
            key: conceptIds.returnKitTrackingNum
            },
            {
            header: 'Kit Type (Initial, 2nd, 3rd)',
            key: 'kitIteration'
            }
        ]
    },
    shipped: {
        conceptId: conceptIds.shipped, 
        headerName: 'Shipped Kits',
        name: 'shipped', 
        queryParam: 'status=shipped',
        columns: [
            {
            header: 'Connect ID',
            key: 'Connect_ID'
            },
            {
            header: 'Study Site',
            key: conceptIds.healthcareProvider,
            renderer: (dataRow) => {
                const studySite = dataRow[conceptIds.healthcareProvider];
                return keyToNameObj[studySite] || '';
                }
            },
            {
            header: 'Shipped Date',
            key: conceptIds.shippedDateTime,
            renderer: (dataRow) => {
                const isoDate = dataRow[conceptIds.shippedDateTime];
                return convertISODateTime(isoDate).split(/\s+/)[0];
                }
            },
            {
            header: 'Supply Kit ID',
            key: conceptIds.supplyKitId
            },
            {
            header: 'Collection ID',
            key: conceptIds.collectionCardId
            },
            {
            header: 'Supply Kit Tracking Number',
            key: conceptIds.supplyKitTrackingNum
            },
            {
            header: 'Return Kit Tracking Number',
            key: conceptIds.returnKitTrackingNum
            },
            {
            header: 'Mouthwash Survey Completion Status',
            key: conceptIds.mouthwashSurveyCompletionStatus,
            renderer: (dataRow) => {
                const status = dataRow[conceptIds.mouthwashSurveyCompletionStatus];
                return convertSurveyCompletionStatus(status);
                }
            },
            {
            header: 'Kit Type (Initial, 2nd, 3rd)',
            key: 'kitIteration'
            }
        ]
        
    },
    received: {
        conceptId: conceptIds.received,
        headerName: 'Received Kits',
        name: 'received', 
        queryParam: 'status=received',
        columns: [
            {
            header: 'Connect ID',
            key: 'Connect_ID'
            },
            {
            header: 'Collection ID',
            key: conceptIds.collectionCardId
            },
            {
            header: 'Date Received',
            key: conceptIds.receivedDateTime,
            renderer: (dataRow) => {
                const isoDate = dataRow[conceptIds.receivedDateTime];
                return convertISODateTime(isoDate).split(/\s+/)[0];
                }
            },
            {
            header: 'Return Kit Tracking Number',
            key: conceptIds.returnKitTrackingNum
            },
            {
            header: 'Kit Type (Initial, 2nd, 3rd)',
            key: conceptIds.kitLevel,
            renderer: (dataRow) => {
                    const kitLevelMap = {
                        [conceptIds.initialKit]: 'Initial',
                        [conceptIds.replacementKit1]: '2nd',
                        [conceptIds.replacementKit2]: '3rd'
                    }
                    return kitLevelMap[dataRow[conceptIds.kitLevel]] || '';
                }
            }
        ]
    }
}