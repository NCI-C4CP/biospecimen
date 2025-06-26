import { showAnimation, hideAnimation, getParticipantsByKitStatus, convertISODateTime, keyToNameObj, getCurrentDate, appState } from "../../shared.js";
import { displayKitStatusReportsHeader } from "./participantSelectionHeaders.js";
import { nonUserNavBar } from "../../navbar.js";
import { activeHomeCollectionNavbar } from "./homeCollectionNavbar.js";
import { conceptIds } from "../../fieldToConceptIdMapping.js";

export const displayKitStatusReportsScreen = async (auth) => {
    const user = auth.currentUser;
    if (!user) return;
    const username = user.displayName ? user.displayName : user.email;
    kitStatusReportsTemplate(username);
};

const kitStatusReportsTemplate = async (name) => {
    let reportsData;
    let template;
    const status = appState.getState().kitStatus;

    try {
        if (status) { // get the kit status reports based on the selected status text ("pending", "assigned", "shipped", or "received") 
        showAnimation();
        const kitStatusConceptId = kitStatusSelectionOptions[status]?.conceptId;
        const response = await getParticipantsByKitStatus(kitStatusConceptId);
        console.log("🚀 ~ kitStatusReportsTemplate ~ response:", response)

        reportsData = response.data;
        console.log("🚀 ~ kitStatusReportsTemplate ~ reportsData:", reportsData)
        }
    } catch (error) { 
        console.error("Error in kitStatusReportsTemplate, failed to fetch kit status data", error);
        reportsData = [];
    }
    finally {
        hideAnimation();
    }

    template = `
        ${displayKitStatusReportsHeader()}
        ${status && kitStatusSelectionOptions[status]?.conceptId === conceptIds.received 
            ? createKitStatusFilterSection() // Exclusive to the received kits status report
            : ''
        }

        <div id="root root-margin">
            <div class="table">
                ${createTableContent(reportsData)}
            </div>
        </div>
    `;

    document.getElementById("contentBody").innerHTML = template;
    document.getElementById("navbarNavAltMarkup").innerHTML = nonUserNavBar(name);
    activeHomeCollectionNavbar();
    handleKitStatusSelectionDropdown();
    filterKitsHandler();
    clearFiltersHandler();
};

const createTableContent = (reportsData) => {
    // reportsData array is empty or undefined
    if (!reportsData || reportsData.length === 0) {
        return '<p>The selected kit status report has no data to display. Please select a different kit status report from the dropdown.</p>';
    }

    return `
        ${createKitStatusHeader()}
        ${createKitStatusTable(reportsData)}
    `;
}

const createKitStatusTable = (reportsData) => {
    return `
            <div class="sticky-header" style="overflow:auto;">
                <table class="table table-bordered" id="kitStatusReportsTable" style="margin-bottom:1rem; 
                    position:relative; border-collapse:collapse;">
                    <thead> 
                        <tr style="top: 0; position: sticky;">
                            ${createColumnHeaders()}
                        </tr>
                    </thead>   
                    <tbody>
                        ${createColumnRows(reportsData)}
                    </tbody>
                </table>
            </div>
    `;
};

const createKitStatusHeader = () => { 
    const status = appState.getState().kitStatus;
    if (!status || !kitStatusSelectionOptions[status]?.headerName) return '';

    return `
        <h3 style="text-align: center; margin: 0 0 1rem;">
            ${kitStatusSelectionOptions[status].headerName}
        </h3>
    `;
};

const createColumnHeaders = () => {
    const status = appState.getState().kitStatus;
    if (!status) return `Please select a kit status report from the dropdown to view the report.`;

    const columns = kitStatusSelectionOptions?.[status]?.columns ?? [];

    return columns.map(col => 
        `<th class="sticky-row" style="background-color: #f7f7f7;" scope="col">${col.header}</th>`
    ).join('');
};

