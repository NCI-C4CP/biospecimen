import { addEventBarCodeScanner, collectionSettings, generateBarCode, getWorkflow, removeActiveClass, siteLocations, visitType, getCheckedInVisit, getSiteAcronym, numericInputValidator, getSiteCode, searchSpecimen, collectionInputValidator, addSelectionEventListener, autoTabInputField, errorMessage, removeAllErrors, removeSingleError, deprecatedResearchCollectionLocations } from "./../shared.js";
import { addEventSpecimenLinkForm, addEventClinicalSpecimenLinkForm, addEventClinicalSpecimenLinkForm2, addEventNavBarParticipantCheckIn, addEventBackToSearch, checkAccessionMatch } from "./../events.js";
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
            <h4>Specimen Link</h4>
        </div>
        <div class="row"> 
            <p class="input-note">
                Double check participant name and DOB before completing Specimen Link
            </p>  
        </div>
        </br>
        <div class="row">
            <div class="col">
                <div class="row specimenLinkParticipantInfo" data-section="name">
                    <p>
                        <strong>Participant Name: </strong> 
                        <span id="${conceptIds.lastName}">${data[conceptIds.lastName]}</span>, 
                        <span id="${conceptIds.firstName}">${data[conceptIds.firstName]}</span>
                    </p>
                </div>
                <div class="row specimenLinkParticipantInfo" data-section="dob">
                    <p>
                        <strong>Date of Birth:</strong> 
                        ${data[conceptIds.birthMonth]}/${data[conceptIds.birthDay]}/${data[conceptIds.birthYear]}
                    </p>
                </div>
                <div class="row specimenLinkParticipantInfo">
                    <p> 
                        <strong>Connect ID:</strong> 
                    </p> 
                    <svg id="connectIdBarCode"></svg>
                </div>
            </div>
        </div>

        </br>
    `;

    template += `<div id="specimenLinkForm" data-participant-token="${data.token}" data-connect-id="${data.Connect_ID}">`;
        
    if (workflow === 'research') {
        let visit = visitType.filter(visit => visit.concept === getCheckedInVisit(data))[0];
            
        template += `
            <div class="">
                <h4>Link a new Collection ID</h4><br/>
                <h4> Visit: ${visit.visitType}</h4>
            </div>
            
            <div class="mb-3 row">`
                
        const siteAcronym = getSiteAcronym();

        if (siteLocations[workflow] && siteLocations[workflow][siteAcronym]) {
            let siteLocationArray = siteLocations[workflow][siteAcronym]; // Form of [{location, concept}]

            siteLocationArray = siteLocationArray.filter(loc => !deprecatedResearchCollectionLocations.includes(loc.location));
            
            template += `
                <label class="col-md-4 col-form-label" for="collectionLocation">Select Collection Location</label>
                <div class="col-md-5">
                 <select class="form-control form-select" id="collectionLocation">
                    <option value='none'>Please Select Location</option>
            `;

            if (['BSWH', 'SFH', 'HFHS'].includes(siteAcronym)) { // sort collection locations with these site acronyms
                const sortedLocations = siteLocationArray.sort((a, b) => a.location.localeCompare(b.location));

                sortedLocations.forEach(site => {
                    template += `<option ${locationSelection === site.concept.toString() ? 'selected="selected"' : ""} value='${site.concept}'>${site.location}</option>`;
                });
            } else {
                siteLocationArray.forEach(site => {
                    template += `<option ${locationSelection === site.concept.toString() ? 'selected="selected"' : ""} value='${site.concept}'>${site.location}</option>`;
                });
            }

            template += `
                </select>
            </div>`;
        }
            
        template += `
            </div>
            <div class="mb-3 row">
                <label class="col-md-4 col-form-label" for="scanSpecimenID">Scan/Type Collection ID from Label Sheet</label>
                <div class="col-md-5">
                    <input autocomplete="off" type="text" class="form-control" placeholder="Scan/Type Collection ID from Label Sheet" id="scanSpecimenID" data-isscanned="false" /> 
                </div>
            </div>

            </br>

            <div class="mb-3 row">
                <label class="col-md-4 col-form-label" for="scanSpecimenID2">Re-Scan/Type Collection ID from Label Sheet</label>
                <div class="col-md-5">
                    <input autocomplete="off" type="text" class="form-control" placeholder="Re-Scan/Type Collection ID from Label Sheet" id="scanSpecimenID2" data-isscanned="false" />
                </div>
            </div>

            <div class="mb-3 row">
                <div class="col">
                    <button class="btn btn-outline-primary float-end" data-connect-id="${data.Connect_ID}" type="submit" id="researchSpecimenContinue">Submit</button>
                </div>
            </div>`;

    } else if (isSpecimenLinkForm2) { // clinical specimen page 2
        let visit = visitType.filter(visit => visit.concept === formData['331584571'].toString())[0];
            template += `<div class="row">
                            <div class="column">
                                <div class="row">Visit: ${visit.visitType}</div>
                                <div class="row">Blood Accession ID: ${formData['646899796'] || 'N/A'}</div>
                                <div class="row">Urine Accession ID: ${formData['928693120'] || 'N/A'}</div>
                                <div class="row">Link a new Collection ID</div>
                            </div>
                        </div>

                        <div class="mb-3 row">
                            <label class="col-md-4 col-form-label" for="scanSpecimenID">Scan/Type Collection ID from Label Sheet</label>
                            <input autocomplete="off" type="text" class="form-control col-md-5" placeholder="Scan/Type Collection ID from Label Sheet" id="scanSpecimenID" data-isscanned="false" /> 
                        </div>
                        </br>
                        <div class="mb-3 row">
                            <label class="col-md-4 col-form-label" for="scanSpecimenID2">Re-Scan/Type Collection ID from Label Sheet</label>
                            <input autocomplete="off" type="text" class="form-control col-md-5" placeholder="Re-Scan/Type Collection ID from Label Sheet" id="scanSpecimenID2" data-isscanned="false" />
                        </div>

                        <div class="mb-3 row">
                            <div class="col">
                                <button class="btn btn-outline-primary float-end" data-connect-id="${data.Connect_ID}" type="submit" id="clinicalSpecimenContinueTwo">Submit</button>
                            </div>
                        </div>`
    } else { // clinical specimen page 1
        template += `<div class="mb-3 row">`
        const siteAcronym = getSiteAcronym();
        template += `<select class="form-select" id="visit-select">
                                <option value=""> -- Select Visit -- </option>`;
                                
                Array.from(visitType).forEach(option => {
                    template += option.visitType === "Baseline" ? `<option value=${option.concept}>${option.visitType}</option>` : `<option value=${option.concept} disabled>${option.visitType}</option>`;
                })

                template += `</select>`;
        template += `</div>`;
        template += `
            <div class="mb-3 row">
                <label class="col-md-4 col-form-label" for="accessionID1">Scan Blood Accession ID:</label>
                <input autocomplete="off" type="text" class="form-control col-md-5" placeholder="Scan/Type in Accession ID from Blood Tube" id="accessionID1" maxlength="11"/>
                
                <button class="barcode-input-clear" hidden="true" type="button" id="clearScanAccessionID" title="Clear scanned barcode" data-enable-input="accessionID2" data-barcode-input="accessionID1"><i class="fas fa-times"></i></button>
                <div class="helper-text"><span class="form-helper-text offset-4">This entry can only contain numbers.</span></div>
            </div>
            <div class="mb-3 row">
                <input autocomplete="off" type="text" class="form-control col-md-5 offset-4" placeholder="Re-Enter (scan/type) in Accession ID from Blood Tube" id="accessionID2" maxlength="11"/>
            </div>
            </br>
            <div class="mb-3 row">
                <label class="col-md-4 col-form-label" for="accessionID3">Scan Urine Accession ID:</label>
                <input autocomplete="off" type="text" class="form-control col-md-5" placeholder="Scan/Type in Accession ID from Urine Tube" id="accessionID3" maxlength="11"/>
                
                <button class="barcode-input-clear" hidden="true" type="button" id="clearScanAccessionID" title="Clear scanned barcode" data-enable-input="accessionID4" data-barcode-input="accessionID3"><i class="fas fa-times"></i></button>
            </div>
            <div class="mb-3 row">
                <input autocomplete="off" type="text" class="form-control col-md-5 offset-4" placeholder="Re-Enter (scan/type) in Accession ID from Urine Tube" id="accessionID4" maxlength="11"/>
            </div>
            
        <div class="mb-3 row">
            <div class="col">
                <button class="btn btn-outline-primary float-end" data-connect-id="${data.Connect_ID}" data-participant-name="${data['471168198']}" type="submit" id="clinicalSpecimenContinue">Submit</button>
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
        autoTabInputField('scanSpecimenID', 'scanSpecimenID2');


        addEventSpecimenLinkForm(formData);
    } else if (isSpecimenLinkForm2) {// clinical specimen page 2
        document.getElementById('scanSpecimenID2').onpaste = e => e.preventDefault();

        collectionInputValidator(['scanSpecimenID', 'scanSpecimenID2']);
        autoTabInputField('scanSpecimenID', 'scanSpecimenID2');
        document.querySelector('.input-note').style.display = 'none';

        addEventClinicalSpecimenLinkForm2(formData);
    } else {//clinical specimen page 1
        autoTabInputField('accessionID1', 'accessionID2')
        autoTabInputField('accessionID2', 'accessionID3')
        autoTabInputField('accessionID3', 'accessionID4')

        document.getElementById('accessionID2').onpaste = e => e.preventDefault();
        document.getElementById('accessionID4').onpaste = e => e.preventDefault();

        numericInputValidator(['accessionID1', 'accessionID2', 'accessionID3', 'accessionID4']);
        checkAccessionMatch();
        
        addEventClinicalSpecimenLinkForm(data, formData);
    }

    generateBarCode('connectIdBarCode', data.Connect_ID);
    addEventBackToSearch('navBarSearch');
    addEventNavBarParticipantCheckIn();
};