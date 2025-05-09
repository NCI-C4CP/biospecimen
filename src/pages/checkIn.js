import { generateBarCode, removeActiveClass, visitType, checkedIn, participantCanCheckIn, getCheckedInVisit, verificationConversion, participationConversion, surveyConversion, getParticipantCollections, getSiteTubesLists } from "./../shared.js";
import { addEventContactInformationModal, addEventCheckInCompleteForm, addEventBackToSearch, addEventVisitSelection } from "./../events.js";
import { conceptIds } from '../fieldToConceptIdMapping.js';

export const checkInTemplate = async (data, checkOutFlag) => {
    removeActiveClass('navbar-btn', 'active')
    const navBarBtn = document.getElementById('navBarParticipantCheckIn');
    if (navBarBtn) {
        navBarBtn.style.display = 'block';
        navBarBtn?.classList.remove('disabled');
        navBarBtn?.classList.add('active');
    }

    const isCheckedIn = checkedIn(data);
    const canCheckIn = participantCanCheckIn(data);
    const visit = getCheckedInVisit(data);

    const response = await getParticipantCollections(data.token);
    let collections = [];
    let visitCollections = [];

    if (response.data.length > 0) {
        collections = response.data;

        if(isCheckedIn) {
            collections.forEach(collection => {
                if(collection['331584571'] == visit) visitCollections.push(collection);
            });
        }
    }

    let template = `
        </br>

        ${checkOutFlag === true ? `<button class="btn btn-outline-primary text-nowrap" id="backToCheckOutReport">Back to Check-Out Report</button>` : ``}

        </br>
        </br>
        <div class="row">
            ${isCheckedIn ? `<h5>Participant Check-Out</h5>` : `<h5>Participant Check-In</h5>`}
        </div>
        </br>
        <form method="POST" id="checkInCompleteForm" data-connect-id=${data.Connect_ID}>

            <div class="row">
                <div class="col-md-12">
                    <h5>${data['996038075']}, ${data['399159511']}</h5>
                    <h5>Login Method: ${data['995036844']}</h5>
                    ${data['421823980'] && !data['421823980'].startsWith('noreply') ? `<h5>User Email: ${data['421823980']}</h5>` : ''}
                    ${data['348474836'] ? `<h5>User Phone: ${data['348474836']}</h5>`: '' }
                </div>
            </div>

            <div class="row">
                <div class="col-md-5">`
            
                    if(isCheckedIn) {
                        template += `<h5>Visit: ${visitType.filter(visit => visit.concept === getCheckedInVisit(data))[0].visitType}</h5>`
                    }
                    else {
                        template += `<select class="custom-select" id="visit-select">
                                        <option value=""> -- Select Visit -- </option>`;
                                        
                        Array.from(visitType).forEach(option => {
                            template += option.visitType === "Baseline" ? `<option value=${option.concept}>${option.visitType}</option>` : `<option value=${option.concept} disabled>${option.visitType}</option>`;
                        })

                        template += `</select>`;
                    }
                    template += `
                </div>
                
                <div class="ml-auto">Connect ID: <svg id="connectIdBarCode"></svg></div>
            </div>
            
            <hr/>
    `;
    
    template += participantStatus(data, collections, isCheckedIn);


    if (canCheckIn) {
        template += `
            <div class="col">
                <button class="btn btn-outline-primary btn-block text-nowrap" ${!isCheckedIn ? `disabled` : visitCollections.length > 0 ? `` : `disabled`} type="submit" id="checkInComplete">${isCheckedIn ? `Check-Out` : `Check-In`}</button>
            </div>

        </form>
    `;
    } else {
        // Disable only the check-in button if the user has withdrawn consent
        template += `
            <div class="col">
                <button class="btn btn-outline-primary btn-block text-nowrap" ${isCheckedIn ? `` : `disabled`} type="submit" id="checkInComplete">${isCheckedIn ? `Check-Out` : `Check-In`}</button>
            </div>

        </form>
    `;
    }
    

    document.getElementById('contentBody').innerHTML = template;
    generateBarCode('connectIdBarCode', data.Connect_ID);
    addEventContactInformationModal(data);
    checkOutFlag === true ? reloadCheckOutReports('backToCheckOutReport') : addEventBackToSearch('navBarSearch')
    addEventCheckInCompleteForm(isCheckedIn, checkOutFlag);
    addEventVisitSelection();
}

const reloadCheckOutReports = (id) => {
    document.getElementById(id).addEventListener('click', e => {
        e.stopPropagation();
        location.reload(); // reloads url to CheckOut Report Page
    });
}

