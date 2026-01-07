import { homeCollectionNavbar, activeHomeCollectionNavbar } from "./homeCollectionNavbar.js";
import { getIdToken, showAnimation, hideAnimation, convertDateReceivedinISO, baseAPI, triggerSuccessModal, triggerErrorModal, processResponse, checkTrackingNumberSource, getCurrentDate, numericInputValidator, autoTabAcrossArray, sendInstantNotification, getLoginDetails } from "../../shared.js";
import { nonUserNavBar } from "./../../navbar.js";
import { conceptIds } from "../../fieldToConceptIdMapping.js";
import { displayInvalidCollectionDateModal, displayInvalidPackageInformationModal, displaySelectedPackageConditionListModal, setupLeavingPageMessage, addFormInputListenersOnLoad, handleBeforeUnload, enableCollectionCheckBox, validatePackageInformation, validateCollectionDate } from "../siteCollection/sitePackageReceipt.js";

const contentBody = document.getElementById("contentBody");

export const kitsReceiptScreen = async (auth) => {
  const user = auth.currentUser;
  if (!user) return;
  const name = user.displayName ? user.displayName : user.email;
  showAnimation();
  kitsReceiptTemplate(name);
  hideAnimation();
  setupLeavingPageMessage();
  addFormInputListenersOnLoad(true);
  formSubmit(); 
}

const defaultPackageCondition = conceptIds.pkgGoodCondition;

