import { homeCollectionNavbar } from "./homeCollectionNavbar.js";
import { getIdToken, showAnimation, hideAnimation, baseAPI, appState, triggerErrorModal, triggerSuccessModal, isDev } from "../../shared.js";
import { nonUserNavBar } from "./../../navbar.js";
import { activeHomeCollectionNavbar } from "./homeCollectionNavbar.js";


const contentBody = document.getElementById("contentBody");

export const printLabelsScreen = async (auth) => {
  const user = auth.currentUser;
  if (!user) return;
  const name = user.displayName ? user.displayName : user.email;
  showAnimation();
  appState.setState({'totalAddressesLength': 0 })
  await initializeTotalAddressesToPrint();
  printLabelsTemplate(name);
  hideAnimation();
}

const printLabelsTemplate = (name) => {
  let template = ``;
  template += homeCollectionNavbar();
  template += `<div class="row align-center welcome-screen-div">
                  <div class="col">
                  <div id="alert_placeholder"></div>
                    <h3 style="margin:1rem 0 1.5rem;">Print Labels</h3>
                    <div class="container-fluid" style="padding-top: 50px;">     
                    <div class="card">
                      <div class="card-body">
                      <span> <h3 style="text-align: center; margin: 0 0 1rem;">How many labels to print?</h3> </span>
                        <div style="text-align: center;  padding-bottom: 25px; "> 
                          <input required type="text" name="numberToPrint" id="numberToPrint"  /> 
                        </div>
                        <span> Labels to print: ${ appState.getState().totalAddressesLength || 0 }  </span>
                        <br />
                        <div class="mt-4 mb-4" style="display:inline-block;">
                          <button type="button" class="btn btn-primary" id="clearForm" disabled>View All Printed Labels</button>
                          <button type="submit" class="btn btn-primary" id="generateCsv">Download CSV File</button>
                        </div>
                        </div>
                        <span> <h3 style="text-align: center; margin: 0 0 1rem;">Replacement kit labels to print</h3> </span>
                        <div style="text-align: center;  padding-bottom: 25px; "> 
                          <input required type="text" name="numberToPrintReplacements" id="numberToPrintReplacements"  /> 
                        </div>
                        <span> Labels to print: ${ appState.getState().totalReplacementAddressesLength || 0 }  </span>
                        <br />
                        <div class="mt-4 mb-4" style="display:inline-block;">
                          <button type="button" class="btn btn-primary" id="clearReplacementForm" disabled>View All Printed Replacement Labels</button>
                          <button type="submit" class="btn btn-primary" id="generateReplacementCsv">Download Replacement Kit CSV File</button>
                        </div>
                        </div>
                      </div>
                  </div>
                  </div>
                </div>`;

  template += `
        <div style="overflow:auto; height:45vh">
        </div>`;

  document.getElementById("navbarNavAltMarkup").innerHTML = nonUserNavBar(name);
  contentBody.innerHTML = template;
  activeHomeCollectionNavbar();
  if (appState.getState().totalAddressesLength === 0 && !appState.getState().totalReplacementAddressesLength) triggerErrorModal('No labels to print');
  generateParticipantCsvGetter(name);
  generateParticipantReplacementCsvGetter(name);

};

const initializeTotalAddressesToPrint = async () => {
  try {
    showAnimation();
    const totalAddressCount = await getAddressesToPrintCount();
    const totalReplacementAddressesLength = await getReplacementAddressesToPrintCount();
    appState.setState({'totalAddressesLength': totalAddressCount.data, 'totalReplacementAddressesLength': totalReplacementAddressesLength.data })
  } catch(err) {
    console.error('Error initializing total addresses to print', err);
  } finally {
    hideAnimation();
  }
  
}

export const getAddressesToPrintCount = async () => {
  const idToken = await getIdToken();
  const response = await fetch(`${baseAPI}api=totalAddressesToPrintCount`, {
      method: "GET",
      headers: {
          Authorization:"Bearer "+idToken
      }
  });
  return await response.json();
}

export const getReplacementAddressesToPrintCount = async () => {
  const idToken = await getIdToken();
  const response = await fetch(`${baseAPI}api=totalReplacementAddressesToPrintCount`, {
      method: "GET",
      headers: {
          Authorization:"Bearer "+idToken
      }
  });
  return await response.json();
}

export const getTotalAddressesToPrint = async (limit) => {
  const idToken = await getIdToken();
  let url = `${baseAPI}api=totalAddressesToPrint`;
  if(limit) {
    url += `&limit=${limit}`
  }
  const response = await fetch(url, {
      method: "GET",
      headers: {
          Authorization:"Bearer "+idToken
      }
  });
  return await response.json();
}

