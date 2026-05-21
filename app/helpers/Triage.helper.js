import { prisma } from '../config/db.conf.js';

// Mapping levels to weight for "Most Urgent Feature" logic
const LEVEL_WEIGHTS = {
  HITAM: 6,
  MERAH: 5,
  OREN: 4,
  KUNING: 3,
  HIJAU: 2,
  BIRU: 1,
  PUTIH: 1
};

const WEIGHT_TO_LEVEL = {
  6: { level: 'HITAM', prioritas: 'NON_URGENT' },
  5: { level: 'MERAH', prioritas: 'SEGERA' },
  4: { level: 'OREN', prioritas: 'DARURAT' },
  3: { level: 'KUNING', prioritas: 'URGENT' },
  2: { level: 'HIJAU', prioritas: 'SEMI_URGENT' },
  1: { level: 'BIRU', prioritas: 'NON_URGENT' }
};

/**
 * Intelligent ATS Triage determination logic.
 * Follows the "Most Urgent Feature" clinical rule.
 * 
 * @param {Object} data - The physiological assessment data
 * @param {Array} items - The selected checklist rules (e.g. { rule_id, catatan }[])
 * @returns {Promise<Object>} { level_triase, prioritas_triase }
 */
async function determineTriage(data, items = []) {
  let maxWeight = 1; // Default is Blue (ATS 5)

  // 1. Check Death on Arrival (DOA)
  if (data.doa === true) {
    return { level_triase: 'HITAM', prioritas_triase: 'NON_URGENT' };
  }

  // 2. Airway (Status Jalan Nafas)
  if (data.status_jalan_nafas === 'OBSTRUKSI_TOTAL') {
    maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.MERAH);
  } else if (data.status_jalan_nafas === 'OBSTRUKSI_PARSIAL') {
    maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.OREN);
  }

  // 3. Breathing (Respirasi & SpO2)
  const rr = Number(data.respirasi_per_menit);
  if (data.respirasi_per_menit !== null && data.respirasi_per_menit !== undefined && !isNaN(rr)) {
    if (rr < 5 || rr > 35) {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.MERAH);
    } else if ((rr >= 5 && rr <= 8) || (rr >= 30 && rr <= 35)) {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.OREN);
    } else if ((rr >= 9 && rr <= 11) || (rr >= 25 && rr <= 29)) {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.KUNING);
    }
  }

  const spo2 = Number(data.saturasi_oksigen);
  if (data.saturasi_oksigen !== null && data.saturasi_oksigen !== undefined && !isNaN(spo2)) {
    if (spo2 < 90) {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.MERAH);
    } else if (spo2 >= 90 && spo2 <= 92) {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.OREN);
    } else if (spo2 >= 93 && spo2 <= 95) {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.KUNING);
    }
  }

  // 4. Circulation (Nadi & Tekanan Darah Sistolik)
  const hr = Number(data.nadi_per_menit);
  if (data.nadi_per_menit !== null && data.nadi_per_menit !== undefined && !isNaN(hr)) {
    if (hr < 40 || hr > 150) {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.MERAH);
    } else if ((hr >= 40 && hr <= 49) || (hr >= 120 && hr <= 150)) {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.OREN);
    } else if ((hr >= 50 && hr <= 59) || (hr >= 100 && hr <= 119)) {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.KUNING);
    }
  }

  const sbp = Number(data.tekanan_darah_sistolik);
  if (data.tekanan_darah_sistolik !== null && data.tekanan_darah_sistolik !== undefined && !isNaN(sbp)) {
    if (sbp < 80) {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.MERAH);
    } else if ((sbp >= 80 && sbp <= 89) || sbp > 220) {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.OREN);
    } else if ((sbp >= 90 && sbp <= 99) || (sbp >= 180 && sbp <= 220)) {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.KUNING);
    }
  }

  // 5. Disability / Neurological (GCS & Tingkat Kesadaran)
  let gcs = null;
  if (data.gcs_e || data.gcs_v || data.gcs_m) {
    gcs = (Number(data.gcs_e) || 0) + (Number(data.gcs_v) || 0) + (Number(data.gcs_m) || 0);
  } else if (data.total_gcs) {
    gcs = Number(data.total_gcs);
  }

  if (gcs !== null && !isNaN(gcs)) {
    if (gcs < 9) {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.MERAH);
    } else if (gcs >= 9 && gcs <= 12) {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.OREN);
    } else if (gcs >= 13 && gcs <= 14) {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.KUNING);
    }
  }

  // Fallback to Tingkat Kesadaran enum if GCS is not fully set
  if (data.tingkat_kesadaran) {
    if (data.tingkat_kesadaran === 'KOMA') {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.MERAH);
    } else if (data.tingkat_kesadaran === 'SOPOR' || data.tingkat_kesadaran === 'SOMNOLEN') {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.OREN);
    } else if (data.tingkat_kesadaran === 'APATIS') {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.KUNING);
    }
  }

  // 6. Skala Nyeri (Pain Scale)
  const pain = Number(data.skala_nyeri);
  if (data.skala_nyeri !== null && data.skala_nyeri !== undefined && !isNaN(pain)) {
    if (pain >= 8) {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.OREN); // Very severe pain is ATS 2
    } else if (pain >= 4 && pain <= 7) {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.KUNING); // Moderate pain is ATS 3
    } else if (pain >= 1 && pain <= 3) {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.HIJAU); // Mild pain is ATS 4
    }
  }

  // 7. Suhu Tubuh (Temperature)
  const temp = Number(data.suhu);
  if (data.suhu !== null && data.suhu !== undefined && !isNaN(temp)) {
    if (temp < 35 || temp > 40) {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.OREN); // Extreme temp compromise is ATS 2
    } else if (temp >= 38.5 && temp <= 40) {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.KUNING); // High fever is ATS 3
    } else if (temp >= 37.5 && temp < 38.5) {
      maxWeight = Math.max(maxWeight, LEVEL_WEIGHTS.HIJAU); // Low grade fever is ATS 4
    }
  }

  // 8. Selected Triage Rules checklist (from database)
  if (items && items.length > 0) {
    const ruleIds = items.map(item => BigInt(item.rule_id));
    const rules = await prisma.masterTriageRule.findMany({
      where: {
        id: { in: ruleIds },
        aktif: true
      }
    });

    for (const rule of rules) {
      const ruleWeight = LEVEL_WEIGHTS[rule.level_triase];
      if (ruleWeight) {
        maxWeight = Math.max(maxWeight, ruleWeight);
      }
    }
  }

  // Map weight back to Triage Level & Priority
  const determined = WEIGHT_TO_LEVEL[maxWeight];
  return {
    level_triase: determined.level,
    prioritas_triase: determined.prioritas
  };
}

export { determineTriage };