/**
 * 
 * Returns rows for the Kit Status table
 * @param {Array} reportsData - an array of custom objects with values based on the participant's kit status or only based on unassigned kits (pending assignment kits)
 * @returns {string} - a string of table rows
*/
const createColumnRows = (reportsData) => {
    let template = ``;
    const status = appState.getState().kitStatus;

    if (!reportsData || !Array.isArray(reportsData)) {
        return template;
    }

    const columns = kitStatusSelectionOptions?.[status].columns ?? [];
    if (columns.length === 0) return template;

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
 * @param {number} completionStatus - the concept Id status value of the mouthwash survey
*/
const convertSurveyCompletionStatus = (completionStatus) => {
    switch (completionStatus) {
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
        // Set the dropdown to the requested status
        participantDropdown.value = requestedStatus.trim().toLowerCase();
    } else {
        // Set the dropdown to the default value
        participantDropdown.value = '';
    }

    participantDropdown.addEventListener("change", (e) => {
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

const createKitStatusFilterSection = () => {
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

                    <button class="btn btn-primary mt-2" id="filterKitsButton">Apply Filters</button>
                    <button class="btn btn-secondary mt-2" id="clearFiltersButton">Clear Filters</button style="margin-bottom: 1rem;">
                </div>
        `;
};

function filterKitsHandler () { 
    const filterButton = document.getElementById("filterKitsButton");

    if (filterButton) {
        filterButton.addEventListener("click", async () => {
            try {
                const getVal = id => document.getElementById(id)?.value.trim() || '';

                const queryParams = new URLSearchParams(window.location.hash.split('?')[1]);
                const status = queryParams.get('status');
                const kitStatusConceptId = kitStatusSelectionOptions[status]?.conceptId;

                const filters = {
                    collectionId: getVal("collectionId"),
                    connectId: getVal("connectId"),
                    returnKitTrackingNum: getVal("returnKitTrackingNum"),
                    dateReceived: document.getElementById("dateReceived")?.value || '',
                };
                // let tableContent = '';

                showAnimation();
                const response = await getParticipantsByKitStatus(kitStatusConceptId, filters);
                const responseData = response.data;

                // if (responseData.length > 0) {
                //     tableContent = ` 
                //         ${createKitStatusHeader()}
                //         ${createKitStatusTable(responseData)}
                //     `;
                // } else {
                //     tableContent = '<p>The selected kit status report has no data to display. Please select a different kit status report from the dropdown.</p>'
                // }
                // Re-render the table with the new, filtered data
                // const newTableBody = createColumnRows(response.data);
                const element = document.querySelector('#root .table');
                console.log("element", element)
                document.querySelector("#root .table").innerHTML = createTableContent(responseData);
            } catch (error) {
                console.error("Error filtering kits:", error);
            } finally { 
                hideAnimation();
            }
            
        });
    }
};

/**
 * Clears the input fields, re-fetches the received kit status reports data, and updates the table
*/
function clearFiltersHandler() { 
    const clearButton = document.getElementById("clearFiltersButton");

    if (clearButton) {
        clearButton.addEventListener("click", async () => {
            try {
                const collectionIdInput = document.getElementById("collectionId");
                const connectIdInput = document.getElementById("connectId");
                const returnKitTrackingNumInput = document.getElementById("returnKitTrackingNum");
                const dateReceivedInput = document.getElementById("dateReceived");

                const areAllInputsEmpty = 
                    collectionIdInput.value.trim() === '' && 
                    connectIdInput.value.trim() === '' && 
                    returnKitTrackingNumInput.value.trim() === '' && 
                    dateReceivedInput.value === '';

                if (areAllInputsEmpty) return; // Prevent an API call if all inputs are already empty.

                // clear inputs
                if (collectionIdInput) collectionIdInput.value = '';
                if (connectIdInput) connectIdInput.value = '';
                if (returnKitTrackingNumInput) returnKitTrackingNumInput.value = '';
                if (dateReceivedInput) dateReceivedInput.value = '';
                
                const status = appState.getState().kitStatus;
                const kitStatusConceptId = kitStatusSelectionOptions[status]?.conceptId;
                let tableContent = '';
                
                showAnimation();
                const response = await getParticipantsByKitStatus(kitStatusConceptId);
                const responseData = response.data;

                // if (responseData.length > 0) {
                //     tableContent = ` 
                //         ${createKitStatusHeader()}
                //         ${createKitStatusTable(responseData)}
                //     `;
                // } else {
                //     tableContent = '<p>The selected kit status report has no data to display. Please select a different kit status report from the dropdown.</p>'
                // }
                
                // Replace table body with no filters applied
                const newTableBody = createColumnRows(responseData);
                const element = document.querySelector('#root .table');
                console.log("element filter process", element)

                document.querySelector("#root .table").innerHTML = createTableContent(responseData);
            } catch (error) {
                console.error("Error clearing filters:", error);
            } finally {
                hideAnimation();
            }
        });
    }
}

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
                if (!isoDate) return '';
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
                const completionStatus = dataRow[conceptIds.mouthwashSurveyCompletionStatus];
                return convertSurveyCompletionStatus(completionStatus);
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