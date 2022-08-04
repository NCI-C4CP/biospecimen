import { addEventBarCodeScanner, collectionSettings, generateBarCode, getWorflow, removeActiveClass, siteLocations, visitType, getCheckedInVisit, getSiteAcronym, getSiteCode } from "../shared.js";
import { addEventSpecimenLinkForm, addEventNavBarParticipantCheckIn, addEventBackToSearch } from "../events.js";
import { masterSpecimenIDRequirement } from "../tubeValidation.js";

export const clinicalSpecimenTemplate = async (data) => {
    removeActiveClass('navbar-btn', 'active')
    const navBarBtn = document.getElementById('navBarSpecimenLink');
    navBarBtn.style.display = 'block';
    navBarBtn?.classList.remove('disabled');
    navBarBtn?.classList.add('active');

    // get rid of all this
    let formData = {};
    formData['siteAcronym'] = getSiteAcronym();
    formData['827220437'] = parseInt(getSiteCode());
    let visit = visitType.filter(visit => visit.concept === getCheckedInVisit(data))[0];


    let template = `
        </br>

        <div class="row">
            <h5>Specimen Link</h5>
        </div>
        </br>
        <div class="row">
            <div class="col">
                <div class="row">${data['996038075']},<span id='399159511'>${data['399159511']}</span></div>
                <div class="row">Connect ID: <svg id="connectIdBarCode"></svg></div>
            </div>
        </div>

        </br>

        <div class="">
            <h4>Link a new Collection ID</h4><br/>
        </div>

        <form id="clinicalSpecimenLinkForm" method="POST" data-participant-token="${data.token}" data-connect-id="${data.Connect_ID}">
            <div class="form-group row">`
                const siteAcronym = getSiteAcronym();
                template += `<select class="custom-select" id="visit-select">
                                        <option value=""> -- Select Visit -- </option>`;
                                        
                        Array.from(visitType).forEach(option => {
                            template += option.visitType === "Baseline" ? `<option value=${option.concept}>${option.visitType}</option>` : `<option value=${option.concept} disabled>${option.visitType}</option>`;
                        })

                        template += `</select>`;
            template +=`</div>`
                template += `
                    <div class="form-group row">
                        <label class="col-md-4 col-form-label" for="accessionID1">Scan Blood Accession ID:</label>
                        <input autocomplete="off" type="text" class="form-control col-md-5" ${siteAcronym === 'KPCO' || siteAcronym === 'KPGA' || siteAcronym === 'KPNW' || siteAcronym === 'KPHI' ? 'required': ''} placeholder="Scan/Type in Accession ID from Tube" id="accessionID1"/>
                        
                        <button class="barcode-input-clear" hidden="true" type="button" id="clearScanAccessionID" title="Clear scanned barcode" data-enable-input="accessionID2" data-barcode-input="accessionID1"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="form-group row">
                        <input autocomplete="off" type="text" class="form-control col-md-5 offset-4" placeholder="Re-Type in Accession ID from Tube" id="accessionID2"/>
                    </div>
                    </br>
                    <div class="form-group row">
                        <label class="col-md-4 col-form-label" for="accessionID3">Scan Urine Accession ID:</label>
                        <input autocomplete="off" type="text" class="form-control col-md-5" ${siteAcronym === 'KPCO' || siteAcronym === 'KPGA' || siteAcronym === 'KPNW' || siteAcronym === 'KPHI' ? 'required': ''} placeholder="Scan/Type in Accession ID from Tube" id="accessionID3"/>
                        
                        <button class="barcode-input-clear" hidden="true" type="button" id="clearScanAccessionID" title="Clear scanned barcode" data-enable-input="accessionID4" data-barcode-input="accessionID3"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="form-group row">
                        <input autocomplete="off" type="text" class="form-control col-md-5 offset-4" placeholder="Re-Type in Accession ID from Tube" id="accessionID4"/>
                    </div>
                    
            <div class="form-group row">
                <div class="col">
                    <button class="btn btn-outline-primary float-right" data-connect-id="${data.Connect_ID}" type="submit" id="clinicalSpecimenContinue">Submit</button>
                </div>
            </div>
        </form>
        </br>`
    
    document.getElementById('contentBody').innerHTML = template;
    document.getElementById('enterSpecimenID2').onpaste = e => e.preventDefault();
    // addEventBarCodeScanner('scanSpecimenIDBarCodeBtn', 0, masterSpecimenIDRequirement.length);
    // if(document.getElementById('scanAccessionIDBarCodeBtn')) addEventBarCodeScanner('scanAccessionIDBarCodeBtn');
    generateBarCode('connectIdBarCode', data.Connect_ID);
    addEventClinicalSpecimenLinkForm(formData);
    addEventBackToSearch('navBarSearch');
    addEventNavBarParticipantCheckIn();
}