const kitsReceiptTemplate = async (name) => {
  let template = ``;
  template += homeCollectionNavbar();
  template += `
                <div class="row align-center welcome-screen-div">
                        <div class="col"><h3 style="margin:1rem 0 1.5rem;">Kits Receipt</h3></div>
                </div>`;

                template += `  <div id="root root-margin" style="padding-top: 25px;">
                  <div id="alert_placeholder"></div>
                  <div class="mt-3" >
                  <br />
                  <div class="row mb-3">
                    <label class="col-form-label col-md-4" for="scannedBarcode">Scan Return Kit Tracking Number</label>
                    <div style="display:inline-block;" class="col-md-8">
                      <input autocomplete="off" required="" type="text" id="scannedBarcode" style="width: 600px;" placeholder="Scan Barcode">
                      <span id="showMsg" style="padding-left: 10px;"></span>
                      <br />
                      <br />
                      <span><h6><i>Press command/control while clicking with the mouse to make multiple selections</i></h6></span>
                    </div>
                  </div>
                  
                  <div class="row mb-3">
                      <label class="col-form-label col-md-4" for="packageCondition">Select Package Condition</label>
                      <div style="display:inline-block; max-width:90%;" class="col-md-8"> 
                        <select required class="select-control" id="packageCondition" style="width:100%" multiple="multiple" data-selected="[${defaultPackageCondition}]" data-initial-value="[${defaultPackageCondition}]">
                            <option id="select-dashboard" value="">-- Select Package Condition --</option>
                            <option selected id="select-packageGoodCondition" value=${conceptIds.pkgGoodCondition}>Package in good condition</option>
                            <option id="select-pkgCrushed" value=${conceptIds.pkgCrushed}>Package Crushed</option>
                            <option id="select-pkgImproperPackaging" value=${conceptIds.pkgImproperPackaging}>Improper Packaging</option>
                            <option id="select-pkgCollectionCupDamaged" value=${conceptIds.pkgCollectionCupDamaged}>Collection Cup Damaged</option>
                            <option id="pkgCollectionCupLeakedPartialLoss" value=${conceptIds.pkgCollectionCupLeakedPartialLoss}>Collection Cup Leaked - Partial Sample Loss</option>
                            <option id="pkgCollectionCupLeakedTotalLoss" value=${conceptIds.pkgCollectionCupLeakedTotalLoss}>Collection Cup Leaked - Total Sample Loss</option>
                            <option id="select-pkgEmptyCupReturned" value=${conceptIds.pkgEmptyCupReturned}>Empty Cup Returned</option>
                            <option id="select-pkgIncorrectMaterialType" value=${conceptIds.pkgIncorrectMaterialType}>Incorrect Material Type</option>
                            <option id="select-pkgCollectionCupNotReturned" value=${conceptIds.pkgCollectionCupNotReturned}>Collection Cup Not Returned</option>
                            <option id="select-pkgOther" value=${conceptIds.pkgOther}>Other</option>
                        </select>
                      </div>
                  </div>
                  <div class="row mb-3">
                      <label class="col-form-label col-md-4" for="receivePackageComments">Comment</label>
                      <div class="col-md-8">
                        <textarea class="form-control" id="receivePackageComments" cols="30" rows="3" placeholder="Any comments?"></textarea>
                      </div>
                  </div>
                  <div class="row mb-3">
                      <label class="col-form-label col-md-4" for="dateReceived">Date Received</label>
                      <div class="col-md-8">
                        <input autocomplete="off" required class="form-control" type="date" type="text" id="dateReceived" value=${getCurrentDate()}>
                      </div>
                  </div>
                  <div id="collectionCard">
                      <div class="row mb-3">
                          <label class="col-form-label col-md-4 for="collectionCheckBox">Check if Collection Card Missing</label>
                          <div class="col-md-8">
                            <input type="checkbox" name="collectionCheckBox" id="collectionCheckBox">
                          </div>
                      </div>
                      <div class="row mb-3">
                          <label class="col-form-label col-md-4" for="collectionId">Collection Card ID</label>
                          <div class="col-md-8">
                            <input autocomplete="off" class="form-control" type="text" id="collectionId" placeholder="Scan or Enter a Collection Card ID">
                            <span id="showCollectionErrorMsg" style="font-size: 14px;"></span>
                          </div>
                      </div>
                      <div class="row mb-3">
                          <label class="col-form-label col-md-4" for="dateCollectionCard">Enter Collection Date from Collection Card</label>
                          <div class="col-md-8">
                            <input autocomplete="off" class="form-control" type="date" id="dateCollectionCard">
                          </div>
                      </div>
                      <div class="row mb-3">
                          <label class="col-form-label col-md-4" for="timeCollectionCard">Enter Collection Time from Collection Card</label>
                          <div class="col-md-8">
                            <input autocomplete="off" class="form-control" type="time" id="timeCollectionCard">
                          </div>
                      </div>
                      <div class="row mb-3">
                          <label class="col-form-label col-md-4" for="collectionComments">Comments on Card Returned</label>
                          <div class="col-md-8">
                            <textarea class="form-control" id="collectionComments" cols="30" rows="3" placeholder="Comments on the card?"></textarea>
                          </div>
                      </div>
                    </div>
                  
                  <div class="mt-4 mb-4" style="display:inline-block;">
                      <button type="button" class="btn btn-danger" id="clearForm">Clear</button>
                      <button type="submit" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalShowMoreData" id="save">Save</button>
                  </div>
              </div>
          </div>`;
template += `<div class="modal fade" id="modalShowMoreData" data-keyboard="false" tabindex="-1" role="dialog" data-backdrop="static" aria-hidden="true">
              <div class="modal-dialog modal-md modal-dialog-centered" role="document">
                  <div class="modal-content sub-div-shadow">
                      <div class="modal-header" id="modalHeader"></div>
                      <div class="modal-body" id="modalBody"></div>
                  </div>
              </div>
          </div>`
  

  document.getElementById("navbarNavAltMarkup").innerHTML = nonUserNavBar(name);
  contentBody.innerHTML = template;

  // Set up automatic tabbing between inputs upon scanning (assuming the scanner automatically inputs the enter key at the end)
  autoTabAcrossArray(['scannedBarcode', 'packageCondition', 'receivePackageComments', 'dateReceived', 'collectionCheckBox', 'collectionId', 'dateCollectionCard', 'timeCollectionCard', 'collectionComments']);
  
  numericInputValidator(['scannedBarcode']);
  activeHomeCollectionNavbar();
  checkTrackingNumberSource();
  performCollectionIdcheck();
  preventManualEntry();
};

