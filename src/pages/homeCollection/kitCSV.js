import { nonUserNavBar } from "../../navbar.js";
import { homeCollectionNavbar } from "./homeCollectionNavbar.js";
import { showAnimation, hideAnimation, getIdToken, baseAPI, keyToNameCSVObj, conceptIdToHealthProviderAbbrObj, triggerErrorModal, convertISODateTime, convertISODateTimeToEST } from "../../shared.js";
import { activeHomeCollectionNavbar } from "./homeCollectionNavbar.js";
import { conceptIds } from '../../fieldToConceptIdMapping.js';
import { receiptedCSVFileTemplate, shippedNotReceivedCSVFileTemplate, downloadCSVfile } from '../siteCollection/csvFileReceipt.js';

export const kitCsvScreen = (auth) => {
  const user = auth.currentUser;
  if (!user) return;
  const username = user.displayName ? user.displayName : user.email;
  showAnimation();
  kitCsvTemplate(username);
  csvFileButtonSubmit();
  csvFileShippedNotReceivedButtonSubmit();
  hideAnimation();
};

const kitCsvTemplate = (name) => {
  let template = ``;
  template += homeCollectionNavbar();

  template += `<div id="root root-margin" style="margin-top:3rem;">
              <div id="alert_placeholder"></div>
              ${shippedNotReceivedCSVFileTemplate()}
              ${receiptedCSVFileTemplate()}
              </div>`
  
  document.getElementById("contentBody").innerHTML = template;
  document.getElementById("navbarNavAltMarkup").innerHTML = nonUserNavBar(name);
  activeHomeCollectionNavbar();
};

const csvFileButtonSubmit = () => {
  document.getElementById("csvCreateFileButton").addEventListener("click", async (e)=> {
      e.preventDefault();
      const dateString = document.getElementById("csvDateInput").value + 'T00:00:00.000Z'; 
      showAnimation();
      try {
          const results = await getKitsByReceivedDate(dateString);
          // This is for home kits and thus should always show the collection location as home
          const modifiedResults = modifyKitQueryResults(results.data, 'home');
          generateKitCSVData(modifiedResults);
          hideAnimation();
      } catch (e) {
          hideAnimation();
          triggerErrorModal(`Error fetching Kit Data -- ${e.message}`);
      }
  });
}

const csvFileShippedNotReceivedButtonSubmit = () => {
  document.getElementById("csvShippedNotReceivedCreateFileButton").addEventListener("click", async (e)=> {
      e.preventDefault();
      showAnimation();
      try {
          const results = await getKitsShippedNotReceived();
          // CSV columns:
          // Connect ID
          // Return Kit Tracking Number (<972453354> BioKit_ReturnKitTrack_v1r0)
          // Expected Number of Samples (hardcoded as '1')
          // BSI ID (<259846815> BioKit_MWCupID_v1r0)
          // Material Type (hardcoded
          // Kit status

          const kitStatusLookup = {
            [conceptIds.shipped]: 'Shipped',
            [conceptIds.assigned]: 'Assigned'
          }
          const csv = 'Connect ID, Return Kit Tracking Number, Expected Number of Samples, BSI ID, Material Type, Kit Status\r\n';
          const items = results.data.map(kit => {
            // downloadCSVFile is expecting an object that you can do Object.values on, but that works with arrays, so this is an appropriate format

            return [
              kit['Connect_ID'],
              kit[conceptIds.returnKitTrackingNum],
              '1', // Currently always 1
              kit[conceptIds.collectionCupId],
              "Saliva", // Currently always saliva; revisit if other home kit types become available
              kitStatusLookup[kit[conceptIds.kitStatus]]
            ]
          });

          downloadCSVfile(items, csv, 'Kit-shipped-not-received-data-export');
          hideAnimation();
      } catch (e) {
        console.error('Error', e);
          hideAnimation();
          triggerErrorModal(`Error fetching Kit Data -- ${e.message}`);
      }
  });
}

