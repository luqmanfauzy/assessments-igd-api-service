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
      nama_kategori: 'Kesadaran',
      urutan: 1,
      rules: [
        { nama_rule: 'GCS < 9 (Koma)', skala: 1, level_triase: 'MERAH', prioritas: 'SEGERA' },
        { nama_rule: 'GCS 9-12 (Somnolen/Sopor)', skala: 2, level_triase: 'KUNING', prioritas: 'DARURAT' },
        { nama_rule: 'GCS > 12 (Compos Mentis)', skala: 3, level_triase: 'HIJAU', prioritas: 'URGENT' }
      ]
    },
    {
      kode: 'JALAN_NAFAS',
      nama_kategori: 'Jalan Nafas',
      urutan: 2,
      rules: [
        { nama_rule: 'Sumbatan / Obstruksi Total', skala: 1, level_triase: 'MERAH', prioritas: 'SEGERA' },
        { nama_rule: 'Ancaman / Obstruksi Parsial', skala: 2, level_triase: 'KUNING', prioritas: 'DARURAT' },
        { nama_rule: 'Bebas / Paten', skala: 3, level_triase: 'HIJAU', prioritas: 'URGENT' }
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