const preventManualEntry = () => {
  document.getElementById("dateCollectionCard").addEventListener("keydown", (event) => {
    const { key, code } = event;
    if (key !== "Tab" && key !== "Enter" && code !== "Space") {
      event.preventDefault();
    }
  });
};

const performCollectionIdcheck = () => {
  const collectionIdField = document.getElementById('collectionId');
  if (collectionIdField) {
    collectionIdField.addEventListener("input", (e) => {
      if (collectionIdField.value.length < 14) {
        document.getElementById('showCollectionErrorMsg').innerHTML = `<i class="fa fa-exclamation-circle" style="font-size: 14px; color: red;"></i> Enter Correct Collection ID`;
      } else {
        document.getElementById('showCollectionErrorMsg').innerHTML = ``;
      }
    })
  }
}

const formSubmit = () => {
  const form = document.getElementById("save");
  form.addEventListener("click", async (e) => {
      e.preventDefault();
      const modalHeaderEl = document.getElementById("modalHeader");
      const modalBodyEl = document.getElementById("modalBody");
      const isPackageInfoValid = validatePackageInformation(true);
      const questionableCollectionDate = await validateCollectionDate();

      if (isPackageInfoValid) {
        displaySelectedPackageConditionListModal(modalHeaderEl, modalBodyEl, true, questionableCollectionDate);
      } else {
        displayInvalidPackageInformationModal(modalHeaderEl, modalBodyEl);
      }
  });
};

export const confirmKitReceipt = (questionableCollectionDateConfirmed) => {
  const confirmReceiptBtn = document.getElementById('confirmReceipt');
  if (confirmReceiptBtn) {
    confirmReceiptBtn.addEventListener('click',  async () => {
      let kitObj = {};
      let packageConditions = [];
      const scannedBarcode = document.getElementById('scannedBarcode').value.trim();
      kitObj[conceptIds.returnKitTrackingNum] = scannedBarcode
      for (let option of document.getElementById('packageCondition').options) {
        if (option.selected) {packageConditions.push(option.value)}
      }
      kitObj[conceptIds.pkgReceiptConditions] = packageConditions;
      kitObj[conceptIds.kitPkgComments] = document.getElementById('receivePackageComments').value.trim();
      kitObj[conceptIds.receivedDateTime] = convertDateReceivedinISO(document.getElementById('dateReceived').value);
      if (document.getElementById('collectionId').value) {
        kitObj[conceptIds.collectionCupId] = document.getElementById('collectionId').value;
        const dateCollectionCard = document.getElementById('dateCollectionCard').value;
        const timeCollectionCard = document.getElementById('timeCollectionCard').value;
        if(dateCollectionCard && timeCollectionCard) {
          kitObj[conceptIds.collectionDateTimeStamp] = dateCollectionCard + 'T' + timeCollectionCard + ':00.000Z';
        }
        
        kitObj[conceptIds.collectionCardFlag] = document.getElementById('collectionCheckBox').checked === true;
        kitObj[conceptIds.collectionAddtnlNotes] = document.getElementById('collectionComments').value;
        kitObj[conceptIds.unexpectedCollectionDateConfirm] = 
          questionableCollectionDateConfirmed ?
            conceptIds.yes
            : undefined;
      }
      window.removeEventListener("beforeunload", handleBeforeUnload);
      setupLeavingPageMessage();
      await storePackageReceipt(kitObj);
    });
  }
};

