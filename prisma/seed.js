import { PrismaClient } from '@prisma/client';
import { seedTriageAssessments } from './factories/TriageAssessment.factory.js';

const prisma = new PrismaClient();

const main = async () => {
  // Seed Master Triage Case Types
  const caseTypes = [
    { code: 'TRAUMA', case_name: 'Trauma' },
    { code: 'NON_TRAUMA', case_name: 'Non Trauma' },
    { code: 'OBSTETRI', case_name: 'Obstetri & Ginekologi' }
  ];

  for (const ct of caseTypes) {
    await prisma.masterTriageCaseType.upsert({
      where: { code: ct.code },
      update: {},
      create: ct
    });
  }

  // Seed Master Triage Categories & Rules
  const categories = [
    {
      code: 'KESADARAN',
      category_name: 'Kesadaran (Disability)',
      sort_order: 1,
      rules: [
        { rule_name: 'GCS < 9 (Koma / Unresponsive)', scale: 1, triage_level: 'RED', priority: 'IMMEDIATE' },
        { rule_name: 'GCS 9-12 (Sopor / Somnolen)', scale: 2, triage_level: 'ORANGE', priority: 'EMERGENCY' },
        { rule_name: 'GCS 13-14 (Apatis)', scale: 3, triage_level: 'YELLOW', priority: 'URGENT' },
        { rule_name: 'GCS 15 (Compos Mentis / Normal)', scale: 4, triage_level: 'GREEN', priority: 'SEMI_URGENT' }
      ]
    },
    {
      code: 'JALAN_NAFAS',
      category_name: 'Jalan Nafas (Airway)',
      sort_order: 2,
      rules: [
        { rule_name: 'Sumbatan / Obstruksi Total', scale: 1, triage_level: 'RED', priority: 'IMMEDIATE' },
        { rule_name: 'Ancaman / Obstruksi Parsial', scale: 2, triage_level: 'ORANGE', priority: 'EMERGENCY' },
        { rule_name: 'Bebas / Paten', scale: 3, triage_level: 'GREEN', priority: 'SEMI_URGENT' }
      ]
    },
    {
      code: 'PERNAFASAN',
      category_name: 'Pernafasan (Breathing)',
      sort_order: 3,
      rules: [
        { rule_name: 'Henti Nafas / Severe Distress (RR < 5 atau > 35) / SpO2 < 90%', scale: 1, triage_level: 'RED', priority: 'IMMEDIATE' },
        { rule_name: 'Moderate Respiratory Distress (RR 30-35 atau SpO2 90-92%)', scale: 2, triage_level: 'ORANGE', priority: 'EMERGENCY' },
        { rule_name: 'Mild Respiratory Distress (RR 25-29 atau SpO2 93-95%)', scale: 3, triage_level: 'YELLOW', priority: 'URGENT' },
        { rule_name: 'Nafas Normal (RR 12-24 dan SpO2 >= 96%)', scale: 4, triage_level: 'GREEN', priority: 'SEMI_URGENT' }
      ]
    },
    {
      code: 'SIRKULASI',
      category_name: 'Sirkulasi (Circulation)',
      sort_order: 4,
      rules: [
        { rule_name: 'Henti Jantung / Syok Berat (Nadi < 40 atau > 150) / TD Sistolik < 80 mmHg', scale: 1, triage_level: 'RED', priority: 'IMMEDIATE' },
        { rule_name: 'Syok Sedang / Gangguan Sirkulasi Berat (Nadi 40-49 atau 120-150 / TD Sistolik 80-89 mmHg)', scale: 2, triage_level: 'ORANGE', priority: 'EMERGENCY' },
        { rule_name: 'Gangguan Sirkulasi Ringan (Nadi 50-59 or 100-119 / TD Sistolik 90-99 mmHg)', scale: 3, triage_level: 'YELLOW', priority: 'URGENT' },
        { rule_name: 'Sirkulasi Stabil / Normal', scale: 4, triage_level: 'GREEN', priority: 'SEMI_URGENT' }
      ]
    },
    {
      code: 'KONDISI_KHUSUS',
      category_name: 'Kondisi Khusus & Risiko Tinggi',
      sort_order: 5,
      rules: [
        { rule_name: 'Kejang Lama (> 5 Menit) / Status Epileptikus', scale: 1, triage_level: 'RED', priority: 'IMMEDIATE' },
        { rule_name: 'Nyeri Dada Khas Jantung (Suspected ACS / Infark)', scale: 2, triage_level: 'ORANGE', priority: 'EMERGENCY' },
        { rule_name: 'Defisit Neurologis Akut (Kecurigaan Stroke Akut Onset < 4.5 Jam)', scale: 2, triage_level: 'ORANGE', priority: 'EMERGENCY' },
        { rule_name: 'Sepsis Berat / Tanda Infeksi Sistemik Berat', scale: 2, triage_level: 'ORANGE', priority: 'EMERGENCY' },
        { rule_name: 'Luka Bakar Luas (> 25% Luas Permukaan Tubuh)', scale: 2, triage_level: 'ORANGE', priority: 'EMERGENCY' },
        { rule_name: 'Nyeri Hebat / Ekstrim (Skala Nyeri 8-10)', scale: 2, triage_level: 'ORANGE', priority: 'EMERGENCY' },
        { rule_name: 'Nyeri Sedang-Berat (Skala Nyeri 4-7)', scale: 3, triage_level: 'YELLOW', priority: 'URGENT' },
        { rule_name: 'Keracunan / Riwayat Paparan Zat Berbahaya', scale: 3, triage_level: 'YELLOW', priority: 'URGENT' },
        { rule_name: 'Luka Bakar Sedang (10-25% Luas Permukaan Tubuh)', scale: 3, triage_level: 'YELLOW', priority: 'URGENT' },
        { rule_name: 'Luka Ringan / Lecet Ringan (Skala Nyeri 1-3)', scale: 4, triage_level: 'GREEN', priority: 'SEMI_URGENT' },
        { rule_name: 'Kontrol Rutin / Administrasi / Surat Sehat / Imunisasi', scale: 5, triage_level: 'BLUE', priority: 'NON_URGENT' }
      ]
    }
  ];

  for (const cat of categories) {
    const { rules, ...catData } = cat;
    const category = await prisma.masterTriageCategory.upsert({
      where: { code: cat.code },
      update: {},
      create: catData
    });

    for (const rule of rules) {
      await prisma.masterTriageRule.create({
        data: {
          ...rule,
          category_id: category.id
        }
      });
    }
  }

  // Seed Mock Assessments
  await seedTriageAssessments(10);
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
