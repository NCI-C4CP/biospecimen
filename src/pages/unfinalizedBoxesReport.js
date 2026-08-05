import { 
    userAuthorization, 
    removeActiveClass, 
    hideAnimation, 
    showAnimation, 
    findParticipant, 
    convertISODateTimeToLocal, 
    restrictNonBiospecimenUser, 
    showNotifications,
    locationConceptIDToLocationMap,
    getBoxes } from "./../shared.js"
import { homeNavBar, reportSideNavBar } from '../navbar.js';
import { conceptIds } from "../fieldToConceptIdMapping.js";

export const unfinalizedBoxesReportTemplate = (auth, route) => {
    auth.onAuthStateChanged(async user => {
        if (user){
            const response = await userAuthorization(route, user.displayName ? user.displayName : user.email);
            if (response.isBiospecimenUser === false ) {
                restrictNonBiospecimenUser();
                return;
            }
            document.getElementById('contentBody').innerHTML = await createUnfinalizedBoxesReport(); // Creates entire page for unfinalized boxes report
        
        // Remove active class from nav link and add active class to unfinalized boxes report nav link
        removeActiveClass('nav-link', 'active');
        const navBarBtn = document.getElementById('navBarUnfinalizedBoxesReport');
        navBarBtn.classList.add('active');
        } else {
            window.location.hash = '#';
        }
    });
}

export const createUnfinalizedBoxesReport = async () => {
    // Data fetching function
    try {
        const boxesResponse = await getBoxes();
        console.log("🚀 ~ createUnfinalizedBoxesReport ~ boxesResponse:", boxesResponse)
        const boxes = boxesResponse.data;

        // Add main container here
        return `
            <div class="container">
                <div class="row">
                    <div class="col-2">
                        <h2>Reports</h2>
                        ${reportSideNavBar()}
                    </div>
                    <div class="col-10">
                        <!-- Table for unfinalized boxes report -->
                        <table class="table table-bordered" id="unfinalizedBoxesReportTable">
                            ${createBoxReportHeaders(boxReportHeaders)}
                            ${createBoxReportRows(boxes)}
                        </table>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        console.error("Error creating unfinalized boxes report:", error);
        showNotifications("Error creating unfinalized boxes report", "danger");
    } finally {
        hideAnimation();
    }
};

const boxReportHeaders = [
    "Shipping Location",
    "Box ID",
    "Started",
    "Go to Shipping"
];

const createBoxReportHeaders = (boxReportHeaders) => { 
    // Create table headers for the unfinalized boxes report
    return `
        <thead>
            <tr>
                ${boxReportHeaders.map(header => `<th scope="col">${header}</th>`).join('')}
            </tr>
        </thead>
    `
};

const createBoxReportRows = (boxes) => {
    const shippingRoute = "#shipping";

    return `
        <tbody>
            ${boxes.map(box => {
                const shippingLocation = locationConceptIDToLocationMap[box[conceptIds.shippingLocation]];
                const boxId = box[conceptIds.shippingBoxId];
                const startedTimestamp = convertISODateTimeToLocal(box[conceptIds.firstBagAddedToBoxTimestamp]).split(/\s+/, 1)[0] ?? '';

                console.log("🚀 ~ createBoxReportRows ~ shippingLocation:", shippingLocation)
                console.log("🚀 ~ createBoxReportRows ~ boxId:", boxId)
                console.log("🚀 ~ createBoxReportRows ~ startedTimestamp:", startedTimestamp)

                return `
                    <tr>
                        <td>${shippingLocation}</td>
                        <td>${boxId}</td>
                        <td>${startedTimestamp}</td>
                        <td><a href="${shippingRoute}" class="btn btn-primary">Go to Shipping</a></td>
                    </tr>
                ` 
            }).join('')}
        </tbody>
    `
};
