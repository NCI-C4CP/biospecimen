import { addEventBarCodeScanner, collectionSettings, generateBarCode, getWorkflow, removeActiveClass, siteLocations, visitType, getCheckedInVisit, getSiteAcronym, numericInputValidator, getSiteCode, searchSpecimen, collectionInputValidator, addSelectionEventListener, autoTabInputField } from "./../shared.js";
import { addEventSpecimenLinkForm, addEventClinicalSpecimenLinkForm, addEventClinicalSpecimenLinkForm2, addEventNavBarParticipantCheckIn, addEventBackToSearch } from "./../events.js";
import { masterSpecimenIDRequirement } from "../tubeValidation.js";
import { conceptIds } from '../fieldToConceptIdMapping.js';

export const specimenTemplate = async (data, formData) => {
    removeActiveClass('navbar-btn', 'active')
    const navBarBtn = document.getElementById('navBarSpecimenLink');
    navBarBtn.style.display = 'block';
    navBarBtn?.classList.remove('disabled');
    navBarBtn?.classList.add('active');

    const isSpecimenLinkForm2 = !!formData;
    formData = formData ? formData : {};
    formData['siteAcronym'] = getSiteAcronym();
    formData['827220437'] = parseInt(getSiteCode());

    const workflow = getWorkflow();
    const locationSelection = JSON.parse(localStorage.getItem('selections'))?.specimenLink_location;

    let template = `
        </br>

        <div class="row">
            <h5>Specimen Link</h5>
        </div>
        </br>
        <div class="row">
            <div class="col">
                <div class="row specimenLinkParticipantInfo"><p><strong>Participant Name: </strong> ${data[conceptIds.lastName]},<span id=${conceptIds.firstName}>${data[conceptIds.firstName]}</span></p></div>
                <div class="row specimenLinkParticipantInfo"><p><strong>Date of Birth:</strong> ${data[conceptIds.birthMonth]}/${data[conceptIds.birthDay]}/${data[conceptIds.birthYear]}</span></p></div>
                <div class="row specimenLinkParticipantInfo"> <p> <strong>Connect ID:</strong> </p> <svg id="connectIdBarCode"></svg></div>
            </div>
        </div>

        </br>`

    template += `<div id="specimenLinkForm" data-participant-token="${data.token}" data-connect-id="${data.Connect_ID}">`;
        
    if (workflow === 'research') {
        let visit = visitType.filter(visit => visit.concept === getCheckedInVisit(data))[0];
            
        template += `
            <div class="">
                <h4>Link a new Collection ID</h4><br/>
                <h4> Visit: ${visit.visitType}</h4>
            </div>
            
            <div class="form-group row">`
                
        const siteAcronym = getSiteAcronym();
                
        if (siteLocations[workflow] && siteLocations[workflow][siteAcronym]) {

            
            // For the purposes of 1008 we are filtering out some locations.
            // This will require more discussion for a long-term implementation
            let siteLocationArray = siteLocations[workflow][siteAcronym]; // Form of [{location, concept}]
            siteLocationArray = siteLocationArray.filter(loc => 
                ['River East', 'South Loop', 'Orland Park', 'Henry Ford West Bloomfield Hospital', 'Sioux Falls Imagenetics'].indexOf(loc.location) === -1
                // 'Henry Ford Medical Center- Fairlane' has inconsistent spacing across environments: play it safe by omitting any combination of "Henry Ford" and "Fairlane"
                && (!loc.location.includes('Fairlane') || !loc.location.includes('Henry Ford')) 
            );
            
            template += `
                <label class="col-md-4 col-form-label" for="collectionLocation">Select Collection Location</label>
                <select class="form-control col-md-5" id="collectionLocation">
                    <option value='none'>Please Select Location</option>`

            if (siteAcronym === 'BSWH') {
                const sortedBSWHLocations = siteLocationArray.sort((a, b) => a.location.localeCompare(b.location));
                
                sortedBSWHLocations.forEach(site => {
                    template += `<option ${locationSelection === site.concept.toString() ? 'selected="selected"' : ""} value='${site.concept}'>${site.location}</option>`
                });
            } else {
                siteLocationArray.forEach(site => {
                    template += `<option ${locationSelection === site.concept.toString() ? 'selected="selected"' : ""} value='${site.concept}'>${site.location}</option>`
                });
            }

            template += `
                </select>`
        }
            
        template += `
            </div>
            <div class="form-group row">
                <label class="col-md-4 col-form-label" for="scanSpecimenID">Scan/Type Collection ID from Label Sheet</label>
                <input autocomplete="off" type="text" class="form-control col-md-5" placeholder="Scan/Type Collection ID from Label Sheet" id="scanSpecimenID" data-isscanned="false" /> 
            </div>

            </br>

            <div class="form-group row">
                <label class="col-md-4 col-form-label" for="scanSpecimenID2">Re-Scan/Type Collection ID from Label Sheet</label>
                <input autocomplete="off" type="text" class="form-control col-md-5" placeholder="Re-Scan/Type Collection ID from Label Sheet" id="scanSpecimenID2" data-isscanned="false" />
            </div>

            <div class="form-group row">
                <div class="col">
                    <button class="btn btn-outline-primary float-right" data-connect-id="${data.Connect_ID}" type="submit" id="researchSpecimenContinue">Submit</button>
                </div>
            </div>`;

    } else if(isSpecimenLinkForm2) {// clinical specimen page 2
        let visit = visitType.filter(visit => visit.concept === formData['331584571'].toString())[0];
            template += `<div class="row">
                            <div class="column">
                                <div class="row">Visit: ${visit.visitType}</div>
                                <div class="row">Blood Accession ID: ${formData['646899796'] || 'N/A'}</div>
                                <div class="row">Urine Accession ID: ${formData['928693120'] || 'N/A'}</div>
                                <div class="row">Link a new Collection ID</div>
                            </div>
                        </div>

                        <div class="form-group row">
                            <label class="col-md-4 col-form-label" for="scanSpecimenID">Scan/Type Collection ID from Label Sheet</label>
                            <input autocomplete="off" type="text" class="form-control col-md-5" placeholder="Scan/Type Collection ID from Label Sheet" id="scanSpecimenID" data-isscanned="false" /> 
                        </div>
                        </br>
                        <div class="form-group row">
                            <label class="col-md-4 col-form-label" for="scanSpecimenID2">Re-Scan/Type Collection ID from Label Sheet</label>
                            <input autocomplete="off" type="text" class="form-control col-md-5" placeholder="Re-Scan/Type Collection ID from Label Sheet" id="scanSpecimenID2" data-isscanned="false" />
                        </div>

                        <div class="form-group row">
                            <div class="col">
                                <button class="btn btn-outline-primary float-right" data-connect-id="${data.Connect_ID}" type="submit" id="clinicalSpecimenContinueTwo">Submit</button>
                            </div>
                        </div>`
    } else {// clinical specimen page 1
        template += `<div class="form-group row">`
        const siteAcronym = getSiteAcronym();
        template += `<select class="custom-select" id="visit-select">
                                <option value=""> -- Select Visit -- </option>`;
                                
                Array.from(visitType).forEach(option => {
                    template += option.visitType === "Baseline" ? `<option value=${option.concept}>${option.visitType}</option>` : `<option value=${option.concept} disabled>${option.visitType}</option>`;
                })

                template += `</select>`;
        template += `</div>`;
        template += `
            <div class="form-group row">
                <label class="col-md-4 col-form-label" for="accessionID1">Scan Blood Accession ID:</label>
                <input autocomplete="off" type="text" class="form-control col-md-5" placeholder="Scan/Type in Accession ID from Blood Tube" id="accessionID1" maxlength="11"/>
                
                <button class="barcode-input-clear" hidden="true" type="button" id="clearScanAccessionID" title="Clear scanned barcode" data-enable-input="accessionID2" data-barcode-input="accessionID1"><i class="fas fa-times"></i></button>
                <div class="helper-text"><span class="form-helper-text offset-4">This entry can only contain numbers.</span></div>
            </div>
            <div class="form-group row">
                <input autocomplete="off" type="text" class="form-control col-md-5 offset-4" placeholder="Re-Enter (scan/type) in Accession ID from Blood Tube" id="accessionID2" maxlength="11"/>
                <div id="accessionId2Error" class="invalid-feedback col-md-5 offset-4 form-helper-text" style="padding-left:0; "></div>
            </div>
            </br>
            <div class="form-group row">
                <label class="col-md-4 col-form-label" for="accessionID3">Scan Urine Accession ID:</label>
                <input autocomplete="off" type="text" class="form-control col-md-5" placeholder="Scan/Type in Accession ID from Urine Tube" id="accessionID3" maxlength="11"/>
                
                <button class="barcode-input-clear" hidden="true" type="button" id="clearScanAccessionID" title="Clear scanned barcode" data-enable-input="accessionID4" data-barcode-input="accessionID3"><i class="fas fa-times"></i></button>
            </div>
            <div class="form-group row">
                <input autocomplete="off" type="text" class="form-control col-md-5 offset-4" placeholder="Re-Enter (scan/type) in Accession ID from Urine Tube" id="accessionID4" maxlength="11"/>
                <div id="accessionId4Error" class="invalid-feedback col-md-5 offset-4 form-helper-text" style="padding-left:0; "></div>
            </div>
            
        <div class="form-group row">
            <div class="col">
                <button class="btn btn-outline-primary float-right" data-connect-id="${data.Connect_ID}" data-participant-name="${data['471168198']}" type="submit" id="clinicalSpecimenContinue">Submit</button>
            </div>
        </div>`
    }

    template += `
        </div>
        </br>`;

    document.getElementById('contentBody').innerHTML = template;
     
    if (workflow === 'research') {
        document.getElementById('scanSpecimenID2').onpaste = e => e.preventDefault();
        
        addSelectionEventListener("collectionLocation", "specimenLink_location");
        collectionInputValidator(['scanSpecimenID', 'scanSpecimenID2']);

        addEventSpecimenLinkForm(formData);
    } else if (isSpecimenLinkForm2) {// clinical specimen page 2
        document.getElementById('scanSpecimenID2').onpaste = e => e.preventDefault();

        collectionInputValidator(['scanSpecimenID', 'scanSpecimenID2']);

        addEventClinicalSpecimenLinkForm2(formData);
    } else {//clinical specimen page 1
        autoTabInputField('accessionID1', 'accessionID2')
        autoTabInputField('accessionID2', 'accessionID3')
        autoTabInputField('accessionID3', 'accessionID4')

        document.getElementById('accessionID2').onpaste = e => e.preventDefault();
        document.getElementById('accessionID4').onpaste = e => e.preventDefault();

        numericInputValidator(['accessionID1', 'accessionID2', 'accessionID3', 'accessionID4']);

        // add form validation on user input for accession IDs 3 and 4
        checkAccessionMatch(['accessionID1', 'accessionID2', 'accessionID3', 'accessionID4']);
        
        addEventClinicalSpecimenLinkForm(formData);
    }

    generateBarCode('connectIdBarCode', data.Connect_ID);
    addEventBackToSearch('navBarSearch');
    addEventNavBarParticipantCheckIn();
}

