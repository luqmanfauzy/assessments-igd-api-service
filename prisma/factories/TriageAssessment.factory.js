import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTriageAssessments(count = 5) {
  // Get some master data to link
  const caseTypes = await prisma.masterTriageCaseType.findMany();
  const rules = await prisma.masterTriageRule.findMany();

  if (caseTypes.length === 0 || rules.length === 0) {
    console.error('Please seed master data first (Case Types and Rules)');
    return;
  }

  for (let i = 0; i < count; i++) {
    const randomCaseType = caseTypes[Math.floor(Math.random() * caseTypes.length)];
    const randomRules = faker.helpers.arrayElements(rules, faker.number.int({ min: 1, max: 3 }));

    const gcs_e = faker.number.int({ min: 1, max: 4 });
    const gcs_v = faker.number.int({ min: 1, max: 5 });
    const gcs_m = faker.number.int({ min: 1, max: 6 });
    const total_gcs = gcs_e + gcs_v + gcs_m;

    await prisma.triageAssessment.create({
      data: {
        no_rawat: faker.string.alphanumeric({ length: 10 }).toUpperCase(),
        no_rm: faker.string.numeric(6),
        nama_pasien: faker.person.fullName(),
        tanggal_kunjungan: faker.date.recent(),
        cara_masuk: faker.helpers.arrayElement(['JALAN', 'BRANKAR', 'KURSI_RODA', 'DIGENDONG']),
        transportasi: faker.helpers.arrayElement(['AGD', 'SENDIRI', 'SWASTA', 'TIDAK_ADA']),
        alasan_kedatangan: faker.helpers.arrayElement(['DATANG_SENDIRI', 'POLISI', 'RUJUKAN', 'BIDAN', 'PUSKESMAS', 'RUMAH_SAKIT', 'POLIKLINIK', 'FASKES_LAIN', 'TIDAK_ADA']),
        macam_kasus_id: randomCaseType.id,
        keluhan_utama: faker.lorem.sentence(),
        suhu: faker.number.float({ min: 35, max: 40, fractionDigits: 1 }),
        skala_nyeri: faker.number.int({ min: 0, max: 10 }),
        gcs_e,
        gcs_v,
        gcs_m,
        total_gcs,
        level_triase: faker.helpers.arrayElement(['HIJAU', 'KUNING', 'MERAH', 'HITAM', 'ABU']),
        prioritas_triase: faker.helpers.arrayElement(['SEGERA', 'DARURAT', 'URGENT', 'NON_URGENT']),
        assessment_items: {
          create: randomRules.map(rule => ({
            master_triage_rule_id: rule.id,
            catatan: faker.lorem.words(3)
          }))
        }
      }
    });
  }
  console.log(`Successfully seeded ${count} triage assessments.`);
}

export { seedTriageAssessments };
