import { showAnimation, hideAnimation, getIdToken, conceptIdToHealthProviderAbbrObj, keyToLocationObj, baseAPI, keyToNameCSVObj, formatISODateTimeDateOnly, convertISODateTime, getAllBoxes, conceptIdToSiteSpecificLocation, showNotifications, getCurrentDate, miscTubeIdSet, triggerSuccessModal, getSpecimensInBoxes, findReplacementTubeLabels, triggerErrorModal } from "../../shared.js";
import { conceptIds, conceptIds as fieldToConceptIdMapping } from "../../fieldToConceptIdMapping.js";
import { siteCollectionNavbar } from "./siteCollectionNavbar.js";
import { nonUserNavBar } from "../../navbar.js";
import { activeSiteCollectionNavbar } from "./activeSiteCollectionNavbar.js";
import { getRecentBoxesShippedBySiteNotReceived } from "./packagesInTransit.js";
import { specimenCollection } from "../../tubeValidation.js";
import { getVialMappingByDate } from "./vialMapping/vialMapping.js";

export const csvFileReceiptScreen = async (auth) => {
  const user = auth.currentUser;
  if (!user) return;
  const username = user.displayName ? user.displayName : user.email;

  csvFileReceiptTemplate(username);
  activeSiteCollectionNavbar();
  csvFileButtonSubmit();
  // getInTransitFileType();
  getInTransitBoxFileType();
  getInTransitSpecimenFileType();
  loadSheetJScdn();
}

const csvFileReceiptTemplate = async (username) => {
  let template = "";
  template += siteCollectionNavbar();
  template += `
    <div id="root root-margin" style="margin-top:3rem;">
    <div id="alert_placeholder"></div>
  `;

  template += inTransitCard("In Transit - Box Level", "createTransitBoxFile");
  template += inTransitCard("In Transit - Specimen Level", "createTransitSpecimenFile");
  // template += inTransitBoxLevel;
  // template += inTransitSpecimenLevel;

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

  template += receiptedCSVFileTemplate();
  
  document.getElementById("contentBody").innerHTML = template;
  document.getElementById("navbarNavAltMarkup").innerHTML = nonUserNavBar(username);
};

/**
 * A card section for In Transit file creation. Either Box Level or Specimen Level.
 * @param {string} title - title of card section
 * @param {string} buttonId - id of button to create file
 * @returns {string} An in transit card section
 */ 
const inTransitCard = (title, buttonId) => `
  <div class="container-fluid mb-4">
    <h4 style="text-align: center; margin: 1rem 0;">
      ${title}
    </h4>
    <div class="card bg-light mb-3 mt-3 mx-auto" style="max-width:50rem;">
      <div class="card-body" style="padding: 4rem 2.5rem;">
        <form class="form">
        <div class="mb-3 d-flex flex-wrap align-items-center justify-content-center m-0">
            <button id="${buttonId}" data-bs-toggle="modal" data-bs-target="#modalShowMoreData" class="btn btn-primary">Create File</button>
        </div>
        </form>
      </div>
    </div>
  </div>
`;

export const receiptedCSVFileTemplate = () => `
  <div class="container-fluid mb-4">
    <h4 style="text-align: center; margin: 1rem 0;">Receipted CSV File</h4> </span>
    <div class="card bg-light mb-3 mt-3 mx-auto" style="max-width:50rem;">
      <div class="card-body" style="padding: 4rem 2.5rem;">
        <form class="form">
        <div class="mb-3 d-flex flex-wrap align-items-center justify-content-center m-0">
          <label for="csvDateInput" style="display:inline-block;margin-bottom:0; margin-right:5%; font-size:1.3rem;">Enter a Date</label>
          <input type="date" name="csvDate" id="csvDateInput" describedby="enterEmail" style="margin-right:5%; padding:0.2rem;" value="${getCurrentDate()}" max="${getCurrentDate()}"/>
          <button id="csvCreateFileButton" class="btn btn-primary">Create File</button>
        </div>
        </form>
      </div>
    </div>
  </div>
`;