/**
 * Adds event listeners to the form fields to make sure accession inputs are checked and have matching values
*/
const checkAccessionMatch = () => { 
    const accessionId1 = document.getElementById('accessionID1');
    const accessionId2 = document.getElementById('accessionID2');
    const accessionId3 = document.getElementById('accessionID3');
    const accessionId4 = document.getElementById('accessionID4');
    const accessionId2Error = document.getElementById('accessionId2Error');
    const accessionId4Error = document.getElementById('accessionId4Error');
        
    accessionId2.addEventListener('blur', () => { 
        if (accessionId1.value !== accessionId2.value) {
            addAccessionError(accessionId1, accessionId2, accessionId2Error, 'blood');
        } else {
            removeAccessionError(accessionId1, accessionId2, accessionId2Error);
        }
    });

    accessionId4.addEventListener('blur', () => { 
        if (accessionId4.value !== accessionId3.value) {
            addAccessionError(accessionId3, accessionId4, accessionId4Error, 'urine');
        } else {
            removeAccessionError(accessionId3, accessionId4, accessionId4Error);
        }
    });

    // add blur event handler logic the accession Id inputs for 1 and 2, when user retypes bloor or urine (not reenter input fields)
    accessionId1.addEventListener('blur', () => {
        if (accessionId1.classList.contains('is-invalid')) {
            if (accessionId1.value === accessionId2.value) {
                removeAccessionError(accessionId1, accessionId2, accessionId2Error);
            }
        }

        if (accessionId1.value.length > 0 && 
            accessionId2.value.length > 0 && 
            accessionId1.value !== accessionId2.value) {
            addAccessionError(accessionId1, accessionId2, accessionId2Error, 'blood');
        }
    });

    accessionId3.addEventListener('blur', () => {
        if (accessionId3.classList.contains('is-invalid')) {
            if (accessionId3.value === accessionId4.value) {
                removeAccessionError(accessionId3, accessionId4, accessionId4Error);
            }
        }
        if (accessionId3.value.length > 0 && 
            accessionId4.value.length > 0 && 
            accessionId3.value !== accessionId4.value) {
            addAccessionError(accessionId3, accessionId4, accessionId4Error, 'urine'); 
        }
    });
};

/**
 * Adds error class ".is-invalid" and error message to the accession input field
 * @param {Element} accessionInput1 - doc element of input  (Ex. accessionID1)
 * @param {Element} accessionInput2 - doc element of input  (Ex. accessionID2)
 * @param {Element} accessionError - accession for element error text, where the error message will display
 * @param {string} accessionType - blood or urine
 */
const addAccessionError = (accessionInput1, accessionInput2, accessionError, accessionType) => { 
    accessionInput1.classList.add('is-invalid');
    accessionInput2.classList.add('is-invalid');

    if (accessionError) {
        accessionError.textContent = `The ${accessionType} accession IDs do not match.`;
    }
};

/**
 * Removes error class ".is-invalid" and error message from the accession input field
 * @param {Element} accessionInput1 - doc element of input  (Ex. accessionID1)
 * @param {Element} accessionInput2 - doc element of input  (Ex. accessionID2)
 * @param {Element} accessionError - accession for element Error
*/
const removeAccessionError = (accessionInput1, accessionInput2, accessionError) => { 
    accessionInput1.classList.remove('is-invalid');
    accessionInput2.classList.remove('is-invalid');

    if (accessionError) accessionError.textContent = '';
};