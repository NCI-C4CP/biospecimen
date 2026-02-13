import { expect } from 'chai';
import { packageConditions } from '../src/pages/siteCollection/sitePackageReceipt.js';
import { packageConditionConversion } from '../src/fieldToConceptIdMapping.js';

describe('packageConditions array', () => {
    it('should be an array', () => {
        expect(packageConditions).to.be.an('array')
    });

    it('should contain 10 options', () => {
        expect(packageConditions).to.have.length(10)
    });

    it('should ensure all conceptIds are numbers', () => {
        const allNumbers = packageConditions.every(option => typeof option.value === 'number');
        expect(allNumbers).to.be.true;
    });

    it('should ensure all values are 9-digit numbers', () => {
        const allNineDigits = packageConditions.every(option => /^\d{9}$/.test(option.value.toString()));
        expect(allNineDigits).to.be.true;
    });

    it('should not contain duplicate conceptIds', () => {
        const conceptIds = packageConditions.map(option => option.value);
        const uniqueConceptIds = new Set(conceptIds);
        expect(uniqueConceptIds.size).to.equal(conceptIds.length);
    });

    it('should not have any trailing whitespace in text labels', () => {
        const labelsWithIssues = packageConditions.filter(option => option.text !== option.text.trim());
        expect(labelsWithIssues).to.be.empty;
    });

    it('should not contain duplicate labels', () => {
        const labels = packageConditions.map(option => option.text);
        const uniqueLabels = new Set(labels);
        expect(uniqueLabels.size).to.equal(labels.length);
    });

    it('should contain the correct labels in order', () => {
        const expectedOptionsText = [
            'Package in Good Condition (shipper and specimens)',
            'Manifest/Vial/Paperwork info do not match',
            'Improper Packaging (i.e. missing cold packs, filler, etc)',
            'Cold Packs - Warm',
            'Damaged Vials',
            'Returned Empty Vials',
            'No Connect Label on Vials',
            'Shipment Delay',
            'Damaged Shipper (outer and/or inner)',
            'Other'
        ];
        const actualOptionsText = packageConditions.map(option => option.text);
        expect(actualOptionsText).to.deep.equal(expectedOptionsText);
    });

    it('should contain the correct concept IDs in order', () => {
        const expectedConceptIds = [
            679749262, // packageGood
            922995819, // manifestDoNotMatch
            847410060, // improperPackaging
            595987358, // coldPacksWarm
            387564837, // damagedVials
            631290535, // vialsEmpty
            399948893, // vialsMissingLabels
            958000780, // shipmentDelay
            678483571, // damagedContainer
            933646000  // other
        ];
        const actualConceptIds = packageConditions.map(option => option.value);
        expect(actualConceptIds).to.deep.equal(expectedConceptIds);
    });
});

describe('packageConditionConversion mapping', () => {
    it('should have numeric string keys only', () => {
        const keys = Object.keys(packageConditionConversion);
        const allValid = keys.every(k => /^\d+$/.test(k));
        expect(allValid).to.be.true;
    });

    it('should have keys that are strings of exactly 9 digits', () => {
        const keys = Object.keys(packageConditionConversion);
        const allNineDigitKeys = keys.every(k => /^\d{9}$/.test(k));
        expect(allNineDigitKeys).to.be.true;
    });

    it('should contain all concept IDs in the expectedConceptIDs array as keys', () => { 
        const expectedConceptIds = [
            679749262,
            405513630,
            595987358,
            200183516,
            399948893,
            631290535,
            442684673,
            121149986,
            678483571,
            289322354,
            909529446,
            847410060,
            387564837,
            933646000,
            842171722,
            613022284,
            922995819,
            958000780,
            853876696
        ];
        const mapping = packageConditionConversion;
        const missing = expectedConceptIds.filter(cid => !mapping.hasOwnProperty(cid));
        expect(missing).to.be.empty;
    });

    it('should have string values only and not empty', () => {
        const values = Object.values(packageConditionConversion);
        const allValid = values.every(value => typeof value === 'string' && value.trim() !== '');
        expect(allValid).to.be.true;
    });

    it('should match expected labels for known package receipt concept IDs', () => {
        const packageReceiptLabelMap = {
            '121149986': 'Crushed',
            '200183516': 'Vials - Incorrect Material Type Sent',
            '289322354': 'Material Thawed',
            '387564837': 'Damaged Vials',
            '399948893': 'No Connect Label on Vials',
            '405513630': 'No Ice Pack',
            '442684673': 'Participant Refusal',
            '595987358': 'Cold Packs - Warm',
            '613022284': 'No Refrigerant',
            '631290535': 'Returned Empty Vials',
            '678483571': 'Damaged Shipper (outer and/or inner)',
            '679749262': 'Package in Good Condition (shipper and specimens)',
            '842171722': 'No Pre-notification',
            '847410060': 'Improper Packaging (i.e. missing cold packs, filler, etc)',
            '853876696': 'No Manifest provided',
            '909529446': 'Insufficient Ice',
            '922995819': 'Manifest/Vial/Paperwork info do not match',
            '933646000': 'Other',
            '958000780': 'Shipment Delay'
        };

        for (const [cid, label] of Object.entries(packageReceiptLabelMap)) {
            expect(packageConditionConversion[cid]).to.equal(label);
        }
    });
});