// box level
const getInTransitBoxFileType = () => {
  document.getElementById("createTransitBoxFile").addEventListener("click", async (e) => {
    e.preventDefault();
    const modalHeaderEl = document.getElementById("modalHeader");
    const modalBodyEl = document.getElementById("modalBody");
    modalHeaderEl.innerHTML = `
      <h4>Select a format to download In Transit file</h4>
      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" id="closeModal">
      </button>
    `;

    // change for box level only
    modalBodyEl.innerHTML =  `<div class="row">
                                <div class="col">
                                      <form>
                                        <div class="form-check">
                                          <input class="form-check-input" type="radio" name="fileFormat" value="xlsx" id="xlsxCheck">
                                          <label class="form-check-label" for="xlsxCheck">
                                            .XLSX (for better readability)
                                          </label>
                                        </div>
                                        <div class="form-check">
                                          <input class="form-check-input" type="radio" name="fileFormat" value="csv" id="csvCheck">
                                          <label class="form-check-label" for="csvCheck">
                                            .CSV (for BSI upload)
                                          </label>
                                        </div>
                                      </form>
                                </div>
                            </div>`
    confirmFileSelection('box');
  })
};

// specimen level
const getInTransitSpecimenFileType = () => {
  document.getElementById("createTransitSpecimenFile").addEventListener("click", async (e) => {
    e.preventDefault();
    const modalHeaderEl = document.getElementById("modalHeader");
    const modalBodyEl = document.getElementById("modalBody");
    modalHeaderEl.innerHTML = `
      <h4>Select a format to download In Transit file</h4>
      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" id="closeModal">
      </button>
    `;

    modalBodyEl.innerHTML =  `<div class="row">
                                <div class="col">
                                      <form>
                                        <div class="form-check">
                                          <input class="form-check-input" type="radio" name="fileFormat" value="xlsx" id="xlsxCheck">
                                          <label class="form-check-label" for="xlsxCheck">
                                            .XLSX (for better readability)
                                          </label>
                                        </div>
                                        <div class="form-check">
                                          <input class="form-check-input" type="radio" name="fileFormat" value="csv" id="csvCheck">
                                          <label class="form-check-label" for="csvCheck">
                                            .CSV (for BSI upload)
                                          </label>
                                        </div>
                                      </form>
                                </div>
                            </div>`
    confirmFileSelection('specimen');
  })
};

// const confirmFileSelection = (type) => {
//   const radios = document.querySelectorAll('input[name="fileFormat"]');
//   radios.forEach(radio => {
//     radio.addEventListener('click', async (e) => {
//       const radioVal = radio.value;
//       document.getElementById('modalShowMoreData').querySelector('#closeModal').click(); // closes modal
//       showAnimation();
//       try {
//         const response = await getAllBoxes(`bptlPackagesInTransit`);
//         const specimens = await getSpecimensInBoxes(response.data, true);
//         const replacementTubeLabelObj = findReplacementTubeLabels(specimens);
//         hideAnimation();
//         const allBoxesShippedBySiteAndNotReceived = getRecentBoxesShippedBySiteNotReceived(response.data);
//         let modifiedTransitResults = updateInTransitMapping(allBoxesShippedBySiteAndNotReceived, replacementTubeLabelObj);
//         (radioVal === 'xlsx') ? processInTransitXLSXData(modifiedTransitResults) : generateInTransitCSVData(modifiedTransitResults);
//       } catch (error) {
//         hideAnimation();
//         console.error(error);
//         triggerErrorModal('Error generating file.  Please try again later');
//       }

      
//     });
//   });
// };

const confirmFileSelection = (type) => {
  const radioButtons = document.querySelectorAll('input[name="fileFormat"]');
  if (radioButtons.length === 0) return;
  radioButtons.forEach(radio => {
    radio.addEventListener('click', async (e) => { 
      handleFileSelection(radio.value, type)
    });
  });
}

