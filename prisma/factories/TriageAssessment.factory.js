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
        visit_number: faker.string.alphanumeric({ length: 10 }).toUpperCase(),
        medical_record_number: faker.string.numeric(6),
        patient_name: faker.person.fullName(),
        visit_date: faker.date.recent(),
        arrival_method: faker.helpers.arrayElement(['WALK_IN', 'STRETCHER', 'WHEELCHAIR', 'CARRIED']),
        transportation: faker.helpers.arrayElement(['AMBULANCE', 'SELF', 'PRIVATE', 'NONE']),
        arrival_reason: faker.helpers.arrayElement(['SELF_ARRIVAL', 'POLICE', 'REFERRAL', 'NONE']),
        case_type_id: randomCaseType.id,
        chief_complaint: faker.lorem.sentence(),
        temperature: faker.number.float({ min: 35, max: 40, fractionDigits: 1 }),
        pain_scale: faker.number.int({ min: 0, max: 10 }),
        gcs_e,
        gcs_v,
        gcs_m,
        total_gcs,
        triage_level: faker.helpers.arrayElement(['RED', 'ORANGE', 'YELLOW', 'GREEN', 'BLUE', 'WHITE', 'BLACK']),
        triage_priority: faker.helpers.arrayElement(['IMMEDIATE', 'EMERGENCY', 'URGENT', 'SEMI_URGENT', 'NON_URGENT']),
        assessment_items: {
          create: randomRules.map(rule => ({
            master_triage_rule_id: rule.id,
            notes: faker.lorem.words(3)
          }))
        }
      }
    });
  }
  console.log(`Successfully seeded ${count} triage assessments.`);
}

export { seedTriageAssessments };
