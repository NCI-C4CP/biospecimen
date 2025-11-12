import { homeCollectionNavbar } from "./homeCollectionNavbar.js";
import { getIdToken, showAnimation, hideAnimation, appState, baseAPI, triggerErrorModal, processResponse, checkTrackingNumberSource, numericInputValidator, capsEnforcer, autoTabAcrossArray, performQCcheck, escapeHTML } from "../../shared.js";
import { nonUserNavBar } from "./../../navbar.js";
import { activeHomeCollectionNavbar } from "./homeCollectionNavbar.js";
import { conceptIds } from '../../fieldToConceptIdMapping.js';

const contentBody = document.getElementById("contentBody");
localStorage.setItem('tmpKitData', JSON.stringify([]));
appState.setState({uniqueKitID: ``});

export const kitAssemblyScreen = (auth) => {
  const user = auth.currentUser;
  if (!user) return;
  const name = user.displayName || user.email;
  showAnimation();
  kitAssemblyTemplate(name);
  hideAnimation();
}

const kitAssemblyTemplate = (name) => {
  let template = ``;
  template += homeCollectionNavbar();
  template += `
                <div class="row align-center welcome-screen-div">

                        <div class="col"><h3 style="margin:1rem 0 1.5rem;">Kit Assembly</h3></div>
                </div>`;

  template += `
          <div class="row">
              <div class="col">
              <div id="alert_placeholder"></div>
                  <form>
                        <div class="mb-3 row">
                          <label for="scannedBarcode" class="col-md-4 col-form-label">Return Kit Tracking Number</label>
                          <div class="col-md-8">
                            <div class="mb-3 row">
                              <input type="text" class="form-control" id="scannedBarcode" placeholder="Scan Barcode" required />
                              <span id="showMsg" style="font-size: 14px;"></span>
                            </div>
                            <label for="scannedBarcode2" class="visually-hidden">Confirm Return Kit Tracking Number</label>
                            <div class="mb-3 row">
                              <input autocomplete="off" type="text" class="form-control" id="scannedBarcode2" placeholder="Re-Enter (scan/type) Barcode" required />
                              <span id="showErrorMsg" style="font-size: 14px;"></span>
                            </div>
                          </div>
                        </div>
                        <div class="mb-3 row">
                          <label for="returnKitId" class="col-md-4 col-form-label">Return Kit ID</label>
                          <div class="col-md-8">
                            <input type="text" class="form-control" id="returnKitId" placeholder="Enter Return Kit ID" required />
                            <span id="showReturnKitErrorMsg" style="font-size: 14px; color: red;"></span>
                            </div>
                        </div>
                        <div class="mb-3 row" id="cupRow" aria-hidden="true" style="display: none;" >
                          <label for="cupId" class="col-md-4 col-form-label">Cup ID</label>
                          <div class="col-md-8">
                            <input type="text" class="form-control" id="cupId" placeholder="Enter Cup ID" disabled />
                          </div>
                        </div>
                        <div class="mb-3 row" id="cardRow" aria-hidden="true" style="display: none;" >
                          <label for="cardId" class="col-md-4 col-form-label">Card ID</label>
                          <div class="col-md-8">
                            <input type="text" class="form-control" id="cardId" placeholder="Enter Card ID" disabled />
                            <span id="showCardIdErrorMsg" style="font-size: 14px; color: red;"></span>
                          </div>
                      </div>
                      <div class="mb-3 row">
                        <label for="kitType" class="col-md-4 col-form-label">Kit Type</label>
                          <div class="col-md-8">
                            <div class="dropdown">
                            <!-- Defaulted to Mouthwash currently, as only Mouthwash is available. Button default text will be changed back later.-->
                              <button 
                                class="btn btn-secondary dropdown-toggle dropdown-toggle-sites" 
                                id="dropdownSites" type="button" 
                                data-bs-toggle="dropdown" 
                                aria-haspopup="true" 
                                aria-expanded="false"
                              >Mouthwash</button>
                                <ul class="dropdown-menu scrollable-menu" id="dropdownMenuButtonSites" aria-labelledby="dropdownMenuButton">
                                        <li><a class="dropdown-item" data-kitType="mouthwash" id="mouthwash">Mouthwash</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </form>
                <div class="mt-4 mb-4" style="display:inline-block;">
                  <button type="submit" class="btn btn-primary" id="saveKit">Save & Next</button>
                </div>
              </div>
              <div class="col-6">
                <div id="sidePane" style="width: 700px; height: 400px; overflow: auto; border: 1px solid #000">
                </div>
              </div>
        </div>`;

  document.getElementById("navbarNavAltMarkup").innerHTML = nonUserNavBar(name);
  contentBody.innerHTML = template;

  // Set up automatic tabbing between inputs upon scanning (assuming the scanner automatically inputs the enter key at the end)
  autoTabAcrossArray(['scannedBarcode', 'scannedBarcode2', 'returnKitId']);

  const scannedBarcode2 = document.getElementById('scannedBarcode2');
  scannedBarcode2.onpaste = e => e.preventDefault();
  numericInputValidator(['scannedBarcode', 'scannedBarcode2']);
  capsEnforcer(['returnKitId']);
  activeHomeCollectionNavbar();
  processAssembledKit();
  enableEnterKeystroke();
  dropdownTrigger();
  checkTrackingNumberSource();
  // Trim FedEx tracking numbers (1033)
  // Already done for the scannedBarcode input in checkTrackingNumberSource
  scannedBarcode2.addEventListener("input", (e) => {
    const input = e.target.value.trim();
    if (input.length === 34) {
      e.target.value = input.slice(-12);
    }
  });
  document.getElementById('returnKitId').addEventListener("input", e => {
    // Automatically show and populate read-only cup and card ID inputs
    const input = e.target.value.trim();
    const cupRow = document.getElementById('cupRow');
    const cardRow = document.getElementById('cardRow');
    if(input) {
      if(cupRow.style.display === 'none') {
        cupRow.style = '';
        cupRow.ariaHidden = 'false';
      }
      if(cardRow.style.display === 'none') {
        cardRow.style = '';
        cardRow.ariaHidden = 'false';
      }
    } else {
        if(cupRow.style.display !== 'none') {
          cupRow.style.display = 'none';
          cupRow.ariaHidden = 'true';
        }
        if(cardRow.style.display !== 'none') {
          cardRow.style.display = 'none';
          cardRow.ariaHidden = 'true';
        }
    }
    document.getElementById('cupId').value = input;
    document.getElementById('cardId').value = input;
  })
  performQCcheck('scannedBarcode2', 'scannedBarcode', 'showErrorMsg', `Return Kit Tracking Number doesn't match`);
};

