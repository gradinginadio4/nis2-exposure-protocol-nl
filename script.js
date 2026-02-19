/**
 * NIS2 EXPOSURE PROTOCOL - DUTCH VERSION
 * Logic for NIS2 Directive compliance assessment
 * Based on Directive (EU) 2022/2555 and Belgian transposition law
 */

// State management
const state = {
    step: 1,
    answers: {
        entitySize: null,
        serviceSensitivity: null,
        digitalInfrastructure: {
            cloud: false,
            mfa: false,
            incidentProcess: false,
            supplyChain: false
        },
        governanceMaturity: null
    }
};

// DOM Elements
const steps = {
    1: document.getElementById('step-1'),
    2: document.getElementById('step-2'),
    3: document.getElementById('step-3'),
    4: document.getElementById('step-4'),
    5: document.getElementById('step-5')
};

const tierBadge = document.getElementById('tier-badge');
const resultContent = document.getElementById('result-content');

/**
 * Navigate to specific step
 * @param {number} stepNumber - Target step
 */
function goToStep(stepNumber) {
    // Hide current step
    Object.values(steps).forEach(step => {
        if (step) step.classList.remove('active');
    });
    
    // Show target step
    if (steps[stepNumber]) {
        steps[stepNumber].classList.add('active');
        state.step = stepNumber;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

/**
 * Handle option selection for steps 1, 2, and 4
 * @param {number} step - Current step number
 * @param {string} value - Selected value
 */
function selectOption(step, value) {
    // Update state based on step
    if (step === 1) {
        state.answers.entitySize = value;
        updateSelectionUI(1, value);
        setTimeout(() => goToStep(2), 300);
    } else if (step === 2) {
        state.answers.serviceSensitivity = value;
        updateSelectionUI(2, value);
        setTimeout(() => goToStep(3), 300);
    } else if (step === 4) {
        state.answers.governanceMaturity = value;
        updateSelectionUI(4, value);
        setTimeout(() => calculateAndShowResults(), 300);
    }
}

/**
 * Update UI to show selected state
 * @param {number} step - Step number
 * @param {string} value - Selected value
 */
function updateSelectionUI(step, value) {
    const stepEl = document.getElementById(`step-${step}`);
    const cards = stepEl.querySelectorAll('.option-card');
    
    cards.forEach(card => {
        if (card.dataset.value === value) {
            card.classList.add('selected');
        } else {
            card.classList.remove('selected');
        }
    });
}

/**
 * Validate step 3 (checkboxes) and proceed
 */
function validateStep3() {
    // Collect checkbox values
    state.answers.digitalInfrastructure = {
        cloud: document.getElementById('cloud-infra').checked,
        mfa: document.getElementById('mfa-enabled').checked,
        incidentProcess: document.getElementById('incident-process').checked,
        supplyChain: document.getElementById('supply-chain').checked
    };
    
    goToStep(4);
}

/**
 * Go back to previous step
 * @param {number} currentStep - Current step number
 */
function goBack(currentStep) {
    if (currentStep > 1) {
        goToStep(currentStep - 1);
    }
}

/**
 * Calculate exposure tier based on NIS2 logic
 * Returns: 'tier-1' (Low), 'tier-2' (Medium), 'tier-3' (High)
 */
function calculateTier() {
    const { entitySize, serviceSensitivity, digitalInfrastructure, governanceMaturity } = state.answers;
    
    let score = 0;
    
    // Entity size weight (NIS2 scope criteria)
    // Large entities in specific sectors are Essential or Important
    if (entitySize === 'large') score += 3;
    else if (entitySize === 'medium') score += 2;
    else score += 1;
    
    // Service sensitivity (Annex III sectors)
    // Legal/accounting services are explicitly listed in NIS2 Annex III
    if (serviceSensitivity === 'high') score += 3;
    else if (serviceSensitivity === 'medium') score += 2;
    else score += 1;
    
    // Digital infrastructure risk factors
    let infraRisk = 0;
    if (digitalInfrastructure.cloud) infraRisk += 1;
    if (!digitalInfrastructure.mfa) infraRisk += 2; // Lack of MFA is high risk
    if (!digitalInfrastructure.incidentProcess) infraRisk += 2; // No incident process is high risk
    if (digitalInfrastructure.supplyChain) infraRisk += 1;
    
    score += Math.min(infraRisk, 3); // Cap at 3
    
    // Governance maturity (risk mitigation)
    // Higher maturity reduces effective exposure
    let governanceModifier = 0;
    if (governanceMaturity === 'none') governanceModifier = 2;
    else if (governanceMaturity === 'basic') governanceModifier = 1;
    else if (governanceMaturity === 'structured') governanceModifier = -1;
    else if (governanceMaturity === 'iso') governanceModifier = -2;
    
    score += governanceModifier;
    
    // Determine tier
    // Tier 3 (High): Large entities in sensitive sectors with poor governance
    // Tier 2 (Medium): Medium entities or large with good governance
    // Tier 1 (Low): Small entities or those with excellent governance
    
    if (score >= 6) return 'tier-3';
    if (score >= 4) return 'tier-2';
    return 'tier-1';
}

/**
 * Generate results content based on tier
 * @param {string} tier - Calculated tier
 */
function generateResults(tier) {
    const tiers = {
        'tier-1': {
            label: 'Beperkte Blootstelling',
            title: 'Niveau 1: Beperkte Reglementaire Blootstelling',
            implications: 'Uw organisatie heeft een beperkte blootstelling aan de strikte NIS2-verplichtingen. Toch blijft waakzaamheid geboden wat betreft de waardeketen.',
            obligations: [
                'Basis veiligheidsverplichtingen volgens artikel 21 van de NIS2-richtlijn',
                'Naleving van risicobeheersmaatregelen in verhouding tot uw grootte',
                'Regelgevend toezicht via het Centrum voor Cybersecurity België (CCB)'
            ],
            timeline: 'De Belgische omzetting is van kracht sinds oktober 2024. Geen 24u-meldingsplicht voor uw categorie, tenzij ernstig incident.',
            accountability: 'Aansprakelijkheid van bestuurders omvat door algemeen recht. Geen specifieke NIS2-administratieve sancties, maar zorgvuldigheid vereist.',
            positioning: 'Kans om uw cyber governance geleidelijk te structureren om regelgevende evolutie voor te zijn en stakeholders te geruststellen.'
        },
        'tier-2': {
            label: 'Belangrijke Blootstelling',
            title: 'Niveau 2: Belangrijke Entiteit - Versterkte Verplichtingen',
            implications: 'Uw organisatie valt mogelijk onder de categorie "Belangrijke Entiteit" volgens Bijlage III van de NIS2-richtlijn. Specifieke verplichtingen zijn van toepassing.',
            obligations: [
                'Meldplicht significante incidenten aan CCB binnen 24 uur (artikel 23)',
                'Implementatie van cyber risicobeheersmaatregelen (artikel 21)',
                'Beveiliging van de toeleveringsketen (artikel 21)',
                'Periodieke compliance audit en documentatie van maatregelen'
            ],
            timeline: 'Onmiddellijke inwerkingtreding sinds Belgische omzetting oktober 2024. Eerste regelgevende evaluatie verwacht binnen 12 maanden.',
            accountability: 'Versterkte aansprakelijkheid bestuurders. Administratieve sancties tot 1,4% van wereldwijde omzet of 7M€ volgens Belgische wet.',
            positioning: 'Snelle structurering van uw ISMS (Information Security Management System) wordt aanbevolen om proactieve compliance te demonstreren.'
        },
        'tier-3': {
            label: 'Kritieke Blootstelling',
            title: 'Niveau 3: Hoge Blootstelling - Prioritaire Compliance',
            implications: 'Uw organisatie heeft een hoge blootstelling aan NIS2-verplichtingen, mogelijk als Essentiële of Belangrijke Entiteit met hoog risico. Onmiddellijke actie vereist.',
            obligations: [
                'Verplichte 24u-melding aan CCB voor elk significant incident',
                'Jaarlijkse compliance audit door geaccrediteerde derde partij',
                'Strenge beveiligingsmaatregelen: toegangsbeheer, encryptie, MFA, continuïteitsplannen',
                'Due diligence op kritieke leveranciers en toeleveringsketen',
                'Verplichte documentatie van risicobeheersmaatregelen'
            ],
            timeline: 'Onmiddellijke naleving vereist. Wet van 7 april 2024 is van toepassing. CCB-controles worden uitgerold.',
            accountability: 'Persoonlijke aansprakelijkheid bestuurders blootgesteld. Strenge strafrechtelijke en administratieve sancties (tot 10M€ of 2% wereldwijde omzet).',
            positioning: 'NIS2-compliance is een strategische prioriteit. Een gestructureerde aanpak, mogelijk via ISO 27001 certificering, wordt sterk aanbevolen om juridische en operationele risico\'s te mitigeren.'
        }
    };
    
    const data = tiers[tier];
    
    // Update badge
    tierBadge.textContent = data.label;
    tierBadge.className = `tier-badge ${tier}`;
    
    // Generate HTML content
    return `
        <div class="result-section">
            <h4>📋 Juridische implicaties</h4>
            <p><strong>${data.title}</strong></p>
            <p>${data.implications}</p>
        </div>
        
        <div class="result-section">
            <h4>⚖️ Reglementaire verplichtingen</h4>
            <ul>
                ${data.obligations.map(obs => `<li>${obs}</li>`).join('')}
            </ul>
        </div>
        
        <div class="result-section">
            <h4>📅 Implementatietijdlijn</h4>
            <p>${data.timeline}</p>
        </div>
        
        <div class="result-section">
            <h4>👔 Bestuurdersaansprakelijkheid</h4>
            <p>${data.accountability}</p>
        </div>
        
        <div class="result-section">
            <h4>🎯 Strategische aanbeveling</h4>
            <p>${data.positioning}</p>
        </div>
    `;
}

/**
 * Calculate results and display
 */
function calculateAndShowResults() {
    const tier = calculateTier();
    const content = generateResults(tier);
    
    resultContent.innerHTML = content;
    goToStep(5);
}

/**
 * Restart assessment
 */
function restartAssessment() {
    // Reset state
    state.answers = {
        entitySize: null,
        serviceSensitivity: null,
        digitalInfrastructure: {
            cloud: false,
            mfa: false,
            incidentProcess: false,
            supplyChain: false
        },
        governanceMaturity: null
    };
    
    // Reset UI
    document.querySelectorAll('.option-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    document.querySelectorAll('.checkbox-input').forEach(cb => {
        cb.checked = false;
    });
    
    // Go to step 1
    goToStep(1);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Ensure step 1 is visible
    goToStep(1);
});
