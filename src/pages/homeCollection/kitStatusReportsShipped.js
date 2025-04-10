import { showAnimation, hideAnimation, getParticipantsByKitStatus, convertISODateTime, keyToNameObj } from "../../shared.js";
import { displayKitStatusReportsHeader } from "./participantSelectionHeaders.js";
import { kitStatusSelectionDropdown } from "./kitStatusReports.js";
import { nonUserNavBar } from "../../navbar.js";
import { activeHomeCollectionNavbar } from "./homeCollectionNavbar.js";
import { conceptIds } from "../../fieldToConceptIdMapping.js";


export const displayKitStatusReportsShippedScreen = async (auth, route) => {
    const user = auth.currentUser;
    if (!user) return;
    const username = user.displayName ? user.displayName : user.email;
    kitStatusShippedTemplate(username, auth, route);
};

const kitStatusShippedTemplate = async (name) => {
    showAnimation();
    const response = await getParticipantsByKitStatus(conceptIds.shipped);
    const shippedKitStatusParticipantsArray = response.data;
    hideAnimation();

    const template = `
                    ${displayKitStatusReportsHeader()}
                    <div class="container-fluid">
                        <div id="root root-margin">
                            <div class="table">
                                <h3 style="text-align: center; margin: 0 0 1rem;">Kits Shipped</h3>
                                ${displayKitStatusShippedTable(shippedKitStatusParticipantsArray)}
                            </div>
                        </div>
                    </div>`;
                    
    document.getElementById("contentBody").innerHTML = template;
    document.getElementById("navbarNavAltMarkup").innerHTML = nonUserNavBar(name);
    activeHomeCollectionNavbar()
    kitStatusSelectionDropdown();
};

const displayKitStatusShippedTable = (shippedKitStatusParticipantsArray) => {
    return `
            <div class="sticky-header" style="overflow:auto;">
                <table class="table table-bordered" id="participantData" style="margin-bottom:1rem; 
                    position:relative; border-collapse:collapse;">
                    <thead> 
                        <tr style="top: 0; position: sticky;">
                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Connect ID</th>
                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Study Site </th>
                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Shipped Date</th>
                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Supply Kit ID</th>
                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Collection ID</th>
                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Supply Kit Tracking Number</th>
                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Return Kit Tracking Number</th>
                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Mouthwash Survey Completion Status</th>
                            <th class="sticky-row" style="background-color: #f7f7f7;" scope="col">Initial/<wbr />2nd/<wbr />3rd Kit</th>
                        </tr>
                    </thead>   
                    <tbody>
                        ${createShippedRows(shippedKitStatusParticipantsArray)}
                    </tbody>
                </table>
            </div>`;
};

/**
 * Returns rows for the shipped kits table
 * @param {Array} shippedKitStatusParticipantsArray - an array of custom objects with values from participants and kitAssembly collection that have a shipped kit status
 * @returns {string} - a string of table rows
*/
const createShippedRows = (shippedKitStatusParticipantsArray) => {
    let template = ``;
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
    const kitIteration = participantObj['kitIteration'];
    const mouthwashSurveyStatus = convertSurveyCompletionStatus(participantObj[conceptIds.mouthwashSurveyCompletionStatus]);

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
                    <td>${kitIteration}</tc>
                </tr>`;
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