import { homeCollectionNavbar } from "./homeCollectionNavbar.js";
import { getIdToken, showAnimation, hideAnimation, triggerErrorModal, triggerSuccessModal, baseAPI, processResponse, checkTrackingNumberSource, appState, numericInputValidator, errorMessage, removeAllErrors, autoTabAcrossArray } from "../../shared.js";
import { nonUserNavBar } from "./../../navbar.js";
import { activeHomeCollectionNavbar } from "./homeCollectionNavbar.js";
import { conceptIds } from '../../fieldToConceptIdMapping.js';

const escapeHtml = (unsafe) => {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const contentBody = document.getElementById("contentBody");

export const assignKitsScreen = async (auth) => {
  const user = auth.currentUser;
  if (!user) return;
  const name = user.displayName ? user.displayName : user.email;
  assignKitsTemplate(name);
}

const assignKitsTemplate = async (name) => {
  showAnimation();
  const response = await getEligibleParticipantsForKitAssignment();
  hideAnimation();
  let template = ``;
  template += homeCollectionNavbar();
  template += `
                <div class="row align-center welcome-screen-div">
                        <div class="col"><h3 style="margin:1rem 0 1.5rem;">Assign Kits</h3></div>
                </div>`;

  template += `
  <div class="row">
      <div class="col">
        <div id="alert_placeholder"></div>
          <form>
                <div class="mb-3 row">
                  <label for="fullName" class="col-md-4 col-form-label">Full Name</label>
                  <div class="col-md-8">
                    <input type="text" class="form-control" id="fullName" placeholder="Enter Full Name">
                  </div>
                </div>
                <div class="mb-3 row">
                  <label for="address" class="col-md-4 col-form-label">Address</label>
                  <div class="col-md-8">
                    <input type="text" class="form-control" id="address" placeholder="Enter Address">
                  </div>
                </div>
                <div class="mb-3 row">
                  <label for="Connect_ID" class="col-md-4 col-form-label">Connect_ID</label>
                  <div class="col-md-8">
                    <input type="text" class="form-control" id="Connect_ID" placeholder="Enter Connect ID">
                  </div>
                </div>
                <div class="mb-3 row">
                  <label for="scanSupplyKit" class="col-md-4 col-form-label">Scan Return Kit</label>
                  <div class="col-md-8">
                    <input type="text" class="form-control" id="scanSupplyKit" placeholder="Scan Return Kit ID">
                  </div>
                </div>
                <div class="mb-3 row">
                  <label for="scannedBarcode" class="col-md-4 col-form-label">Supply Kit Tracking Number</label>
                  <div class="col-md-8">
                    <div class="mb-3 row">
                      <input type="text" class="form-control" id="scannedBarcode" placeholder="Scan Barcode">
                      <span id="showMsg" style="font-size: 14px;"></span>
                    </div>
                    <div class="mb-3 row">
                      <label for="scannedBarcode2" class="visually-hidden">Confirm Supply Kit Tracking Number</label>
                      <input autocomplete="off" type="text" class="form-control" id="scannedBarcode2" placeholder="Re-Enter (scan/type) Barcode">
                    </div>
                </div>
              </div>
        </form>
        <div class="mt-4 mb-4" style="display:inline-block;">
          <button type="button" class="btn btn-primary" id="clearForm" disabled>View Assigned Kits</button>
          <button type="submit" class="btn btn-primary" id="confirmAssignment">Confirm Assignment</button>
        </div>
      </div>
      <div class="col-6">
        <div id="sidePane" style="width: 700px; height: 400px; overflow: auto; border: 1px solid #000">
        </div>
      </div>
  </div>`;

  template += `
        <div class="modal fade" id="modalShowMoreData" data-keyboard="false" tabindex="-1" role="dialog" data-backdrop="static" aria-hidden="true">
            <div class="modal-dialog modal-md modal-dialog-centered" role="document">
                <div class="modal-content sub-div-shadow">
                    <div class="modal-header" id="modalHeader"></div>
                    <div class="modal-body" id="modalBody"></div>
                </div>
            </div>
        </div>
    `;

  document.getElementById("navbarNavAltMarkup").innerHTML = nonUserNavBar(name);
  contentBody.innerHTML = template;

  const scannedBarcode2 = document.getElementById('scannedBarcode2');
  scannedBarcode2.onpaste = e => e.preventDefault();
  scannedBarcode2.addEventListener("input", (e) => {
    const scannedBarcodeValue = document.getElementById('scannedBarcode').value.trim();
    let scannedBarcode2Value = e.target.value.trim();
    
    // Trim FedEx tracking numbers (1033)
  // Already done for the scannedBarcode input in checkTrackingNumberSource
    if (scannedBarcode2Value.length === 34) {
      scannedBarcode2Value = scannedBarcode2Value.slice(-12);
      e.target.value = scannedBarcode2Value;
    }
    
    if(scannedBarcodeValue && scannedBarcode2Value && scannedBarcodeValue !== scannedBarcode2Value) {
      const msg = 'Supply Kit Tracking Number doesn\'t match';
      errorMessage('scannedBarcode2', msg, true, false, true);
    } else {
      removeAllErrors();
    }
  });

  // Set up automatic tabbing between inputs upon scanning (assuming the scanner automatically inputs the enter key at the end)
  autoTabAcrossArray(['fullName', 'address', 'Connect_ID', 'scanSupplyKit', 'scannedBarcode', 'scannedBarcode2']);
  
  numericInputValidator(['scannedBarcode', 'scannedBarcode2']);
  
  activeHomeCollectionNavbar();
  appState.setState({ participants: response.data });
  populateSidePaneRows();
  checkTrackingNumberSource();
  confirmAssignment();
}

const populateSidePaneRows = () => {
  let participants = appState.getState().participants;
  if (participants === false) { triggerErrorModal('No participants are currently available for kit assignment.') }
  else {
    document.getElementById('sidePane').innerHTML = ``
    document.getElementById('sidePane').innerHTML += `&nbsp;<b>Participants :</b> ${Object.keys(participants).length || 0}`
    participants?.forEach((participant) => {
      document.getElementById('sidePane').innerHTML += `
        <ul style="overflow-y: scroll;">
        <br />
          ${participant['first_name'] + ' ' + participant['last_name']} |
          ${participant['address_1'] + ' ' + participant['address_2'] + ' ' + participant['city'] + ' ' + participant['state'] + ' ' + 
            participant['zip_code']} | ${participant['connect_id']}
          <button type="button" class="btn btn-link detailedRow"  data-firstName = '${participant.first_name}' data-lastName = '${participant.last_name}'
          data-address1= '${participant.address_1}'
          data-city= '${participant.city}'
          data-state= '${participant.state}'
          data-zipCode= '${participant.zip_code}'
          data-connectId= '${participant.connect_id}'
          id="selectParticipants">Select</button>
          <button type="button" class="btn btn-link undeliverableRow" 
            data-connectId= '${participant.connect_id}'
            id="undeliverablePtAddr"
            data-bs-toggle="modal" data-bs-target="#modalShowMoreData"
          >Undeliverable Address</button>
        </ul>`;
    })
    selectParticipants();
  }
}

const selectParticipants = () => {
  const detailedRow = Array.from(document.getElementsByClassName('detailedRow'));
  if (detailedRow) {
    Array.from(detailedRow).forEach(function(selectPtBtn) {
      selectPtBtn.addEventListener('click', () => {
        document.getElementById('fullName').value = selectPtBtn.getAttribute('data-firstName') + ' ' + selectPtBtn.getAttribute('data-lastName')
        document.getElementById('address').value = selectPtBtn.getAttribute('data-address1') + ' ' + selectPtBtn.getAttribute('data-city') + ' ' + 
        selectPtBtn.getAttribute('data-state') + ' ' + selectPtBtn.getAttribute('data-zipCode')
        document.getElementById('Connect_ID').value = selectPtBtn.getAttribute('data-connectId')
      });
    });
  }
  const undeliverableRow = Array.from(document.getElementsByClassName('undeliverableRow'));
  if (undeliverableRow) {
    Array.from(undeliverableRow).forEach(function(undeliverableBtn) {
      undeliverableBtn.addEventListener('click', async () => {
        const connectId = escapeHtml(undeliverableBtn.getAttribute('data-connectId'));
        // Confirmation dialog
        const modalHeaderEl = document.getElementById("modalHeader");
        const modalBodyEl = document.getElementById("modalBody");
        modalHeaderEl && (modalHeaderEl.innerHTML = `
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
          </button>
        `);
        modalBodyEl && (modalBodyEl.innerHTML = `
          <div class="row">
              <div class="col">
                  <div style="display:flex; justify-content:center; margin-bottom:1rem;">
                      <i class="fas fa-exclamation-triangle fa-5x" style="color:#ffc107"></i>
                  </div>
                  <p style="text-align:center; font-size:1.4rem; margin-bottom:1.2rem; ">
                      <span style="display:block; font-weight:600;font-size:1.8rem; margin-bottom: 0.5rem;">Address Status Confirmation</span> 
                      Undeliverable Address was selected for Connect ID ${connectId}. Confirm that you wish to report this address as undeliverable.
                  </p>
              </div>
          </div>
          <div class="row" style="display:flex; justify-content:center;">
            <div class="col-auto">
              <button id="confirmButton" data-connect-id="${connectId}" type="button" class="btn btn-primary" data-bs-dismiss="modal" target="_blank" style="margin-right: 15px;">Confirm</button>
              <button type="button" class="btn btn-danger" data-bs-dismiss="modal" target="_blank">Cancel</button>
            </div>
          </div>
      `);
      clickConfirmButton();
      });
    });
  }
}

const clickConfirmButton = () => {
    const confirmButton = document.getElementById("confirmButton");
    if(!confirmButton) {
      return;
    }
    const connectId = +confirmButton.getAttribute('data-connect-id');
    confirmButton.addEventListener("click", async () => {
        showAnimation();
        const idToken = await getIdToken();
        const response = await fetch(`${baseAPI}api=markParticipantAddressUndeliverable`, {
          method: "POST",
          body: JSON.stringify({Connect_ID: connectId}),
          headers: {
            Authorization: "Bearer " + idToken,
            "Content-Type": "application/json",
          },
        });
        try {
          const processedResponse = await response.json();
          const data = processedResponse.data;
          
          if(data?.success === 'true') {
              triggerSuccessModal("Participant address marked as undeliverable");
              clearForm();
              clearParticipantFromQueue(connectId);
          } else {
            if(data?.removeFromQueue === 'true') {
              clearForm();
              clearParticipantFromQueue(connectId);
            }
            triggerErrorModal(data?.error || 'Error updating participant.');
            console.error('Response with error', response);
          }
          hideAnimation();
        } catch(err) {
          console.error('Error when processing response', err);
            triggerErrorModal(`Error updating participant: ${err.message || err}`);

        }
       
    });  
};

const clearForm = () => {
  document.getElementById('fullName').value = ``;
  document.getElementById('address').value = ``;
  document.getElementById('Connect_ID').value = ``;
  document.getElementById('scannedBarcode').value = ``;
  document.getElementById('scannedBarcode2').value = ``;
  document.getElementById('scanSupplyKit').value = ``;
  document.getElementById("showMsg").innerHTML = ``;

}

const confirmAssignment = () => {
  const confirmAssignmentBtn = document.getElementById('confirmAssignment');
  if (confirmAssignmentBtn) {
    let confirmAssignmentInAction = false;
    confirmAssignmentBtn.addEventListener('click', async (e) => {
      if (confirmAssignmentInAction) { return; } // Ignore the click if confirmAssignment btn in action
      confirmAssignmentInAction = true;
      try {
        e.preventDefault();
        removeAllErrors();
        const scannedBarcode = document.getElementById('scannedBarcode').value.trim();
        const scannedBarcode2 = document.getElementById('scannedBarcode2').value.trim();
        if(scannedBarcode && scannedBarcode2 && scannedBarcode !== scannedBarcode2) {
          const msg = 'Return Kit Tracking Number doesn\'t match';
          errorMessage('scannedBarcode2', msg, true, false);
          throw new Error(msg);
        }
        let participantObj = {};
        participantObj['fullName'] = document.getElementById('fullName').value;
        participantObj['address'] = document.getElementById('address').value;
        participantObj[conceptIds.supplyKitTrackingNum] = scannedBarcode;
        participantObj[conceptIds.supplyKitId] = document.getElementById('scanSupplyKit').value.trim();
        participantObj['Connect_ID'] = document.getElementById('Connect_ID')?.value;
        const responseJson = await processConfirmedAssignment(participantObj);
        const assignmentStatus = responseJson.success;

        if (assignmentStatus === true) {
          triggerSuccessModal('The kit has been assigned to the participant.')
          clearForm();
          clearParticipantFromQueue(participantObj['Connect_ID']);
          return;
        } 
        else {
          if(responseJson.message) {
            console.error(responseJson.message);
          }
          if(responseJson.removeFromQueue) {
            clearForm();
            clearParticipantFromQueue(participantObj['Connect_ID']);
          }
          triggerErrorModal(responseJson.message || `Unable to assign a kit to the participant. Please check the supply kit and connect the ID.`, 'danger');
          return;
        }
      } catch (error) {
        console.error(error);
        triggerErrorModal('An error occurred:' + (error?.message || error), 'danger');
      } finally {
        confirmAssignmentInAction = false;
      }
    })
  }
}

const clearParticipantFromQueue = (connectId) => {
  const filteredParticipants = appState.getState().participants.filter((participant) => {
    return participant['connect_id'] !== +connectId;
  });
  appState.setState({ participants: filteredParticipants });
  populateSidePaneRows();
}

const processConfirmedAssignment = async (assignment) => {
    showAnimation();
    const idToken = await getIdToken();
    const response = await fetch(`${baseAPI}api=assignKit`, {
        method: "POST",
        body: JSON.stringify(assignment),
        headers: {
        Authorization: "Bearer " + idToken,
        "Content-Type": "application/json",
        },
    });
    hideAnimation();
    return await response.json();  
}

export const getEligibleParticipantsForKitAssignment = async () => {
  const idToken = await getIdToken();
  const response = await fetch(`${baseAPI}api=getElgiblePtsForAssignment`, {
      method: "GET",
      headers: {
          Authorization:"Bearer "+idToken
      }
  });
  return await response.json();
}
