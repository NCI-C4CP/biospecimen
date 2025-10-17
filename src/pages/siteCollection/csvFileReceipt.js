import { showAnimation, hideAnimation, getIdToken, conceptIdToHealthProviderAbbrObj, keyToLocationObj, baseAPI, keyToNameCSVObj,
  formatISODateTimeDateOnly, convertISODateTime, getAllBoxes, conceptIdToSiteSpecificLocation, showNotifications, getCurrentDate,
  miscTubeIdSet, triggerSuccessModal, getSpecimensInBoxes, findReplacementTubeLabels, triggerErrorModal } from "../../shared.js";
import { conceptIds } from "../../fieldToConceptIdMapping.js";
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
  getInTransitBoxFileType();
  getInTransitSpecimenFileType();
  loadSheetJScdn();
};

const inTransitMapping = {
  box: {
    header: "In Transit - Box Level",
    buttonId: "createTransitBoxFile",
  },
  specimen: {
    header: "In Transit - Specimen Level",
    buttonId: "createTransitSpecimenFile",
  },
};

const csvFileReceiptTemplate = async (username) => {
  let template = "";
  template += siteCollectionNavbar();
  template += `
    <div id="root root-margin" style="margin-top:3rem;">
    <div id="alert_placeholder"></div>
  `;

  const { box, specimen } = inTransitMapping;
  template += inTransitCard(box.header, box.buttonId);
  template += inTransitCard(specimen.header, specimen.buttonId);

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
  document.getElementById("navbarNavAltMarkup").innerHTML =
    nonUserNavBar(username);
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

/**
 * A card section for receipted CSV file creation.
 * @param {string} title - title of card section
 * @param {string} buttonId - id of button to create file
 * @returns {string} a Receipted CSV section
 */
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
  document
    .getElementById("createTransitBoxFile")
    .addEventListener("click", async (e) => {
      e.preventDefault();
      const modalHeaderEl = document.getElementById("modalHeader");
      const modalBodyEl = document.getElementById("modalBody");
      modalHeaderEl.innerHTML = `
      <h4>Select a format to download In Transit - Box Level file</h4>
      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" id="closeModal">
      </button>
    `;

      // change for box level only
      modalBodyEl.innerHTML = `
      <div class="row">
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
      </div>
    `;
      confirmFileSelection("box");
    });
};

// specimen level
const getInTransitSpecimenFileType = () => {
  document
    .getElementById("createTransitSpecimenFile")
    .addEventListener("click", async (e) => {
      e.preventDefault();
      const modalHeaderEl = document.getElementById("modalHeader");
      const modalBodyEl = document.getElementById("modalBody");
      modalHeaderEl.innerHTML = `
      <h4>Select a format to download In Transit - Specimen Level file</h4>
      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" id="closeModal">
      </button>
    `;

      modalBodyEl.innerHTML = `<div class="row">
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
                            </div>`;
      confirmFileSelection("specimen");
    });
};

const confirmFileSelection = (type) => {
  const radioButtons = document.querySelectorAll('input[name="fileFormat"]');
  if (radioButtons.length === 0) return;
  radioButtons.forEach((radio) => {
    radio.addEventListener("click", async (e) => {
      handleFileSelection(radio.value, type);
    });
  });
};

/**
 * Handles file selection and generates the appropriate file based on user input.
 * @param {string} radioValue - The selected file format (e.g., 'xlsx' or 'csv').
 * @param {string} type - The type of data to process ('specimen' or 'box').
 * @returns {Promise<void>} - Resolves when file processing is complete.
 */
const handleFileSelection = async (radioValue, type) => {
  showAnimation();
  // Add code for closing box (bootstrap 5 modal new close approach later?)
  document.getElementById("modalShowMoreData").querySelector("#closeModal").click(); // closes modal
  try {
    const response = await getAllBoxes("bptlPackagesInTransit");
    // Remove boxes with a shipment lost flag with a value of 'yes'
    const shippedBoxesNotReceivedAndNotLost =
      getRecentBoxesShippedBySiteNotReceived(response.data).filter(
        (box) => box[conceptIds.shipmentLost] !== conceptIds.yes
      );

    let modifiedTransitResults;

    if (type === "specimen") {
      const specimens = await getSpecimensInBoxes(response.data, true);
      const replacementTubeLabelObj = findReplacementTubeLabels(specimens);
      modifiedTransitResults = updateInTransitMapping(shippedBoxesNotReceivedAndNotLost, replacementTubeLabelObj);
    } else if (type === "box") {
      modifiedTransitResults = updateInTransitBoxMapping(shippedBoxesNotReceivedAndNotLost);
    }

    if (modifiedTransitResults.length > 0) {
      radioValue === "xlsx"
        ? processInTransitXLSXData(modifiedTransitResults, type)
        : generateInTransitCSVData(modifiedTransitResults, type);
    }

    if (modifiedTransitResults.length > 0) {
      (radioValue === 'xlsx')
        ? processInTransitXLSXData(modifiedTransitResults, type)
        : generateInTransitCSVData(modifiedTransitResults, type);
    }
  } catch (error) {
    console.error(error);
    triggerErrorModal("Error generating file.  Please try again later");
  } finally {
    hideAnimation();
  }
};

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
      showNotifications({
        title: "Error",
        body: `Error fetching BSI Query Data -- ${e.message}`,
      });
    } finally {
      hideAnimation();
    }
  });
};