const getKitsByReceivedDate = async (dateString) => {
  try {
    const idToken = await getIdToken();
    const response = await fetch(`${baseAPI}api=getKitsByReceivedDate&receivedDateTimestamp=${dateString}`, {
        method: "GET",
        headers: {
            Authorization: "Bearer " + idToken,
        },
    });

    if (response.status !== 200) {
      throw new Error(`Error fetching kits by received date. ${response.status}`);
    }

    return await response.json();
} catch (e) {
    console.error(e);
    throw new Error(`Error fetching kits by received date: ${e.message}`);
  }

}

const getKitsShippedNotReceived = async () => {
  try {
    const idToken = await getIdToken();
    const response = await fetch(`${baseAPI}api=getKitsShippedNotReceived`, {
        method: "GET",
        headers: {
            Authorization: "Bearer " + idToken,
        },
    });

    if (response.status !== 200) {
      throw new Error(`Error fetching kits which have been shipped but not yet received. ${response.status}`);
    }

    return await response.json();
  } catch (e) {
    console.error('Error fetching kits', e);
    throw new Error(`Error fetching kits which have been shipped but not yet received: ${e.message}`);
  }
}

const modifyKitQueryResults = (kitsData, collectionSource = 'site') => {
  const kitLevelLookup = {
    [conceptIds.initialKit]: 'BL',
    [conceptIds.replacementKit1]: 'BL_1',
    [conceptIds.replacementKit2]: 'BL_2'
  }
  const csvKitArray = [];
  kitsData.forEach(kitData => {
    // Home collection kits should list sample collection center as "home" (1616)
    const sampleCollectionCenter = collectionSource === 'home' ? 'Home' : keyToNameCSVObj[kitData[conceptIds.healthcareProvider]];
    const collectionId = kitData[conceptIds.collection.id]; // CNA899209
    const bsiID = kitData[conceptIds.collection.mouthwashTube1][conceptIds.collection.tube.scannedId]; // CNA899209 0007
    const tubeID = bsiID.split(' ')[1]; // 0007
    const Connect_ID = kitData['Connect_ID'];
    // Per request, will always display in EST
    const dateReceived = convertISODateTimeToEST(kitData[conceptIds.collection.mouthwashTube1][conceptIds.receivedDateTime]);
    const dateDrawn = convertISODateTime(kitData[conceptIds.dateWithdrawn]);
    const vialMappings = getVialTypesMapping('home', conceptIdToHealthProviderAbbrObj[kitData[conceptIds.healthcareProvider]], tubeID);
    const vialType = vialMappings[0] || '';
    const additivePreservative = vialMappings[1] || '';
    const materialType = vialMappings[2] || '';
    const volume = vialMappings[3] || '';
    const visit = kitLevelLookup[kitData[conceptIds.kitLevel]] || 'BL';
    const updatedKitResults = {
      'Study ID': 'Connect Study',
      'Sample Collection Center': sampleCollectionCenter,
      'Sample ID': collectionId || '',
      'Sequence': tubeID || '',
      'BSI ID': bsiID || '',
      'Subject ID': Connect_ID || '',
      'Date Received': dateReceived,
      'Date Drawn': dateDrawn,
      'Vial Type': vialType,
      'Additive/Preservative': additivePreservative,
      'Material Type': materialType,
      'Volume': volume,
      'Volume Estimate': 'Assumed',
      'Volume Unit': 'ml (cc)',
      'Vial Warnings': '',
      'Hemolyzed': '',
      'Label Status': 'Barcoded',
      'Visit': visit
    }
    csvKitArray.push(updatedKitResults);
  });

  return csvKitArray;
}

const getVialTypesMapping = (collectionType, site, tubeId) => {
  if (collectionType === 'home') {
    // Home collections, currently the only type used, always return the same value
    return ["15ml Nalgene jar",	"Crest Alcohol Free",	"Saliva",	"10"];
  }
}

const generateKitCSVData = (items) => {
  const csv = 'Study ID, Sample Collection Center, Sample ID, Sequence, BSI ID, Subject ID, Date Received, Date Drawn, Vial Type, Additive/Preservative, Material Type, Volume, Volume Estimate, Volume Unit, Vial Warnings, Hemolyzed, Label Status, Visit\r\n';
  downloadCSVfile(items, csv, 'Kit-data-export');
}