const enableEnterKeystroke = () => {
  document.getElementById("cardId").addEventListener("keyup", (event) => {
    event.preventDefault();
    if (event.key === 'Enter') {
        document.getElementById("saveKit").click();
    }
});
}

const processAssembledKit = () => {
  const saveKitButton = document.getElementById('saveKit');
  if (saveKitButton) {
    saveKitButton.addEventListener('click', async () => { 
        let kitObj = {};
        const queryScannedBarcodeValue = escapeHTML(document.getElementById('scannedBarcode')?.value)?.trim();
        const scannedBarcodeValue = (queryScannedBarcodeValue !== undefined) ? queryScannedBarcodeValue : "";

        const confirmScannedBarcodeValue = escapeHTML(document.getElementById('scannedBarcode2')?.value)?.trim();

        const queryReturnKitIdValue = escapeHTML(document.getElementById('returnKitId')?.value)?.trim();
        const returnKitIdValue = (queryReturnKitIdValue !== undefined) ? queryReturnKitIdValue.toUpperCase() : "";

        if (queryScannedBarcodeValue !== confirmScannedBarcodeValue) {
            triggerErrorModal('Return Kit tracking number doesn\'t match.');
        } else if (scannedBarcodeValue.length === 0 || returnKitIdValue.length === 0 || document.getElementById('dropdownSites').innerHTML !== 'Mouthwash') {
            triggerErrorModal('One or more fields are missing.');
        } else if (!/^[A-Z0-9]{9}\s\d{4}$/i.test(returnKitIdValue)) {
          triggerErrorModal('Collection Cup and Card IDs must be of the format of nine characters, a space, and four digits.');
        } else {
            kitObj[conceptIds.returnKitTrackingNum] = scannedBarcodeValue;
            kitObj[conceptIds.supplyKitId] = returnKitIdValue;
            kitObj[conceptIds.returnKitId] = returnKitIdValue;
            kitObj[conceptIds.collectionCupId] = returnKitIdValue
            kitObj[conceptIds.collectionCardId] = returnKitIdValue;
            kitObj[conceptIds.kitType] = conceptIds.mouthwashKitType;
            try {
                showAnimation();
                const responseStoredStatus = await storeAssembledKit(kitObj);
                if (responseStoredStatus) {
                    document.getElementById('scannedBarcode').value = ``;
                    document.getElementById('scannedBarcode2').value = ``;
                    document.getElementById('returnKitId').value = ``;
                    document.getElementById('cupId').value = ``;
                    document.getElementById('cardId').value = ``;
                    document.getElementById("showMsg").innerHTML = ``;
                    document.getElementById("showErrorMsg").innerHTML = ``;
                    // Clear error modal
                    document.getElementById("alert_placeholder").innerHTML = ``;
                  }
                  // No else needed because error messaging is handled within storeAssembledKit
            } catch (error) { 
                console.error(error);
                triggerErrorModal('Failed to save the kit.');
            } finally {
                hideAnimation();
            }
        }
    });
  }
}