export const getTotalReplacementAddressesToPrint = async (limit) => {
  const idToken = await getIdToken();
  let url = `${baseAPI}api=totalReplacementAddressesToPrint`;
  if(limit) {
    url += `&limit=${limit}`
  }
  const response = await fetch(url, {
      method: "GET",
      headers: {
          Authorization:"Bearer "+idToken
      }
  });
  return await response.json();
}

const generateParticipantCsvGetter = (name) => {
  const generateCsvButton = document.getElementById("generateCsv");
  if (generateCsvButton) {
    generateCsvButton.addEventListener("click", async () => {
      const totalAddressesLength = appState.getState().totalAddressesLength;
        const numberToPrint = document.getElementById("numberToPrint").value;
        if(!numberToPrint || !totalAddressesLength) {
          triggerErrorModal(`No labels to print`);
        } else if (numberToPrint > totalAddressesLength) {
          triggerErrorModal(`Max labels to print: ${arrayLengthToProcess}`);
        } else {
          const totalAddressesRes = await getTotalAddressesToPrint(numberToPrint);
          if (totalAddressesRes.code === 200) {
              const arrayToProcess = totalAddressesRes.data;
              appState.setState({'totalAddressesLength': totalAddressesLength - numberToPrint }); // No need for another API call
              generateParticipantCsv(arrayToProcess);
              printLabelsTemplate(name);
              triggerSuccessModal('Success!');                 // Display success message
          } else {
            console.error('response', totalAddressesRes);
            triggerErrorModal(`${totalAddressesRes.code} error getting records: ${totalAddressesRes.message}`);
          }
        }
    });
  }
};

const generateParticipantReplacementCsvGetter = (name) => {
  const generateCsvButton = document.getElementById("generateReplacementCsv");
  if (generateCsvButton) {
    generateCsvButton.addEventListener("click", async () => {
      const totalAddressesLength = appState.getState().totalReplacementAddressesLength;
        const numberToPrint = document.getElementById("numberToPrintReplacements").value;
        if(!numberToPrint || !totalAddressesLength) {
          triggerErrorModal(`No labels to print`);
        } else if (numberToPrint > totalAddressesLength) {
          triggerErrorModal(`Max labels to print: ${arrayLengthToProcess}`);
        } else {
          const totalAddressesRes = await getTotalReplacementAddressesToPrint(numberToPrint);
          if (totalAddressesRes.code === 200) {
              const arrayToProcess = totalAddressesRes.data;
              appState.setState({'totalReplacementAddressesLength': totalAddressesLength - numberToPrint }); // No need for another API call
              generateParticipantCsv(arrayToProcess);
              printLabelsTemplate(name);
              triggerSuccessModal('Success!');                 // Display success message
          } else {
            console.error('response', totalAddressesRes);
            triggerErrorModal(`${totalAddressesRes.code} error getting records: ${totalAddressesRes.message}`);
          }
        }
      });
  }
};

const generateParticipantCsv = async (items) => {
  let csv = ``;
  let participantsForKitUpdate = []
  const columns = ['first_name', 'last_name', 'address_1', 'address_2', 'city', 'state', 'zip_code', 'connect_id', 'visit'];
  csv += `${columns.join(',')}, \r\n`
  for (let row = 0; row < (items.length); row++) {
    csv += columns.map(key => items[row][key] || '').join(',');
    csv += '\r\n';
    participantsForKitUpdate.push({connect_id: items[row]['connect_id'], visit: items[row].visit});
  }
  let link = document.createElement("a");
  link.id = "download-csv";
  link.setAttribute("href","data:text/plain;charset=utf-8," + encodeURIComponent(csv));
  link.setAttribute("download",`${new Date().toLocaleDateString()}-participants-labels-export.csv`);
  document.body.appendChild(link);
  document.querySelector("#download-csv").click();
  document.body.removeChild(link);
  const response = await setKitStatusToParticipant(participantsForKitUpdate);
  if (!response) triggerErrorModal('Error while updating participant(s) kit status.')
  if(response.code !== 200) triggerErrorModal(`${response.code} Error while updating participant(s) kit status: ${response.message}`);
}

const setKitStatusToParticipant = async (data) => {
  const idToken = await getIdToken();
  const response = await fetch(`${baseAPI}api=kitStatusToParticipantV2`, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      Authorization: "Bearer " + idToken,
      "Content-Type": "application/json",
    },
  });
  return await response.json();
}