const handleFileSelection = async (radioValue, type) => {
  showAnimation();
// Add code for closing box (bootstrap 5 modal new close approach later?)
  document.getElementById('modalShowMoreData').querySelector('#closeModal').click(); // closes modal
  try {
    const response = await getAllBoxes('bptlPackagesInTransit');
    // const allBoxesShippedBySiteAndNotReceived = getRecentBoxesShippedBySiteNotReceived(response.data);
    const shippedBoxesNotReceivedAndNotLost =
      getRecentBoxesShippedBySiteNotReceived(response.data).filter(
        (box) => box[conceptIds.shipmentLost] !== conceptIds.yes
      );
    let specimens = await getSpecimensInBoxes(response.data, true); // only needed for specimen level
    const replacementTubeLabelObj = findReplacementTubeLabels(specimens);
    console.log("🚀 ~ handleFileSelection ~ replacementTubeLabelObj:", replacementTubeLabelObj)

    // return
    // specimen level
    if (type === 'specimen') {
      // replacementTubeLabelObj = findReplacementTubeLabels(specimens);
      // specimens = await getSpecimensInBoxes(response.data, true); 
      
      // let modifiedTransitResults = updateInTransitMapping(allBoxesShippedBySiteAndNotReceived, replacementTubeLabelObj);
      let modifiedTransitResults = updateInTransitMapping(shippedBoxesNotReceivedAndNotLost, replacementTubeLabelObj);
      (radioValue === 'xlsx')
        ? processInTransitXLSXData(modifiedTransitResults, type) 
        : generateInTransitCSVData(modifiedTransitResults, type);
    } else if (type === 'box') { // box level
      // let modifiedTransitResults = updateInTransitBoxMapping(allBoxesShippedBySiteAndNotReceived);
      let modifiedTransitResults = updateInTransitBoxMapping(shippedBoxesNotReceivedAndNotLost);

      (radioValue === 'xlsx')
        ? processInTransitXLSXData(modifiedTransitResults, type) 
        : generateInTransitCSVData(modifiedTransitResults, type);
    }

  } catch (error) {
    console.error(error);
    triggerErrorModal('Error generating file.  Please try again later');
  } finally {
    hideAnimation();
  }

}


// Create a new function for confirm file selection but for box level

const csvFileButtonSubmit = () => {
    document.getElementById("csvCreateFileButton").addEventListener("click", async (e)=> {
        e.preventDefault();
        const dateFilter = document.getElementById("csvDateInput").value + 'T00:00:00.000Z'; 
        vialMapping = getVialMappingByDate(dateFilter);
        showAnimation();

        try {
            const results = await getSpecimensByReceivedDate(dateFilter);
            const modifiedResults = modifyBSIQueryResults(results.data);
            generateBSIqueryCSVData(modifiedResults);
            hideAnimation();
        } catch (e) {
            hideAnimation();
            showNotifications({ title: 'Error', body: `Error fetching BSI Query Data -- ${e.message}` });
        }
    });
};

const getSpecimensByReceivedDate = async (dateFilter) => {
    try {
        const idToken = await getIdToken();
        const response = await fetch(`${baseAPI}api=getSpecimensByReceivedDate&receivedTimestamp=${dateFilter}`, {
            method: "GET",
            headers: {
                Authorization: "Bearer " + idToken,
            },
        });

        if (response.status !== 200) {
          throw new Error(`Error fetching specimens by received date. ${response.status}`);
        }

        return await response.json();
    } catch (e) {
        console.error(e);
        throw new Error(`Error fetching specimens by received date: ${e.message}`);
    }
};


/**
 * Tube Id's 0050-0054 are misc tubes. They are used by shipping sites in the event something happened to the original ID label.
 * BPTL wants to know what the original ID label should be (Ex: 0001-0024, 0060, not 0050-0054).
 * These need to be mapped to the key in the specimen object
 */

const modifyBSIQueryResults = (results) => {
    const csvDataArray = [];
    results.forEach(result => {
        const collectionType = result[fieldToConceptIdMapping.collectionType] || fieldToConceptIdMapping.research;
        const healthcareProvider = result[fieldToConceptIdMapping.healthcareProvider] || 'default';
        const specimenKeysArray = result.specimens && Object.keys(result.specimens).length > 0 ? Object.keys(result.specimens) : [];
            for (const specimenKey of specimenKeysArray) {
                let [collectionId = '', tubeId = ''] = result.specimens[specimenKey]?.[fieldToConceptIdMapping.collectionId]?.split(' ') ?? [];
                if (miscTubeIdSet.has(tubeId)) {
                  tubeId = specimenCollection.cidToNum[specimenKey];
                }
                const vialMappings = getVialTypesMappings(tubeId, collectionType, healthcareProvider);
                const csvRowsFromSpecimen = updateResultMappings(result, vialMappings, collectionId, tubeId);
                csvDataArray.push(csvRowsFromSpecimen);
            }
    });

    return csvDataArray;
};