const storePackageReceipt = async (data) => {
  showAnimation();
  const idToken = await getIdToken();
  const response = await fetch(`${baseAPI}api=kitReceipt`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      Authorization: "Bearer " + idToken,
      "Content-Type": "application/json",
    },
  });
  hideAnimation();

  const returnedPtInfo = await processResponse(response);
  if (returnedPtInfo.status === true) {
    triggerSuccessModal("Kit Receipted.");
    document.getElementById("showMsg").innerHTML = "";
    document.getElementById("scannedBarcode").value = "";
    document.getElementById("packageCondition").value = defaultPackageCondition;
    document.getElementById("receivePackageComments").value = "";
    document.getElementById("dateReceived").value = getCurrentDate();
    document.getElementById("collectionComments").value = "";
    
    enableCollectionCardFields();
    enableCollectionCheckBox();
    document.getElementById("packageCondition").setAttribute("data-selected", `[${defaultPackageCondition}]`);
    if (document.getElementById("collectionId").value) {
      document.getElementById("collectionId").value = "";
      document.getElementById("dateCollectionCard").value = "";
      document.getElementById("timeCollectionCard").value = "";
      document.getElementById("collectionCheckBox").checked = false;
      document.getElementById("collectionComments").value = "";
      enableCollectionCardFields();
      enableCollectionCheckBox();
      document.getElementById("packageCondition").setAttribute("data-selected", `[${defaultPackageCondition}]`);
    }

    let requestData = {
      attempt: "1st contact",
      email: returnedPtInfo.prefEmail,
      token: returnedPtInfo.token,
      uid: returnedPtInfo.uid,
      connectId: returnedPtInfo.Connect_ID,
      preferredLanguage: returnedPtInfo.preferredLanguage,
      substitutions: {
        firstName: returnedPtInfo.ptName || "User",
      },
    };

    if (returnedPtInfo.surveyStatus !== conceptIds.modules.submitted) {
      const loginDetails = getLoginDetails(returnedPtInfo);
      if (!loginDetails) {
        triggerErrorModal("Login details not found for this participant. Please check user profile data.");

        return;
      }

      switch(returnedPtInfo.path) {
        case conceptIds.bioKitMouthwashBL2: {
          requestData.category = "BL R2 Mouthwash Sample Survey Reminders";
          break;
        }
        case conceptIds.bioKitMouthwashBL1: {
          requestData.category = "BL R1 Mouthwash Sample Survey Reminders";
          break;
        }
        default: {
          requestData.category = "Baseline Mouthwash Sample Survey Reminders";
        }
      }
      requestData.substitutions.loginDetails = loginDetails;
    } else {
      switch(returnedPtInfo.path) {
        case conceptIds.bioKitMouthwashBL2: {
          requestData.category = "R2 Mouthwash Home Collection Acknowledgement";
          break;
        }
        case conceptIds.bioKitMouthwashBL1: {
          requestData.category = "R1 Mouthwash Home Collection Acknowledgement";
          break;
        }
        default: {
          requestData.category = "Mouthwash Home Collection Acknowledgement";
        }
      }
    }

    await sendInstantNotification(requestData);
  } else if (returnedPtInfo.status === "Check Collection ID") {
    triggerErrorModal("Error during kit receipt. Please check the collection ID.");
  } else if (returnedPtInfo.status === "Check collection date, possible invalid entry") {
    const modalHeaderEl = document.getElementById("modalHeader");
    const modalBodyEl = document.getElementById("modalBody");

    openModal();
    displayInvalidCollectionDateModal(modalHeaderEl, modalBodyEl, returnedPtInfo.status, async () => {
      data[conceptIds.unexpectedCollectionDateConfirm] = conceptIds.yes;
      await storePackageReceipt(data);
    });
  } else if (returnedPtInfo.status) {
    triggerErrorModal(`Error during kit receipt. ${returnedPtInfo.status}`);
  } else {
    // Leave this console log in; it's useful for debugging
    console.log('returnedPtInfo', returnedPtInfo);
    triggerErrorModal("Error during kit receipt. Please check the tracking number and other fields.");
  }
};

const openModal = () => {
  const openModalButton = document.createElement('button');

  openModalButton.style.display = 'none';
  openModalButton.setAttribute('data-bs-target', '#modalShowMoreData');
  openModalButton.setAttribute('data-bs-toggle', 'modal');
  openModalButton.id = 'openShowMoreDataModalButton';

  document.body.appendChild(openModalButton);
  document.getElementById('openShowMoreDataModalButton').click();

  openModalButton.remove();
}

const enableCollectionCardFields = () => {
    document.getElementById('collectionId').disabled = false;
    document.getElementById('dateCollectionCard').disabled = false;
    document.getElementById('timeCollectionCard').disabled = false;
    document.getElementById('collectionComments').disabled = false;
};
