import { prisma } from '../config/db.conf.js';

const TriageModel = {
  // Master Triage Case Type
  findAllCaseTypes: () => prisma.masterTriageCaseType.findMany({
    where: { aktif: true },
    orderBy: { nama_kasus: 'asc' }
  }),

  // Master Triage Category
  findAllCategories: () => prisma.masterTriageCategory.findMany({
    include: {
      rules: {
        where: { aktif: true },
        orderBy: { skala: 'asc' }
      }
    },
    orderBy: { urutan: 'asc' }
  }),

  // Triage Assessment
  createAssessment: (data, items) => prisma.$transaction(async (tx) => {
    const assessment = await tx.triageAssessment.create({
      data: {
        ...data,
        assessment_items: {
          create: items.map(item => ({
            master_triage_rule_id: item.rule_id,
            catatan: item.catatan
          }))
        }
      },
      include: {
        assessment_items: true
      }
    });
    return assessment;
  }),

  findAssessmentById: (id) => prisma.triageAssessment.findUnique({
    where: { id: BigInt(id) },
    include: {
      macam_kasus: true,
      assessment_items: {
        include: {
          master_triage_rule: true
        }
      }
    }
  }),

  findAllAssessments: (params = {}) => {
    const { no_rawat, no_rm, skip = 0, take = 10 } = params;
    return prisma.triageAssessment.findMany({
      where: {
        ...(no_rawat && { no_rawat }),
        ...(no_rm && { no_rm }),
        deleted_at: null
      },
      include: {
        macam_kasus: true
      },
      orderBy: { waktu_assessment: 'desc' },
      skip: Number(skip),
      take: Number(take)
    });
  }
};

export default TriageModel;
