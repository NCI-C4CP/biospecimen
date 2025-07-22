import { userAuthorization, removeActiveClass, getWorkflow, checkedIn, participantCanCheckIn, verificationConversion, restrictNonBiospecimenUser, participationConversion } from "./../shared.js"
import {  addGoToCheckInEvent, addGoToSpecimenLinkEvent, addEventSearchForm1, addEventBackToSearch, addEventSearchSpecimen, addEventNavBarSpecimenSearch, addEventClearAll } from "./../events.js";
import { homeNavBar, bodyNavBar } from '../navbar.js';

export const userDashboard = (auth, route, goToSpecimenSearch) => {
    auth.onAuthStateChanged(async user => {
        if(user){
            const response = await userAuthorization(route, user.displayName ? user.displayName : user.email);
            if ( response.isBiospecimenUser === false ) {
                restrictNonBiospecimenUser();
                return;
            }
            if(!response.role) return;
            searchTemplate(goToSpecimenSearch);
        }
        else {
            document.getElementById('navbarNavAltMarkup').innerHTML = homeNavBar();
            window.location.hash = '#';
        }
    });
}

export const searchTemplate = (goToSpecimenSearch) => {
    if(document.getElementById('navBarParticipantCheckIn')) document.getElementById('navBarParticipantCheckIn').classList.add('disabled');

    const contentBody = document.getElementById('contentBody');
    const inputNote = getWorkflow() === 'research' 
        ? `<p class="input-note">Ask the participant for their name and date of birth and enter below:</p>` 
        : `<p class="input-note">Enter participant's name and date of birth from the clinical specimen label:</p>`;

    let template = `
        <div class="row">
            <div class="col-lg">
                <h5>Participant Lookup</h5>
            </div>
        </div>
        <div class="row">
            <div class="col-lg">
                ${inputNote}
            </div>
        </div>
        <div class="row">
            <div class="col-lg">
                <div class="row form-row">
                    <form id="search1" method="POST">
                        <div class="mb-3">
                            <label class="col-form-label search-label" for="firstName">First name</label>
                            <input class="form-control" autocomplete="off" type="text" id="firstName" placeholder="Enter First Name"/>
                        </div>
                        <div class="mb-3">
                            <label class="col-form-label search-label" for="lastName">Last name</label>
                            <input class="form-control" autocomplete="off" type="text" id="lastName" placeholder="Enter Last Name"/>
                        </div>
                        <div class="mb-3">
                            <label class="col-form-label search-label" for="dob">Date of Birth</label>
                            <input class="form-control" type="date" id="dob" required/>
                        </div>
                        <div class="mb-3">
                            <button type="submit" class="btn btn-outline-primary button-fixed-width">Search</button>
                        </div>
                        <div class="mb-3">
                            <br/>
                        </div>
                        <div class="mb-3">
                            <button type="button" id="btnClearAll" class="btn btn-outline-danger button-fixed-width">Clear All</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    contentBody.innerHTML = template;
    bodyNavBar();
    addEventSearchForm1();
    addEventClearAll();
    addEventNavBarSpecimenSearch();
    if (goToSpecimenSearch) document.getElementById('navBarSpecimenSearch').click();
}

export const searchBiospecimenTemplate = () => {
    if(document.getElementById('navBarParticipantCheckIn')) document.getElementById('navBarParticipantCheckIn').classList.add('disabled');
    let template = `
        <div class="row">
            <div class="col-lg">
                <h5>Collection Lookup</h5>
            </div>
        </div>
        <div class="row">
            <div class="col-lg">
                Find by Collection ID
                <div class="row form-row">
                    <form id="specimenLookupForm" method="POST">
                        <div class="mb-3">
                            <label class="search-label">Collection ID</label>
                            <input class="form-control" autocomplete="off" required type="text" id="masterSpecimenId" placeholder="Enter/Scan Collection ID"/>
                        </div>
                        <div class="mb-3">
                            <button type="submit" class="btn btn-outline-primary">Search</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    removeActiveClass('navbar-btn', 'active')
    const navBarBtn = document.getElementById('navBarSpecimenSearch');
    navBarBtn.classList.add('active');
    document.getElementById('contentBody').innerHTML = template;
    addEventSearchSpecimen();
    addEventBackToSearch('navBarSearch');
}

export const searchResults = (result) => {
    let template = `
        </br>
        <div class="row">
            <h5>Participant Search Results</h5>
        </div>
        </br>
        
        <div class="row">
            <table style="text-align: center" class="table table-borderless table-striped">
                <thead>
                    <tr>
                        <th>Last name</th>
                        <th>First name</th>
                        <th>Middle name</th>
                        <th>Date of birth</th>
                        <th>Address</th>
                        <th>Connect ID</th>
                        <th>Verification Status</th>
                        <th>Participation Status</th>
                        <th></th>
                        ${getWorkflow() === 'research' ? '<th></th>' : ''}
                        <th></th>
                    </tr>
                </thead>
                <tbody>`

    result.forEach(data => {

        if(data['821247024'] === 922622075) return;

        let tdTemplate=`
            <td>${data['996038075']}</td>
            <td>${data['399159511']}</td>
            <td>${data['231676651']}</td>
            <td>${data['564964481']}/${data['795827569']}/${data['544150384']}</td>
            <td>${data['521824358']} ${data['442166669'] ? data['442166669'] : ''}</br>${data['703385619']} ${data['634434746']} ${data['892050548']}</td>
            <td>${data.Connect_ID}</td>
            <td>${verificationConversion[[data['821247024']]]}</td>
            <td><div class="row"><span class="full-width mx-auto">${data['912301837'] === 208325815 || data['912301837'] === 622008261 || data['912301837'] === 458508122 ? `<i class="fas fa-2x fa-check"></i>` :  `<i class="fas fa-2x fa-times"></i>`}</span></div><div class="row"><span class="full-width">${participationConversion[data['912301837']]}</span></div></td>`;

        const isCheckedIn = checkedIn(data);
        const canCheckIn = participantCanCheckIn(data);
        const disabledString = !canCheckIn ? `disabled` : ``;
        const btnClass = !canCheckIn ? 'btn-secondary disabled' : 'btn-outline-primary';
        if (getWorkflow() === 'research') {
        template += `
            <tr>
                ${tdTemplate}
                <td>
                    <button ${disabledString}  class="btn  ${btnClass} text-nowrap" data-check-in-btn-connect-id=${data.Connect_ID} data-check-in-btn-uid=${data.state.uid}>${!isCheckedIn ? `Go to Check-In` : `Go to Check-Out`}</button>
                </td>
                <td>
                    ${isCheckedIn ? `<button class="btn btn-outline-primary text-nowrap" data-specimen-link-connect-id=${data.Connect_ID}>Specimen Link</button>` : ``}
                </td>
            </tr>
        `
        } else if (getWorkflow() === 'clinical') {
            template += `
            <tr>
                ${tdTemplate}
                <td>
                <button ${disabledString} class="btn ${btnClass} text-nowrap" data-specimen-link-connect-id=${data.Connect_ID}>Specimen Link</button>
                </td>
            </tr>
        ` 
        }
    });
    template += `</tbody></table></div>`;

    document.getElementById('contentBody').innerHTML = template;
    addEventBackToSearch('navBarSearch');
    addGoToCheckInEvent();
    addGoToSpecimenLinkEvent();
}