import { expect } from 'chai';
import { packageConditions } from '../src/pages/siteCollection/sitePackageReceipt.js';

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