const participantStatus = (data, collections, isCheckedIn) => {
    let bloodCollection;
    let urineCollection;
    let mouthwashCollection;
    
    let bloodTime;
    let urineTime;
    let mouthwashTime;

    let bloodCollected = [];
    let urineCollected = [];
    let mouthwashCollected = [];

    let siteTubesList = getSiteTubesLists({'951355211': conceptIds.research});

    const bloodTubes = siteTubesList?.filter(tube => tube.tubeType === "Blood tube");
    const urineTubes = siteTubesList?.filter(tube => tube.tubeType === "Urine");
    const mouthwashTubes = siteTubesList?.filter(tube => tube.tubeType === "Mouthwash");
    
    collections = collections
        .filter(collection => collection[conceptIds.collection.selectedVisit] == conceptIds.baseline.visitId)
        .sort((a, b) => {
            const aVal = a[conceptIds.collection.finalizedTime];
            const bVal = b[conceptIds.collection.finalizedTime];
            // Sort from oldest to newest
            if(aVal > bVal) {
                return 1;
            } else if (aVal < bVal) {
                return -1;
            } else {
                return 0;
            }
        });

    collections.forEach(collection => {
        bloodTubes?.forEach(tube => {
            if(collection?.[tube.concept]?.[conceptIds.collection.tube.isCollected] == conceptIds.yes) {
                bloodCollected.push(collection);
            }
        });

        urineTubes?.forEach(tube => {
            if(collection?.[tube.concept]?.[conceptIds.collection.tube.isCollected] == conceptIds.yes) {
                urineCollected.push(collection);
            }
        });

        mouthwashTubes?.forEach(tube => {
            if(collection?.[tube.concept]?.[conceptIds.collection.tube.isCollected] == conceptIds.yes) {
                mouthwashCollected.push(collection);
            }
        });
    });

    // Per [1062](https://github.com/episphere/connect/issues/1062), use the oldest date and collection, not the newest

    if(bloodCollected.length > 0) {
        
        bloodCollection = bloodCollected[0][conceptIds.collection.id];
        bloodTime = bloodCollected[0][conceptIds.collection.collectionTime];
    }
    
    if(urineCollected.length > 0) {
        urineCollection = urineCollected[0][conceptIds.collection.id];
        urineTime = urineCollected[0][conceptIds.collection.collectionTime];
    }
    
    if(mouthwashCollected.length > 0) {
        mouthwashCollection = mouthwashCollected[0][conceptIds.collection.id];
        mouthwashTime = mouthwashCollected[0][conceptIds.collection.collectionTime];
    }

    const baselineSampleStatusInfo = {
        bloodTime,
        isBloodCollected: data[conceptIds.baseline.bloodCollected],
        urineTime,
        isUrineCollected: data[conceptIds.baseline.urineCollected],
        mouthwashTime,
        isMouthwashCollected: data[conceptIds.baseline.mouthwashCollected]
    }

    return `
        <div class="row">
            <div class="col-md-12">
                <h5>Confirm participant has consented, been verified and has not withdrawn</h5>
            </div>
        </div>

        <div class="row">
            <div class="col-md-4">
                <div class="col-md-12 info-box">
                    <div class="row">
                        <span class="full-width">Consent</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${data['919254129'] === 353358909 ? `<i class="fas fa-2x fa-check"></i>` : `<i class="fas fa-2x fa-times"></i>`}</i></span>
                    </div>
                    <div class="row">
                        <span class="full-width">${new Date(data['454445267']).toLocaleString()}</span>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="col-md-12 info-box">
                    <div class="row">
                        <span class="full-width">Verification Status</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${data['821247024'] === 197316935 ? `<i class="fas fa-2x fa-check"></i>`: `<i class="fas fa-2x fa-times"></i>`}</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${verificationConversion[data['821247024']]}</span>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="col-md-12 info-box">
                    <div class="row">
                        <span class="full-width">Participation Status</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${data['912301837'] === 208325815 || data['912301837'] === 622008261 || data['912301837'] === 458508122 ? `<i class="fas fa-2x fa-check"></i>` :  `<i class="fas fa-2x fa-times"></i>`}</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${participationConversion[data['912301837']]}</span>
                    </div>
                </div>
            </div>
        </div>
            
        <br/>

        <div class="row">
            <div class="col-md-12">
                <h5>Baseline Sample Status</h5>
            </div>
        </div>

        <div class="row">
            <div class="col-md-4">
                <div class="col-md-12 info-box">
                    <div class="row">
                        <span class="full-width">Baseline Blood</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${getBaselineDisplayStatus("blood", baselineSampleStatusInfo)["htmlIcon"]}</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${getBaselineDisplayStatus("blood", baselineSampleStatusInfo)["text"]}</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${bloodCollection ? bloodCollection : '&nbsp;'}</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${bloodTime ? bloodTime : '&nbsp;'}</span>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="col-md-12 info-box">
                    <div class="row">
                        <span class="full-width">Baseline Mouthwash</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${getBaselineDisplayStatus("mouthwash", baselineSampleStatusInfo)["htmlIcon"]}</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${getBaselineDisplayStatus("mouthwash", baselineSampleStatusInfo)["text"]}</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${mouthwashCollection ? mouthwashCollection : '&nbsp;'}</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${mouthwashTime ? mouthwashTime : '&nbsp;'}</span>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="col-md-12 info-box">
                    <div class="row">
                        <span class="full-width">Baseline Urine</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${getBaselineDisplayStatus("urine", baselineSampleStatusInfo)["htmlIcon"]}</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${getBaselineDisplayStatus("urine", baselineSampleStatusInfo)["text"]}</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${urineCollection ? urineCollection : '&nbsp;'}</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${urineTime ? urineTime : '&nbsp;'}</span>
                    </div>
                </div>
            </div>
        </div>

        <br/>

        <div class="row">
            <div class="col-md-12">
                <h5>Has SSN been entered? </h5>
            </div>
        </div>
        
        <div class="row">
            <div class="col-md-4">
                <div class="col-md-12 info-box">
                    <div class="row">
                        <br>
                    </div>
                    <div class="row">
                        <span class="full-width">${data['311580100'] === 353358909 ? 'Full SSN Received' : data['914639140'] === 353358909 ? 'Partial SSN Received' : 'No SSN Entered'}</span>
                    </div>
                    <div class="row">
                        <br>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-4">
                <div class="col-md-12 info-box">
                    <div class="row">
                        <span class="full-width">SSN Survey Status</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${surveyConversion[data['126331570']]}</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${data['126331570'] === 615768760 ? data['943232079'] : data['126331570'] === 231311385 ? data['315032037'] : '<br>'}</span>
                    </div>
                    <div class="row">
                        <br>
                    </div>
                </div>
            </div>
        </div>
            
        <br/>

        <div class="row">
            <div class="col-md-12">
                <h5>Are Initial Surveys complete?</h5>
            </div>
        </div>

        <div class="row">
            <div class="col-md-4">
                <div class="col-md-12 info-box">
                    <div class="row">
                        <span class="full-width">Background and Overall Health</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${surveyConversion[data['949302066']]}</span>
                    </div>    
                    <div class="row">
                        <span class="full-width">${data['949302066'] === 615768760 ? data['205553981'] : data['949302066'] === 231311385 ? data['517311251'] : '<br>'}</span>
                    </div> 
                </div>
            </div>
            <div class="col-md-4">
                <div class="col-md-12 info-box">
                    <div class="row">
                        <span class="full-width">Medications, Reproductive Health, Excercise, and Sleep</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${surveyConversion[data['536735468']]}</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${data['536735468'] === 615768760 ? data['541836531'] : data['536735468'] === 231311385 ? data['832139544'] : ''}</span>
                    </div> 
                </div>
            </div>
            <div class="col-md-4">
                <div class="col-md-12 info-box">
                    <div class="row">
                        <span class="full-width">Smoking, Alcohol, and Sun Exposure</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${surveyConversion[data['976570371']]}</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${data['976570371'] === 615768760 ? data['386488297'] : data['976570371'] === 231311385 ? data['770257102'] : '<br>'}</span>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="col-md-12 info-box">
                    <div class="row">
                        <span class="full-width">Where you live and work</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${surveyConversion[data['663265240']]}</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${data['663265240'] === 615768760 ? data['452942800'] : data['663265240'] === 231311385 ? data['264644252'] : '<br>'}</span>
                    </div>
                </div>
            </div>
        </div>
            
        <br/>

        <div class="row">
            <div class="col-md-12">
                <h5>Other Surveys</h5>
            </div>
        </div>

        <div class="row">
            <div class="col-md-4">
                <div class="col-md-12 info-box">
                    <div class="row">
                        <span class="full-width">3-month Quality of Life Survey</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${surveyConversion[data[conceptIds.promisStatus]]}</span>
                    </div>    
                    <div class="row">
                        <span class="full-width">${data[conceptIds.promisStatus] === conceptIds.modules.started ? data[conceptIds.promisStartTime] : data[conceptIds.promisStatus] === conceptIds.modules.submitted ? data[conceptIds.promiseCompleteTime] : '<br>'}</span>
                    </div>
                </div>
            </div>
        </div>
            
        <br/>

        ${!isCheckedIn ?  
            `<div class="row">
                <div class="col-md-12">
                    <h5>Incentives</h5>
                </div>
            </div>

            <div class="row">
                <div class="col-md-4">
                    <div class="col-md-12 info-box">
                        <div class="row">
                            <span class="full-width">${data[conceptIds.paymentRound][conceptIds.baseline.visitId][conceptIds.paymentEligibility] === conceptIds.yes ? 'Eligible' : 'Not Eligible'}</span>
                        </div>
                        <div class="row">
                            <span class="full-width">${data[conceptIds.paymentRound][conceptIds.baseline.visitId][conceptIds.paymentEligibility] === conceptIds.yes ? '<i class="fas fa-2x fa-check"></i>' : '<i class="fas fa-2x fa-times"></i>'}</span>
                        </div>
                        <div class="row">
                            <span class="full-width">${data[conceptIds.paymentRound][conceptIds.baseline.visitId][conceptIds.paymentEligibility] === conceptIds.yes ? data[conceptIds.paymentRound][conceptIds.baseline.visitId][conceptIds.paymentEligibilityTime] : '<br/>'}</span>
                        </div>
                    </div>
                </div>
            </div>` : ``}
            
        <br/>

        <div class="row">
            <div class="col-md-12">
                <h5>Baseline Specimen Survey</h5>
            </div>
        </div>

        <div class="row">
            <div class="col-md-4">
                <div class="col-md-12 info-box">
                    <div class="row">
                        <span class="full-width">Baseline Specimen Survey</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${data['265193023'] === 231311385 ? '<i class="fas fa-2x fa-check"></i>' : '<i class="fas fa-2x fa-times"></i>'}</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${surveyConversion[data['265193023']]}</span>
                    </div>
                    <div class="row">
                        <span class="full-width">${data['265193023'] === 615768760 ? data['822499427'] : data['265193023'] === 231311385 ? data['222161762'] : ''}</span>
                    </div>
                </div>
            </div>
        </div>
            
        <br/>

        <div class="row" style="display: none;">
            Verify contact information &nbsp;
            <button type="button" class="btn btn-outline-primary" id="contactInformationModal" data-target="#biospecimenModal" data-toggle="modal">Contact Information</button>
        </div>
    `;
    
}