const renderSidePane = () => {
  const kitObjects = JSON.parse(localStorage.getItem('tmpKitData'));
  let html =  `&nbsp;<b>Kits Assembled:</b> ${Object.keys(kitObjects).length}`;
  kitObjects.forEach((kitObject) => {
    const sanitizedCupId = escapeHTML(kitObject[conceptIds.collectionCupId].replace(/\s/g, "\n"));
    const sanitizedCardId = escapeHTML(kitObject[conceptIds.collectionCardId].replace(/\s/g, "\n"));
    const sanitizedBarcode = escapeHTML(kitObject[conceptIds.returnKitTrackingNum]);
    const sanitizedReturnKitId = escapeHTML(kitObject[conceptIds.returnKitId]);
    html +=
      `<ul style="overflow-y: scroll;">
        <br />
        Scanned Barcode = ${sanitizedBarcode} |
        Return Kit ID = ${sanitizedReturnKitId} |
        Cup Id = ${sanitizedCupId} |
        Card Id = ${sanitizedCardId}
        <button type="button" class="btn btn-outline-primary detailedRow" data-kitObject=${encodeURIComponent(JSON.stringify(kitObject))} id="editAssembledKits">Edit</button>
      </ul>`
  });
  document.getElementById('sidePane').innerHTML = html;
  editAssembledKits();
}



const editAssembledKits = () => {
  const detailedRow = Array.from(document.getElementsByClassName('detailedRow'));
  if (detailedRow) {
    Array.from(detailedRow).forEach(function(editKitBtn) {
      editKitBtn.addEventListener('click', () => {
        let data = decodeURIComponent(editKitBtn.getAttribute('data-kitObject'));
        const editKitObj = JSON.parse(data);
        document.getElementById('scannedBarcode').value = editKitObj[conceptIds.returnKitTrackingNum];
        document.getElementById('returnKitId').value = editKitObj[conceptIds.returnKitId];
        document.getElementById('cupId').value = editKitObj[conceptIds.collectionCupId].slice(0, -4) + " " + editKitObj[conceptIds.collectionCupId].slice(-4);
        document.getElementById('cardId').value = editKitObj[conceptIds.collectionCardId].slice(0, -4) + " " + editKitObj[conceptIds.collectionCardId].slice(-4);
        appState.setState({uniqueKitID: editKitObj[conceptIds.uniqueKitID]});
      });
    }); // state to indicate if it's an edit & also pass the uniqueKitID
}}