// modify box results 
  const updateInTransitBoxMapping = (shippedBoxes) => {
    // loop over boxes and extract data
    // console.log("shippedBoxes",shippedBoxes)
    let holdProcessedResult = [];
    // let boxData;
    // loop over boxes
    shippedBoxes.forEach(shippedBox => {
      console.log("🚀 ~ updateInTransitBoxMapping ~ shippedBox:", shippedBox)
      console.log("---")
      console.log("shippedBox", shippedBox.bags)
      // get bags key(s) from each box
      const bagKeys = Object.keys(shippedBox.bags); // store specimenBagId in an array
      console.log("🚀 ~ updateInTransitBoxMapping ~ bagKeys:", bagKeys)
      // 
      const specimenBags = bagKeys.map(bagKey => shippedBox.bags[bagKey].arrElements).flat();
      console.log("🚀 ~ updateInTransitBoxMapping ~ specimenBags:", specimenBags)

      const boxData = {
        // "Ship Date":,
        // "Tracking Number":,
        // "Shipped from Site":,
        // "Site Shipping Location":,
        // "Expected Number of Samples":,
        // "Temperature Monitor":,
        shipDate: shippedBox[fieldToConceptIdMapping.shippingShipDate]?.split("T")[0] || '',
        trackingNumber:shippedBox[fieldToConceptIdMapping.shippingTrackingNumber] || '',
        shippedSite: shippedBox["siteAcronym"] || '',
        shippedLocation: conceptIdToSiteSpecificLocation[shippedBox[fieldToConceptIdMapping.shippingLocation]] || '',
        numSamples: specimenBags.length || 0,
        hasTempMonitor: shippedBox[fieldToConceptIdMapping.tempProbe] === fieldToConceptIdMapping.yes ? 'Yes' : 'No',
      }

      holdProcessedResult.push(boxData);
      });

      console.log("holdProcessedResult", holdProcessedResult)
      // debugger;
      return holdProcessedResult;
  }

/**
 * Loops through each shipped box & specimen bag. Then grabs essential information and stores the result in an object & pushes the object to an array
 * @param {object} shippedBoxes - Shipped box object contains all the related specimen bags & more
 * @param {object} replacementTubeLabelObj - Object that maps replacement tube labels to original tube labels
 * @returns {array} Returns an array of objects with essential information for in transit csv
*/ 
const updateInTransitMapping = (shippedBoxes, replacementTubeLabelObj) => {
  let holdProcessedResult = []
  shippedBoxes.forEach(shippedBox => {
    const bagKeys = Object.keys(shippedBox.bags); // store specimenBagId in an array
    const specimenBags = Object.values(shippedBox.bags); // store bag content in an array
    let dataHolder;
    specimenBags.forEach((specimenBag, index) => {
      specimenBag.arrElements.forEach((fullSpecimenIds, j, specimenBagSize) => { // grab fullSpecimenIds & loop thru content

        if (Object.prototype.hasOwnProperty.call(replacementTubeLabelObj, fullSpecimenIds)) {
          fullSpecimenIds = replacementTubeLabelObj[fullSpecimenIds];
        }
        dataHolder = {
        shipDate: shippedBox[fieldToConceptIdMapping.shippingShipDate]?.split("T")[0] || '',
        trackingNumber: shippedBox[fieldToConceptIdMapping.shippingTrackingNumber] || '',
        shippedSite: shippedBox.siteAcronym || '',
        shippedLocation: conceptIdToSiteSpecificLocation[shippedBox[fieldToConceptIdMapping.shippingLocation]] || '',
        shipDateTime: convertISODateTime(shippedBox[fieldToConceptIdMapping.shippingShipDate]) || '',
        numSamples: specimenBagSize.length,
        tempMonitor: shippedBox[fieldToConceptIdMapping.tempProbe] === fieldToConceptIdMapping.yes ? 'Yes' : 'No',
        BoxId: shippedBox[fieldToConceptIdMapping.shippingBoxId] || '',
        specimenBagId: bagKeys[index],
        fullSpecimenIds: fullSpecimenIds,
        materialType: materialTypeMapping(fullSpecimenIds)
        };
        holdProcessedResult.push(dataHolder);        
        })
    });
  })
  return holdProcessedResult
};


/**
 * Maps specimen id to material type based on last 4 digits
 * @param {string} specimenId - Specimen id from each specimen bag
 * @returns {string} Returns material type
*/ 