/**
 * @param {string} baselineType - "blood", "urine", or "mouthwash"
 * @param {object} baselineSampleStatusInfo - object containing the baseline sample values (blood time collected, blood collected boolean, ...)
 * @returns {object} An object with the template literal for the icon status of the baseline sample and the text. 
 * 
 * Ex. {
          "htmlIcon": `<span class="full-width"><i class="fas fa-2x fa-check"></i></span>`,
          "text": "Collected"
        }
*/
const getBaselineDisplayStatus = (baselineType, baselineSampleStatusInfo) => { 
    const { 
        bloodTime, 
        isBloodCollected, 
        urineTime, 
        isUrineCollected, 
        mouthwashTime, 
        isMouthwashCollected 
    } = baselineSampleStatusInfo;

    let isCollected;
    let collectionTime;

    if (baselineType === "blood") {
        isCollected = isBloodCollected;
        collectionTime = bloodTime;
    } else if (baselineType === "urine") {
        isCollected = isUrineCollected;
        collectionTime = urineTime;
    } else if (baselineType === "mouthwash") {
        isCollected = isMouthwashCollected;
        collectionTime = mouthwashTime;
    }

    if (isCollected === conceptIds.yes && collectionTime) {
        return {
            "htmlIcon": `<span class="full-width"><i class="fas fa-2x fa-check"></i></span>`,
            "text": "Collected"
        }
    } else if (isCollected === conceptIds.no && collectionTime) {
        return {
            htmlIcon: `<span class="full-width"><i class="fas fa-2x fa-hashtag" style="color: orange"></i></span>`,
            text: "In Progress"
        }
    } else {
        return {
            htmlIcon: `<span class="full-width"><i class="fas fa-2x fa-times"></i></span>`,
            text: "Not Collected"
        }
    }
};