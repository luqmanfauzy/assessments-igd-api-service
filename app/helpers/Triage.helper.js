import { prisma } from '../config/db.conf.js';

// Mapping levels to weight for "Most Urgent Feature" logic
const LEVEL_WEIGHTS = {
  BLACK: 6,
  RED: 5,
  ORANGE: 4,
  YELLOW: 3,
  GREEN: 2,
  BLUE: 1,
  WHITE: 1
};

const WEIGHT_TO_LEVEL = {
  6: { level: 'BLACK', priority: 'NON_URGENT' },
  5: { level: 'RED', priority: 'IMMEDIATE' },
  4: { level: 'ORANGE', priority: 'EMERGENCY' },
  3: { level: 'YELLOW', priority: 'URGENT' },
  2: { level: 'GREEN', priority: 'SEMI_URGENT' },
  1: { level: 'BLUE', priority: 'NON_URGENT' }
};

/**
 * Intelligent ATS Triage determination logic.
 * Follows the "Most Urgent Feature" clinical rule.
 * 
 * @param {Object} data - The physiological assessment data
 * @param {Array} items - The selected checklist rules (e.g. { rule_id, notes }[])
 * @returns {Promise<Object>} { triage_level, triage_priority }
 */
async function determineTriage(data, items = []) {
  let maxWeight = 1; // Default is Blue (ATS 5)

  // 1. Check Death on Arrival (DOA)
  if (data.doa === true) {
    return { triage_level: 'BLACK', triage_priority: 'NON_URGENT' };
  }

  // 2. Airway (Airway Status)
  if (data.airway_status === 'TOTAL_OBSTRUCTION') {
    maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.RED);
  } else if (data.airway_status === 'PARTIAL_OBSTRUCTION') {
    maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.ORANGE);
  }

  // 3. Breathing (Respiratory Rate & SpO2)
  const rr = Number(data.respiratory_rate);
  if (data.respiratory_rate !== null && data.respiratory_rate !== undefined && !isNaN(rr)) {
    if (rr < 5 || rr > 35) {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.RED);
    } else if ((rr >= 5 && rr <= 8) || (rr >= 30 && rr <= 35)) {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.ORANGE);
    } else if ((rr >= 9 && rr <= 11) || (rr >= 25 && rr <= 29)) {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.YELLOW);
    }
  }

  const spo2 = Number(data.oxygen_saturation);
  if (data.oxygen_saturation !== null && data.oxygen_saturation !== undefined && !isNaN(spo2)) {
    if (spo2 < 90) {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.RED);
    } else if (spo2 >= 90 && spo2 <= 92) {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.ORANGE);
    } else if (spo2 >= 93 && spo2 <= 95) {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.YELLOW);
    }
  }

  // 4. Circulation (Heart Rate & Systolic Blood Pressure)
  const hr = Number(data.heart_rate);
  if (data.heart_rate !== null && data.heart_rate !== undefined && !isNaN(hr)) {
    if (hr < 40 || hr > 150) {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.RED);
    } else if ((hr >= 40 && hr <= 49) || (hr >= 120 && hr <= 150)) {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.ORANGE);
    } else if ((hr >= 50 && hr <= 59) || (hr >= 100 && hr <= 119)) {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.YELLOW);
    }
  }

  const sbp = Number(data.systolic_blood_pressure);
  if (data.systolic_blood_pressure !== null && data.systolic_blood_pressure !== undefined && !isNaN(sbp)) {
    if (sbp < 80) {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.RED);
    } else if ((sbp >= 80 && sbp <= 89) || sbp > 220) {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.ORANGE);
    } else if ((sbp >= 90 && sbp <= 99) || (sbp >= 180 && sbp <= 220)) {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.YELLOW);
    }
  }

  // 5. Disability / Neurological (GCS & Consciousness Level)
  let gcs = null;
  if (data.gcs_e || data.gcs_v || data.gcs_m) {
    gcs = (Number(data.gcs_e) || 0) + (Number(data.gcs_v) || 0) + (Number(data.gcs_m) || 0);
  } else if (data.total_gcs) {
    gcs = Number(data.total_gcs);
  }

  if (gcs !== null && !isNaN(gcs)) {
    if (gcs < 9) {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.RED);
    } else if (gcs >= 9 && gcs <= 12) {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.ORANGE);
    } else if (gcs >= 13 && gcs <= 14) {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.YELLOW);
    }
  }

  // Fallback to Consciousness Level enum if GCS is not fully set
  if (data.consciousness_level) {
    if (data.consciousness_level === 'COMA') {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.RED);
    } else if (data.consciousness_level === 'STUPOR' || data.consciousness_level === 'SOMNOLENCE') {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.ORANGE);
    } else if (data.consciousness_level === 'APATHY') {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.YELLOW);
    }
  }

  // 6. Pain Scale
  const pain = Number(data.pain_scale);
  if (data.pain_scale !== null && data.pain_scale !== undefined && !isNaN(pain)) {
    if (pain >= 8) {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.ORANGE); // Very severe pain is ATS 2
    } else if (pain >= 4 && pain <= 7) {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.YELLOW); // Moderate pain is ATS 3
    } else if (pain >= 1 && pain <= 3) {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.GREEN); // Mild pain is ATS 4
    }
  }

  // 7. Temperature
  const temp = Number(data.temperature);
  if (data.temperature !== null && data.temperature !== undefined && !isNaN(temp)) {
    if (temp < 35 || temp > 40) {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.ORANGE); // Extreme temp compromise is ATS 2
    } else if (temp >= 38.5 && temp <= 40) {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.YELLOW); // High fever is ATS 3
    } else if (temp >= 37.5 && temp < 38.5) {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.GREEN); // Low grade fever is ATS 4
    }
  }

  // 8. Selected Triage Rules checklist (from database)
  if (items && items.length > 0) {
    const ruleIds = items.map(item => BigInt(item.rule_id));
    const rules = await prisma.masterTriageRule.findMany({
      where: {
        id: { in: ruleIds },
        is_active: true
      }
    });

    for (const rule of rules) {
      const ruleWeight = LEVEL_WEIGHTS[rule.triage_level];
      if (ruleWeight) {
        maxWeight = Math.max(maxWeight, ruleWeight);
      }
    }
  }

  // Map weight back to Triage Level & Priority
  const determined = WEIGHT_TO_LEVEL[maxWeight];
  return {
    triage_level: determined.level,
    triage_priority: determined.priority
  };
}

export { determineTriage };