const materialTypeMapping = (specimenId) => {
  const tubeId = specimenId.split(' ')[1]
  const materialTypeObject = {'0001':'Serum', '0002':'Serum', '0011':'Serum', '0012':'Serum', '0021':'Serum', 
                              '0003': 'WHOLE BL', '0004': 'WHOLE BL', '0005': 'WHOLE BL', '0013': 'WHOLE BL', '0014' : 'WHOLE BL', '0024' : 'WHOLE BL',
                              '0006':'Urine', '0007': 'Saliva', '0060': 'WHOLE BL'}
  return materialTypeObject[tubeId] ?? '';
}

let vialMapping; // determined by receipted date input

const getVialTypesMappings = (tubeId, collectionType, healthcareProvider) => {
    if (!collectionType || !tubeId) {
        console.warn('collectionType or tubeId is missing');
        return ['', '', '', ''];
    }
    
    const collectionTypeString = collectionType === fieldToConceptIdMapping.research ? 'research' : 'clinical';
    const healthcareProviderString = conceptIdToHealthProviderAbbrObj[healthcareProvider] || 'default';

    if (collectionTypeString === 'research') {
        return vialMapping[collectionTypeString]?.default?.[tubeId] || ['', '', '', ''];
    } else {
        return vialMapping[collectionTypeString]?.[healthcareProviderString]?.[tubeId] || vialMapping[collectionTypeString]?.default?.[tubeId] || ['', '', '', ''];
    }
};

const updateResultMappings = (filteredResult, vialMappings, collectionId, tubeId) => {
    const collectionTypeValue = filteredResult[fieldToConceptIdMapping.collectionType];
    const clinicalDateTime = filteredResult[fieldToConceptIdMapping.clinicalDateTimeDrawn];
    const withdrawalDateTime = filteredResult[fieldToConceptIdMapping.dateWithdrawn];
    
    const sampleCollectionCenter = (collectionTypeValue === fieldToConceptIdMapping.clinical)
        ? (keyToNameCSVObj[filteredResult[fieldToConceptIdMapping.healthcareProvider]] || '')
        : (keyToLocationObj[filteredResult[fieldToConceptIdMapping.collectionLocation]] || '');

    const dateReceived = filteredResult[fieldToConceptIdMapping.dateReceived]
        ? formatISODateTimeDateOnly(filteredResult[fieldToConceptIdMapping.dateReceived])
        : '';

    // Dummy date for clinical files requested in issue 936
    const dateDrawn = (collectionTypeValue === fieldToConceptIdMapping.clinical)
        ? '01/01/1999 12:00:00 PM'
        : (withdrawalDateTime ? convertISODateTime(withdrawalDateTime) : '');

    const vialType = vialMappings[0] || '';
    const additivePreservative = vialMappings[1] || '';
    const materialType = vialMappings[2] || '';
    const volume = vialMappings[3] || '';

    return {
        'Study ID': 'Connect Study',
        'Sample Collection Center': sampleCollectionCenter,
        'Sample ID': collectionId || '',
        'Sequence': tubeId || '',
        'BSI ID': `${collectionId} ${tubeId}` || '',
        'Subject ID': filteredResult['Connect_ID'] || '',
        'Date Received': dateReceived,
        'Date Drawn': dateDrawn,
        'Vial Type': vialType,
        'Additive/Preservative': additivePreservative,
        'Material Type': materialType,
        'Volume': volume,
        'Volume Estimate': 'Assumed',
        'Volume Unit': 'ml (cc)',
        'Vial Warnings': '',
        'Hemolyzed': getHemolyzedStatus(materialType),
        'Label Status': 'Barcoded',
        'Visit': 'BL'
    };
};

const generateBSIqueryCSVData = (items) => {
    const csv = 'Study ID, Sample Collection Center, Sample ID, Sequence, BSI ID, Subject ID, Date Received, Date Drawn, Vial Type, Additive/Preservative, Material Type, Volume, Volume Estimate, Volume Unit, Vial Warnings, Hemolyzed, Label Status, Visit\r\n';
    downloadCSVfile(items, csv, 'BSI-data-export');
};

const generateInTransitCSVData = (items) => {
    const csv = `Ship Date, Tracking Number, Shipped from Site, Shipped from Location, Shipped Date & Time, Expected Number of Samples, Temperature Monitor, Box Number, Specimen Bag ID Type, Full Specimen IDs, Material Type\r\n`;
    downloadCSVfile(items, csv, 'In-Transit-CSV-data-export');
};

