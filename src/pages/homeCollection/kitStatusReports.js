import { showAnimation, hideAnimation, getParticipantsByKitStatus, convertISODateTime, keyToNameObj, getCurrentDate } from "../../shared.js";
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


const kitStatusTemplate = async (name , route, status ) => {
    // add logic here to determine the status of kit and what to load
    console.log("Status On load --->", status);

    /*
    Kit Status Single Search 
    */ 
   let reportsData;
   let template;

    console.log("status", kitStatusSelectionOptions[status]?.conceptId, conceptIds.received)
    if (status) {
        showAnimation();
        const kitStatusConceptId = kitStatusSelectionOptions[status]?.conceptId;
        console.log("🚀 ~ kitStatusTemplate ~ kitStatusConceptId:", kitStatusConceptId)
        const response = await getParticipantsByKitStatus(kitStatusConceptId);
        reportsData = response.data; // rename to adjust for different kitStatus reports
        // reportsData = []
        hideAnimation();
    }

    template = `
        ${displayKitStatusReportsHeader()}
        ${ status && kitStatusSelectionOptions[status]?.conceptId === conceptIds.received 
            ? createKitStatusFilterSection(status)
            : ''
        }

        ${reportsData && reportsData.length > 0
            ? `
                    <div id="root root-margin">
                        <div class="table">
                            ${displayKitStatusHeader(status)}
                            ${displayKitStatusTable(reportsData, status)}
                        </div>
                    </div>
            `
            : '<p>The selected kit status report has no data to display. Please select a different kit status report from the dropdown.</p>'
        }
    `;
                    
    document.getElementById("contentBody").innerHTML = template;
    document.getElementById("navbarNavAltMarkup").innerHTML = nonUserNavBar(name);
    activeHomeCollectionNavbar();
    handleKitStatusSelectionDropdown();
    filterKitsHandler();
    clearFiltersHandler();
};

const displayKitStatusTable =  (reportsData, status) => { // rename to create
    return `
            <div class="sticky-header" style="overflow:auto;">
                <table class="table table-bordered" id="kitStatusReportsTable" style="margin-bottom:1rem; 
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

// target the table's table body and insert createColumnRows

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

/**
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

    // console.log("🚀 ~ handleKitStatusSelectionDropdown ~ validKitStatusOptions:", validKitStatusOptions)
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

const createKitStatusFilterSection = (status) => {
    // use bootsrap to create input fields for (Collection ID, Connect ID, Return Kit Tracking Number and Date Received)
    console.log("🚀 ~ createKitStatusFilterSection ~ status:", status);

        return `
                <div class="kit-status-filter-section" style="margin-bottom: 1rem;">

                    <h5>Filter Kits</h5>
                    <label for="connectId" class="form-label">Connect ID</label>
                    <input type="text" class="form-control" id="connectId" placeholder="Enter Connect ID" style="margin-bottom: 1rem;">

                    <label for="collectionId" class="form-label">Collection ID</label>
                    <input type="text" class="form-control" id="collectionId" placeholder="Enter Collection ID" style="margin-bottom: 1rem;">

                    <label for="returnKitTrackingNum" class="form-label">Return Kit Tracking Number</label>
                    <input type="text" class="form-control" id="returnKitTrackingNum" placeholder="Enter Return Kit Tracking Number" style="margin-bottom: 1rem;>

                    <label for="dateReceived" class="form-label">Date Received</label>
                    <input type="date" class="form-control" id="dateReceived" max="${getCurrentDate()}" style="margin-bottom: 1rem;">

                    <button class="btn btn-primary mt-2" id="filterKitsButton">Filter Kits</button>
                    <button class="btn btn-secondary mt-2" id="clearFiltersButton">Clear Filters</button style="margin-bottom: 1rem;">
                </div>
        `;
};

function filterKitsHandler () { 
    const filterButton = document.getElementById("filterKitsButton");

    if (filterButton) {
        filterButton.addEventListener("click", async () => {

            const collectionIdInput = document.getElementById("collectionId");
            const connectIdInput = document.getElementById("connectId");
            const returnKitTrackingNumInput = document.getElementById("returnKitTrackingNum");
            const dateReceivedInput = document.getElementById("dateReceived");

            // const collectedId = collectionIdInput ? collectionIdInput.value.trim() : '';
            // const connectId = connectIdInput.value.trim() || ''; // .trim() to remove any leading/trailing whitespace
            // const returnKitTrackingNum = returnKitTrackingNumInput ? returnKitTrackingNumInput.value.trim() : '';
            // const dateReceived = dateReceivedInput ? dateReceivedInput.value : ''; // .trim() not needed for date inputs

            const queryParams = new URLSearchParams(window.location.hash.split('?')[1]);
            console.log("🚀 ~ filterButton.addEventListener ~ queryParams:", queryParams)
            const status = queryParams.get('status');
            const kitStatusConceptId = kitStatusSelectionOptions[status]?.conceptId;
            console.log("🚀 ~ filterButton.addEventListener ~ status:", status)



            // const filterValues = {
            //     collectionId: collectedId,
            //     connectId: connectId,
            //     returnKitTrackingNum: returnKitTrackingNum,
            //     dateReceived: dateReceived // validIso8601Format function
            // };
            const filters = {
                collectionId: collectionIdInput.value.trim(),
                connectId: connectIdInput.value.trim(),
                returnKitTrackingNum: returnKitTrackingNumInput.value.trim(),
                dateReceived: dateReceivedInput.value
            };
            console.log("🚀 ~ filterButton.addEventListener ~ filters:", filters)
            

            // console.log("Filter values object:", filterValues);

            showAnimation();
            const response = await getParticipantsByKitStatus(kitStatusConceptId, filters);
            hideAnimation();
            
            // Re-render the table with the new, filtered data
            const newTableBody = createColumnRows(response.data, status);
            document.querySelector("#kitStatusReportsTable tbody").innerHTML = newTableBody;


        });
    }
};

function clearFiltersHandler() { 
    const clearButton = document.getElementById("clearFiltersButton");

    if (clearButton) {
        clearButton.addEventListener("click", async () => {
            // Reset all input fields to empty
            const collectionIdInput = document.getElementById("collectionId");
            const connectIdInput = document.getElementById("connectId");
            const returnKitTrackingNumInput = document.getElementById("returnKitTrackingNum");
            const dateReceivedInput = document.getElementById("dateReceived");

            if (collectionIdInput) collectionIdInput.value = '';
            if (connectIdInput) connectIdInput.value = '';
            if (returnKitTrackingNumInput) returnKitTrackingNumInput.value = '';
            if (dateReceivedInput) dateReceivedInput.value = '';
        });
    }
}

// Can be kept here and imported to index.js later
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
                if (!isoDate) return '';
                return convertISODateTime(isoDate).split(/\s+/)[0]
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
};