const getSpecimensByReceivedDate = async (dateFilter) => {
  try {
    const idToken = await getIdToken();
    const response = await fetch(
      `${baseAPI}api=getSpecimensByReceivedDate&receivedTimestamp=${dateFilter}`,
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + idToken,
        },
      }
    );

    if (response.status !== 200) {
      throw new Error(
        `Error fetching specimens by received date. ${response.status}`
      );
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
  results.forEach((result) => {
    const collectionType =
      result[conceptIds.collectionType] || conceptIds.research;
    const healthcareProvider =
      result[conceptIds.healthcareProvider] || "default";
    const specimenKeysArray =
      result.specimens && Object.keys(result.specimens).length > 0
        ? Object.keys(result.specimens)
        : [];
    for (const specimenKey of specimenKeysArray) {
      let [collectionId = "", tubeId = ""] =
        result.specimens[specimenKey]?.[conceptIds.collectionId]?.split(" ") ??
        [];
      if (miscTubeIdSet.has(tubeId)) {
        tubeId = specimenCollection.cidToNum[specimenKey];
      }
      const vialMappings = getVialTypesMappings(
        tubeId,
        collectionType,
        healthcareProvider
      );
      const csvRowsFromSpecimen = updateResultMappings(
        result,
        vialMappings,
        collectionId,
        tubeId
      );
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
  shippedBoxes.forEach((shippedBox) => {
    console.log("🚀 ~ updateInTransitBoxMapping ~ shippedBox:", shippedBox);
    console.log("---");
    console.log("shippedBox", shippedBox.bags);
    // get bags key(s) from each box
    const bagKeys = Object.keys(shippedBox.bags); // store specimenBagId in an array
    console.log("🚀 ~ updateInTransitBoxMapping ~ bagKeys:", bagKeys);
    //
    const specimenBags = bagKeys
      .map((bagKey) => shippedBox.bags[bagKey].arrElements)
      .flat();
    console.log("🚀 ~ updateInTransitBoxMapping ~ specimenBags:", specimenBags);

    const boxData = {
      shipDate: shippedBox[conceptIds.shippingShipDate]?.split("T")[0] || "",
      trackingNumber: shippedBox[conceptIds.shippingTrackingNumber] || "",
      shippedSite: shippedBox["siteAcronym"] || "",
      shippedLocation:
        conceptIdToSiteSpecificLocation[
          shippedBox[conceptIds.shippingLocation]
        ] || "",
      numSamples: specimenBags.length || 0,
      hasTempMonitor:
        shippedBox[conceptIds.tempProbe] === conceptIds.yes ? "Yes" : "No",
    };

    holdProcessedResult.push(boxData);
  });

  return holdProcessedResult;
};

/**
 * Loops through each shipped box & specimen bag. Then grabs essential information and stores the result in an object & pushes the object to an array
 * @param {object} shippedBoxes - Shipped box object contains all the related specimen bags & more
 * @param {object} replacementTubeLabelObj - Object that maps replacement tube labels to original tube labels
 * @returns {array} Returns an array of objects with essential information for in transit csv
 */
const updateInTransitMapping = (shippedBoxes, replacementTubeLabelObj) => {
  let holdProcessedResult = [];
  shippedBoxes.forEach((shippedBox) => {
    const bagKeys = Object.keys(shippedBox.bags); // store specimenBagId in an array
    const specimenBags = Object.values(shippedBox.bags); // store bag content in an array
    let dataHolder;
    specimenBags.forEach((specimenBag, index) => {
      specimenBag.arrElements.forEach((fullSpecimenIds, j, specimenBagSize) => {
        // grab fullSpecimenIds & loop thru content

        if (
          Object.prototype.hasOwnProperty.call(
            replacementTubeLabelObj,
            fullSpecimenIds
          )
        ) {
          fullSpecimenIds = replacementTubeLabelObj[fullSpecimenIds];
        }
        dataHolder = {
          shipDate:
            shippedBox[conceptIds.shippingShipDate]?.split("T")[0] || "",
          trackingNumber: shippedBox[conceptIds.shippingTrackingNumber] || "",
          shippedSite: shippedBox.siteAcronym || "",
          shippedLocation:
            conceptIdToSiteSpecificLocation[
              shippedBox[conceptIds.shippingLocation]
            ] || "",
          shipDateTime:
            convertISODateTime(shippedBox[conceptIds.shippingShipDate]) || "",
          numSamples: specimenBagSize.length,
          tempMonitor:
            shippedBox[conceptIds.tempProbe] === conceptIds.yes ? "Yes" : "No",
          BoxId: shippedBox[conceptIds.shippingBoxId] || "",
          specimenBagId: bagKeys[index],
          fullSpecimenIds: fullSpecimenIds,
          materialType: materialTypeMapping(fullSpecimenIds),
        };
        holdProcessedResult.push(dataHolder);
      });
    });
  });
  return holdProcessedResult;
};

/**
 * Maps specimen id to material type based on last 4 digits
 * @param {string} specimenId - Specimen id from each specimen bag
 * @returns {string} Returns material type
 */

const materialTypeMapping = (specimenId) => {
  const tubeId = specimenId.split(" ")[1];
  const materialTypeObject = {
    "0001": "Serum",
    "0002": "Serum",
    "0011": "Serum",
    "0012": "Serum",
    "0021": "Serum",
    "0003": "WHOLE BL",
    "0004": "WHOLE BL",
    "0005": "WHOLE BL",
    "0013": "WHOLE BL",
    "0014": "WHOLE BL",
    "0024": "WHOLE BL",
    "0006": "Urine",
    "0007": "Saliva",
    "0060": "WHOLE BL",
  };
  return materialTypeObject[tubeId] ?? "";
};

let vialMapping; // determined by receipted date input

const getVialTypesMappings = (tubeId, collectionType, healthcareProvider) => {
  if (!collectionType || !tubeId) {
    console.warn("collectionType or tubeId is missing");
    return ["", "", "", ""];
  }

  const collectionTypeString =
    collectionType === conceptIds.research ? "research" : "clinical";
  const healthcareProviderString =
    conceptIdToHealthProviderAbbrObj[healthcareProvider] || "default";

  if (collectionTypeString === "research") {
    return (
      vialMapping[collectionTypeString]?.default?.[tubeId] || ["", "", "", ""]
    );
  } else {
    return (
      vialMapping[collectionTypeString]?.[healthcareProviderString]?.[tubeId] ||
      vialMapping[collectionTypeString]?.default?.[tubeId] || ["", "", "", ""]
    );
  }
};

const updateResultMappings = (
  filteredResult,
  vialMappings,
  collectionId,
  tubeId
) => {
  const collectionTypeValue = filteredResult[conceptIds.collectionType];
  const clinicalDateTime = filteredResult[conceptIds.clinicalDateTimeDrawn];
  const withdrawalDateTime = filteredResult[conceptIds.dateWithdrawn];

  const sampleCollectionCenter =
    collectionTypeValue === conceptIds.clinical
      ? keyToNameCSVObj[filteredResult[conceptIds.healthcareProvider]] || ""
      : keyToLocationObj[filteredResult[conceptIds.collectionLocation]] || "";

  const dateReceived = filteredResult[conceptIds.dateReceived]
    ? formatISODateTimeDateOnly(filteredResult[conceptIds.dateReceived])
    : "";

  // Dummy date for clinical files requested in issue 936
  const dateDrawn =
    collectionTypeValue === conceptIds.clinical
      ? "01/01/1999 12:00:00 PM"
      : withdrawalDateTime
      ? convertISODateTime(withdrawalDateTime)
      : "";

  const vialType = vialMappings[0] || "";
  const additivePreservative = vialMappings[1] || "";
  const materialType = vialMappings[2] || "";
  const volume = vialMappings[3] || "";

  return {
    "Study ID": "Connect Study",
    "Sample Collection Center": sampleCollectionCenter,
    "Sample ID": collectionId || "",
    Sequence: tubeId || "",
    "BSI ID": `${collectionId} ${tubeId}` || "",
    "Subject ID": filteredResult["Connect_ID"] || "",
    "Date Received": dateReceived,
    "Date Drawn": dateDrawn,
    "Vial Type": vialType,
    "Additive/Preservative": additivePreservative,
    "Material Type": materialType,
    Volume: volume,
    "Volume Estimate": "Assumed",
    "Volume Unit": "ml (cc)",
    "Vial Warnings": "",
    Hemolyzed: getHemolyzedStatus(materialType),
    "Label Status": "Barcoded",
    Visit: "BL",
  };
};

const generateBSIqueryCSVData = (items) => {
  const csv =
    "Study ID, Sample Collection Center, Sample ID, Sequence, BSI ID, Subject ID, Date Received, Date Drawn, Vial Type, Additive/Preservative, Material Type, Volume, Volume Estimate, Volume Unit, Vial Warnings, Hemolyzed, Label Status, Visit\r\n";
  downloadCSVfile(items, csv, "BSI-data-export");
};

const generateInTransitCSVData = (items) => {
  const csv = `Ship Date, Tracking Number, Shipped from Site, Shipped from Location, Shipped Date & Time, Expected Number of Samples, Temperature Monitor, Box Number, Specimen Bag ID Type, Full Specimen IDs, Material Type\r\n`;
  downloadCSVfile(items, csv, "In-Transit-CSV-data-export");
};

// If rowValue contains a comma, quote or newline, enclose in double quotes & replace with inner double quotes
export const downloadCSVfile = (items, csv, title) => {
  const csvData = items.map((item) => {
    const rowData = Object.values(item).map((rowValue) => {
      // store processed row data
      if (typeof rowValue === "string" && /[",\n\r]/.test(rowValue)) {
        // use regex for string handling
        return `"${rowValue.replaceAll('"', '""')}"`; // use replaceAll for reduced code duplication
      }
      return rowValue;
    });
    return rowData.join(",");
  });

  csv += csvData.join("\r\n");
  generateFileToDownload(csv, title, "csv");
};

/**
 * Process data to the format required by xlsx library. Map function converts each row of inTransitItems into an array of values using Object.values
 * @param {object} inTransitItems - array of objects
 * @returns {array} Returns an array of arrays
 */
const processInTransitXLSXData = (inTransitItems, type) => {
  let header = [];
  if (type === "box") {
    header = inTransitHeaders.box;
  } else if (type === "specimen") {
    header = inTransitHeaders.specimen;
  }

  const inTransitData = [
    header,
    ...inTransitItems.map((row) => Object.values(row)),
  ];
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
};

/**
 * Loads SheetJS CDN upon Create .csv file selection & then enables create file button upon script onload
 * @param {}
 * @returns
 */
const loadSheetJScdn = () => {
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.mini.min.js";
  script.onload = function () {
    document.getElementById("createTransitFile").disabled = false; // enable create file button after the script is successfully loaded
  };
  document.head.appendChild(script);
};

/**
 * Using SheetJS, data gets processed & gets added to XLSX workbook and worksheet. Then triggers xlsx file download
 * @param {array} data - array of arrays
 * @returns
 */
const handleXLSXLibrary = (data) => {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(data); // Create a new workbook and worksheet

  XLSX.utils.book_append_sheet(workbook, worksheet, `InTransitExport`); // Add the worksheet to the workbook

  const xlsxFile = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" }); // Convert the workbook to a binary XLSX file

  const blob = new Blob([xlsxFile], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  }); // Create a Blob from the binary data
  generateFileToDownload(blob, "In-Transit-XLSX-data-export", "xlsx");
};

/**
 * Generates xlsx or csv file for download
 * @param {array, string, string}
 * @returns
 */
const generateFileToDownload = (blob, title, fileType) => {
  const link = document.createElement("a"); // Create a download link
  if (fileType === "xlsx") {
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", `${getCurrentDate()}-${title}.xlsx`);
  } else {
    link.setAttribute(
      "href",
      `data:text/plain;charset=utf-8,${encodeURIComponent(blob)}`
    );
    link.setAttribute("download", `${getCurrentDate()}-${title}.csv`);
  }

  document.body.appendChild(link);
  link.click(); // Trigger download
  document.body.removeChild(link);

  // Display success message
  triggerSuccessModal(`${title} file downloaded successfully!`);
};

/**
 * Returns hemolyzed status based on material type using a predefined map.
 * @param {string} materialType - Material type of the specimen (e.g., "Serum", "Plasma")
 * @returns {string} Corresponding hemolyzed status, or an empty string if not found in the map
 */
const getHemolyzedStatus = (materialType) => {
  const statusMap = {
    Serum: "not hem (1)",
    Plasma: "not hem (1)",
  };

  return statusMap[materialType] || "";
};