// If rowValue contains a comma, quote or newline, enclose in double quotes & replace with inner double quotes
export const downloadCSVfile = (items, csv, title) => {
  const csvData = items.map((item) => {
    const rowData = Object.values(item).map((rowValue) => { // store processed row data
      if (typeof rowValue === 'string' && /[",\n\r]/.test(rowValue)) { // use regex for string handling
        return `"${rowValue.replaceAll('"', '""')}"`; // use replaceAll for reduced code duplication
      }
      return rowValue;
    });
    return rowData.join(',');
  });

  csv += csvData.join('\r\n');
  generateFileToDownload(csv, title, 'csv');
};

/**
 * Process data to the format required by xlsx library. Map function converts each row of inTransitItems into an array of values using Object.values
 * @param {object} inTransitItems - array of objects
 * @returns {array} Returns an array of arrays
*/ 

const processInTransitXLSXData = (inTransitItems, type) => {
  let header = [];
  if (type === 'box') {
    header = inTransitHeaders.box;
  } else if (type === 'specimen') {
    header = inTransitHeaders.specimen;
  }
  
  const inTransitData = [header, ...inTransitItems.map(row => Object.values(row))];
  // console.log("🚀 ~ processInTransitXLSXData ~ inTransitData:", inTransitData)
  handleXLSXLibrary(inTransitData);
};

const inTransitHeaders = {
  specimen: [
    "Ship Date",
    "Tracking Number",
    "Shipped from Site",
    "Shipped from Location",
    "Shipped Date & Time",
    "Expected Number of Samples",
    "Temperature Monitor",
    "Box Number",
    "Specimen Bag ID Type",
    "BSI ID",
    "Material Type",
  ],
  box: [
    "Ship Date",
    "Tracking Number",
    "Shipped from Site",
    "Site Shipping Location",
    "Expected Number of Samples",
    "Temperature Monitor",
  ],
}

/**
 * Loads SheetJS CDN upon Create .csv file selection & then enables create file button upon script onload
 * @param {} 
 * @returns
*/ 

const loadSheetJScdn = () => {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.mini.min.js';
  script.onload = function() {
    document.getElementById("createTransitFile").disabled = false; // enable create file button after the script is successfully loaded
    // need to change the element reference later
  };
  document.head.appendChild(script);
}

/**
 * Using SheetJS, data gets processed & gets added to XLSX workbook and worksheet. Then triggers xlsx file download
 * @param {array} data - array of arrays
 * @returns
*/ 

const handleXLSXLibrary = (data) => {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(data); // Create a new workbook and worksheet

  XLSX.utils.book_append_sheet(workbook, worksheet, `InTransitExport`); // Add the worksheet to the workbook

  const xlsxFile = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });  // Convert the workbook to a binary XLSX file

  const blob = new Blob([xlsxFile], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });  // Create a Blob from the binary data
  generateFileToDownload(blob, 'In-Transit-XLSX-data-export', 'xlsx')
}

/**
 * Generates xlsx or csv file for download
 * @param {array, string, string}
 * @returns
*/ 

const generateFileToDownload = (blob, title, fileType) => {
  const link = document.createElement('a');  // Create a download link
  if (fileType === 'xlsx') {
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute("download",`${getCurrentDate()}-${title}.xlsx`);
  }
  else {
    link.setAttribute("href", `data:text/plain;charset=utf-8,${encodeURIComponent(blob)}`);
    link.setAttribute("download", `${getCurrentDate()}-${title}.csv`);
  }

  document.body.appendChild(link);
  link.click(); // Trigger download
  document.body.removeChild(link);

  // Display success message
  triggerSuccessModal(`${title} file downloaded successfully!`);
}

/**
 * Returns hemolyzed status based on material type using a predefined map.
 * @param {string} materialType - Material type of the specimen (e.g., "Serum", "Plasma")
 * @returns {string} Corresponding hemolyzed status, or an empty string if not found in the map
*/
const getHemolyzedStatus = (materialType) => {
  const statusMap = {
    'Serum': 'not hem (1)',
    'Plasma': 'not hem (1)',
  };

  return statusMap[materialType] || '';
};


/*
Note: Need to ask if the inclusion of lost packages is needed for file generation

Filter and remove shipped boxes not yet received and packages that are not lost 


boxes.filter(item => item["333524031"] == 353358909 || item["932866744"] !== 353358909)


boxes.filter(item => item["333524031"] == 353358909 || item["932866744"] !== 353358909).map(box => box["959708259"])

*/
