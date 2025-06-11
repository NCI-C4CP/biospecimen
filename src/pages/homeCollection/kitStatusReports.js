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
   let participants;

    console.log("status", status)
    if (status) {
        showAnimation();
        const kitStatusConceptId = kitStatusSelectionOptions[status]?.conceptId;
        console.log("🚀 ~ kitStatusTemplate ~ kitStatusConceptId:", kitStatusConceptId)
        const response = await getParticipantsByKitStatus(kitStatusConceptId);
        participants = response.data; // rename to adjust for different kitStatus reports
        console.log("🚀 ~ kitStatusTemplate ~ participants:", participants)
        hideAnimation();
    }
    
    const template = `
                    ${displayKitStatusReportsHeader()}

                    <!-- Kit Status Table Container -->
                    <div class="container-fluid">
                        <div id="root root-margin">
                            <div class="table">
                            <!-- Kit Status Table Container -->
                                ${displayKitStatusHeader(status)}
                                ${displayKitStatusTable(participants, status)}
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

const displayKitStatusTable =  (participants, status) => { // rename to create
    

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
                        ${createShippedRows(participants)}
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
    const columnHeadersArray = kitStatusSelectionOptions[status]?.columnHeaders;

    if (columnHeadersArray) { 
        columnHeaders = columnHeadersArray.map(header => {
            return `<th class="sticky-row" style="background-color: #f7f7f7;" scope="col">${header}</th>`;
        }).join('');
    }

    return columnHeaders;
};

/*
    showAnimation();

    // different kit status reports logic herere



*/

/**
 * TODO: Update comments later
 * 
 * Returns rows for the shipped kits table
 * @param {Array} shippedKitStatusParticipantsArray - an array of custom objects with values from participants and kitAssembly collection that have a shipped kit status
 * @returns {string} - a string of table rows
*/
const createShippedRows = (participants) => {
    
    let template = ``;
    return ``
    if (!shippedKitStatusParticipantsArray || !Array.isArray(shippedKitStatusParticipantsArray)) {
        return template;
    }
    for (const participantObj of shippedKitStatusParticipantsArray) {

    const connectID = participantObj["Connect_ID"];
    const healthcareProvider = keyToNameObj[participantObj[conceptIds.healthcareProvider]];
    const mouthwashShippedDate = convertISODateTime(participantObj[conceptIds.shippedDateTime]).split(/\s+/)[0];
    const supplyKitId = participantObj[conceptIds.supplyKitId];
    const collectionCardId = participantObj[conceptIds.collectionCardId];
    const supplyKitTrackingNum = participantObj[conceptIds.supplyKitTrackingNum];
    const returnKitTrackingNum = participantObj[conceptIds.returnKitTrackingNum];
    const mouthwashSurveyStatus = convertSurveyCompletionStatus(participantObj[conceptIds.mouthwashSurveyCompletionStatus]);
    const kitIteration = participantObj['kitIteration'];

    template += `
                <tr class="row-color-enrollment-dark participantRow">
                    <td>${connectID}</td>
                    <td>${healthcareProvider}</td>
                    <td>${mouthwashShippedDate}</td>
                    <td>${supplyKitId}</td>
                    <td>${collectionCardId}</td>
                    <td>${supplyKitTrackingNum}</td>
                    <td>${returnKitTrackingNum}</td>
                    <td>${mouthwashSurveyStatus}</td>
                    <td>${kitIteration}</td>
                </tr>
                `;
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

    // this part keeps getting current hash but will append the query param to the end of the hash
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
        columnHeaders: [
            'Date Assembled', 
            'Return Kit Tracking Number', 
            'Supply Kit ID', 
            'Return Kit ID', 
            'Cup ID', 
            'Card ID'
        ],
        headerName: 'Assembled Kits Pending Assignment',
        name: 'pending', 
        queryParam: 'status=pending' 
    },
    assigned: {
        conceptId: conceptIds.assigned, 
        columnHeaders: [
            'Connect ID',
            'Full Name',
            'Address',
            'Study Site',
            'Supply Kit ID',
            'Collection ID',
            'Supply Kit Tracking Number',
            'Return Kit Tracking Number',
            'Kit Type (Initial, 2nd, 3rd)'
        ],
        headerName: 'Assigned Kits',
        name: 'assigned', 
        queryParam: 'status=assigned'
    },
    shipped: {
        conceptId: conceptIds.shipped, 
        columnHeaders: [
            'Connect ID', 
            'Study Site', 
            'Shipped Date', 
            'Supply Kit ID', 
            'Collection ID', 
            'Supply Kit Tracking Number', 
            'Return Kit Tracking Number', 
            'Mouthwash Survey Completion Status', 
            'Kit Type (Initial, 2nd, 3rd)'
        ],
        headerName: 'Shipped Kits',
        name: 'shipped', 
        queryParam: 'status=shipped'
    },
    received: {
        conceptId: conceptIds.received,
        columnHeaders: [
            'Connect ID',
            'Collection ID',
            'Date Received',
            'Return Kit Tracking Number',
            'Kit Type (Initial, 2nd, 3rd)'
        ],
        headerName: 'Received Kits',
        name: 'received', 
        queryParam: 'status=received'
    }
}