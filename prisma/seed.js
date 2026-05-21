import { PrismaClient } from '@prisma/client';
import { seedTriageAssessments } from './factories/TriageAssessment.factory.js';

const prisma = new PrismaClient();

const main = async () => {
  // Seed Master Triage Case Types
  const caseTypes = [
    { kode: 'TRAUMA', nama_kasus: 'Trauma' },
    { kode: 'NON_TRAUMA', nama_kasus: 'Non Trauma' },
    { kode: 'OBSTETRI', nama_kasus: 'Obstetri & Ginekologi' }
  ];

  for (const ct of caseTypes) {
    await prisma.masterTriageCaseType.upsert({
      where: { kode: ct.kode },
      update: {},
      create: ct
    });
  }

  // Seed Master Triage Categories & Rules
  const categories = [
    {
      kode: 'KESADARAN',
      nama_kategori: 'Kesadaran (Disability)',
      urutan: 1,
      rules: [
        { nama_rule: 'GCS < 9 (Koma / Unresponsive)', skala: 1, level_triase: 'MERAH', prioritas: 'SEGERA' },
        { nama_rule: 'GCS 9-12 (Sopor / Somnolen)', skala: 2, level_triase: 'OREN', prioritas: 'DARURAT' },
        { nama_rule: 'GCS 13-14 (Apatis)', skala: 3, level_triase: 'KUNING', prioritas: 'URGENT' },
        { nama_rule: 'GCS 15 (Compos Mentis / Normal)', skala: 4, level_triase: 'HIJAU', prioritas: 'SEMI_URGENT' }
      ]
    },
    {
      kode: 'JALAN_NAFAS',
      nama_kategori: 'Jalan Nafas (Airway)',
      urutan: 2,
      rules: [
        { nama_rule: 'Sumbatan / Obstruksi Total', skala: 1, level_triase: 'MERAH', prioritas: 'SEGERA' },
        { nama_rule: 'Ancaman / Obstruksi Parsial', skala: 2, level_triase: 'OREN', prioritas: 'DARURAT' },
        { nama_rule: 'Bebas / Paten', skala: 3, level_triase: 'HIJAU', prioritas: 'SEMI_URGENT' }
      ]
    },
    {
      kode: 'PERNAFASAN',
      nama_kategori: 'Pernafasan (Breathing)',
      urutan: 3,
      rules: [
        { nama_rule: 'Henti Nafas / Severe Distress (RR < 5 atau > 35) / SpO2 < 90%', skala: 1, level_triase: 'MERAH', prioritas: 'SEGERA' },
        { nama_rule: 'Moderate Respiratory Distress (RR 30-35 atau SpO2 90-92%)', skala: 2, level_triase: 'OREN', prioritas: 'DARURAT' },
        { nama_rule: 'Mild Respiratory Distress (RR 25-29 atau SpO2 93-95%)', skala: 3, level_triase: 'KUNING', prioritas: 'URGENT' },
        { nama_rule: 'Nafas Normal (RR 12-24 dan SpO2 >= 96%)', skala: 4, level_triase: 'HIJAU', prioritas: 'SEMI_URGENT' }
      ]
    },
    {
      kode: 'SIRKULASI',
      nama_kategori: 'Sirkulasi (Circulation)',
      urutan: 4,
      rules: [
        { nama_rule: 'Henti Jantung / Syok Berat (Nadi < 40 atau > 150) / TD Sistolik < 80 mmHg', skala: 1, level_triase: 'MERAH', prioritas: 'SEGERA' },
        { nama_rule: 'Syok Sedang / Gangguan Sirkulasi Berat (Nadi 40-49 atau 120-150 / TD Sistolik 80-89 mmHg)', skala: 2, level_triase: 'OREN', prioritas: 'DARURAT' },
        { nama_rule: 'Gangguan Sirkulasi Ringan (Nadi 50-59 atau 100-119 / TD Sistolik 90-99 mmHg)', skala: 3, level_triase: 'KUNING', prioritas: 'URGENT' },
        { nama_rule: 'Sirkulasi Stabil / Normal', skala: 4, level_triase: 'HIJAU', prioritas: 'SEMI_URGENT' }
      ]
    },
    {
      kode: 'KONDISI_KHUSUS',
      nama_kategori: 'Kondisi Khusus & Risiko Tinggi',
      urutan: 5,
      rules: [
        { nama_rule: 'Kejang Lama (> 5 Menit) / Status Epileptikus', skala: 1, level_triase: 'MERAH', prioritas: 'SEGERA' },
        { nama_rule: 'Nyeri Dada Khas Jantung (Suspected ACS / Infark)', skala: 2, level_triase: 'OREN', prioritas: 'DARURAT' },
        { nama_rule: 'Defisit Neurologis Akut (Kecurigaan Stroke Akut Onset < 4.5 Jam)', skala: 2, level_triase: 'OREN', prioritas: 'DARURAT' },
        { nama_rule: 'Sepsis Berat / Tanda Infeksi Sistemik Berat', skala: 2, level_triase: 'OREN', prioritas: 'DARURAT' },
        { nama_rule: 'Luka Bakar Luas (> 25% Luas Permukaan Tubuh)', skala: 2, level_triase: 'OREN', prioritas: 'DARURAT' },
        { nama_rule: 'Nyeri Hebat / Ekstrim (Skala Nyeri 8-10)', skala: 2, level_triase: 'OREN', prioritas: 'DARURAT' },
        { nama_rule: 'Nyeri Sedang-Berat (Skala Nyeri 4-7)', skala: 3, level_triase: 'KUNING', prioritas: 'URGENT' },
        { nama_rule: 'Keracunan / Riwayat Paparan Zat Berbahaya', skala: 3, level_triase: 'KUNING', prioritas: 'URGENT' },
        { nama_rule: 'Luka Bakar Sedang (10-25% Luas Permukaan Tubuh)', skala: 3, level_triase: 'KUNING', prioritas: 'URGENT' },
        { nama_rule: 'Luka Ringan / Lecet Ringan (Skala Nyeri 1-3)', skala: 4, level_triase: 'HIJAU', prioritas: 'SEMI_URGENT' },
        { nama_rule: 'Kontrol Rutin / Administrasi / Surat Sehat / Imunisasi', skala: 5, level_triase: 'BIRU', prioritas: 'NON_URGENT' }
      ]
    }
  ];

  for (const cat of categories) {
    const { rules, ...catData } = cat;
    const category = await prisma.masterTriageCategory.upsert({
      where: { kode: cat.kode },
      update: {},
      create: catData
    });

    for (const rule of rules) {
      await prisma.masterTriageRule.create({
        data: {
          ...rule,
          kategori_id: category.id
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