const storeAssembledKit = async (kitData) => {
  const idToken = await getIdToken();
  // Both addKitData and updateKitData run uniqueness checks, so we do not need to make a separate checkUniqueness call here

    const kitIsNew = appState.getState().uniqueKitID === ``;
    const api = kitIsNew ? 'addKitData' : 'updateKitData';
    kitData[conceptIds.kitStatus] = conceptIds.pending;
    kitData[conceptIds.uniqueKitID] = kitIsNew ? "MW" + Math.random().toString(16).slice(2) : appState.getState().uniqueKitID;
    kitData[conceptIds.pendingDateTimeStamp] = new Date().toISOString();

    const response = await fetch(`${baseAPI}api=${api}`, {
      method: "POST",
      body: JSON.stringify(kitData),
      headers: {
        Authorization: "Bearer " + idToken,
        "Content-Type": "application/json",
      },
    });

    const responseStatus = await processResponse(response);

    if (responseStatus === true) {
      alertTemplate(`Kit saved successfully!`, `success`);
      const existingKitData = JSON.parse(localStorage.getItem('tmpKitData'));
      existingKitData.push(kitData);

      if (appState.getState().uniqueKitID !== ``) {
        const filteredKitData = [];
        const seenValues = new Set();

        for (let i = existingKitData.length - 1; i >= 0; i--) { // removes previously assembled kit
          const key = existingKitData[i][conceptIds.uniqueKitID];

          if (!seenValues.has(key)) {
              seenValues.add(key);
              filteredKitData.push(existingKitData[i]);
          }
      }
        appState.setState({uniqueKitID: ``})
        localStorage.setItem('tmpKitData', JSON.stringify(filteredKitData))
      }
      else {
        localStorage.setItem('tmpKitData', JSON.stringify(existingKitData))
      }
      renderSidePane();
      return true;
    }
    else if (responseStatus === 'Check Collection ID'){
      alertTemplate('Check collection ID format.');
      return false;
    }
    else if (responseStatus === 'duplicate supplykit id'){
      alertTemplate('This Supply Kit ID is unavailable.');
      return false;
    }
    else if (responseStatus === 'duplicate collection id'){
      alertTemplate('The collection card and cup ID are already in use.');
      return false;
    }
    else if (responseStatus === 'duplicate return kit tracking number'){
      alertTemplate('This tracking number has already been used.');
      return false;
    }
    else if (responseStatus === 'return kit tracking number is for supply kit'){
      alertTemplate('This tracking number has already been used.');
      return false;
    }
    else {
      console.error('Response error', responseStatus);
      alertTemplate(`Failed to save the kit.`);
      return false;
    }
}

const alertTemplate = (message, status = "warn", duration = 3000) => {
  if (status === "success") {
    const alertHtml = `
    <div id="alert-success" class="alert alert-success alert-dismissible fade show" role="alert">
      <strong>${message}</strong>
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close">
      </button>
    </div>`
    ;
    contentBody.insertAdjacentHTML("afterbegin", alertHtml);
    closeAlert(status, duration);
  } else if (status === "warn") {
    const alertHtml = `<div id="alert-warning" class="alert alert-danger alert-dismissible fade show" role="alert">
    <strong>${message}</strong>
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close">
    </button>
  </div>`;
    contentBody.insertAdjacentHTML("afterbegin", alertHtml);
    closeAlert(status, duration);
  }
};

// Automatically Close Alert Message
const closeAlert = (status = "warn", duration = 5000) => {
  if (status === "success") {
    const alertSuccess = document.getElementById("alert-success");
    alertSuccess.style.display = "block";
    setTimeout(function () {
      alertSuccess.style.display = "none";
    }, duration);
  } else if (status === "warn") {
    const alertWarning = document.getElementById("alert-warning");
    alertWarning.style.display = "block";
    setTimeout(function () {
      alertWarning.style.display = "none";
    }, duration);
  }
};

const dropdownTrigger = () => {
  const dropdownSiteBtn = document.getElementById('dropdownSites');
  const dropdownMenuButton = document.getElementById('dropdownMenuButtonSites');

  if (dropdownMenuButton) {
    dropdownMenuButton.addEventListener('click', (e) => {
      dropdownSiteBtn.innerHTML = escapeHTML(e.target.textContent);  
    });
  }
}
