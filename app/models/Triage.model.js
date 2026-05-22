import { prisma } from '../config/db.conf.js';

const TriageModel = {
  // Master Triage Case Type
  findAllCaseTypes: () => prisma.masterTriageCaseType.findMany({
    where: { deleted_at: null },
    orderBy: { case_name: 'asc' }
  }),

  findCaseTypeById: (id) => prisma.masterTriageCaseType.findFirst({
    where: { id: BigInt(id), deleted_at: null }
  }),

  createCaseType: (data) => prisma.masterTriageCaseType.create({
    data
  }),

  updateCaseType: (id, data) => prisma.masterTriageCaseType.update({
    where: { id: BigInt(id) },
    data
  }),

  deleteCaseType: (id) => prisma.masterTriageCaseType.update({
    where: { id: BigInt(id) },
    data: { deleted_at: new Date(), is_active: false }
  }),

  // Master Triage Category
  findAllCategories: () => prisma.masterTriageCategory.findMany({
    where: { deleted_at: null },
    include: {
      rules: {
        where: { deleted_at: null, is_active: true },
        orderBy: { scale: 'asc' }
      }
    },
    orderBy: { sort_order: 'asc' }
  }),

  findCategoryById: (id) => prisma.masterTriageCategory.findFirst({
    where: { id: BigInt(id), deleted_at: null },
    include: { rules: { where: { deleted_at: null, is_active: true } } }
  }),

  createCategory: (data) => prisma.masterTriageCategory.create({
    data
  }),

  updateCategory: (id, data) => prisma.masterTriageCategory.update({
    where: { id: BigInt(id) },
    data
  }),

  deleteCategory: (id) => prisma.masterTriageCategory.update({
    where: { id: BigInt(id) },
    data: { 
      deleted_at: new Date(),
      rules: { 
        updateMany: { 
          where: { deleted_at: null }, 
          data: { deleted_at: new Date(), is_active: false } 
        } 
      } 
    }
  }),

  // Master Triage Rule
  findAllRules: () => prisma.masterTriageRule.findMany({
    where: { deleted_at: null, is_active: true },
    include: { category: { where: { deleted_at: null } } },
    orderBy: { rule_name: 'asc' }
  }),

  findRuleById: (id) => prisma.masterTriageRule.findFirst({
    where: { id: BigInt(id), deleted_at: null },
    include: { category: true }
  }),

  createRule: (data) => prisma.masterTriageRule.create({
    data
  }),

  updateRule: (id, data) => prisma.masterTriageRule.update({
    where: { id: BigInt(id) },
    data
  }),

  deleteRule: (id) => prisma.masterTriageRule.update({
    where: { id: BigInt(id) },
    data: { deleted_at: new Date(), is_active: false }
  }),

  // Triage Assessment
  createAssessment: (data, items) => prisma.$transaction(async (tx) => {
    const assessment = await tx.triageAssessment.create({
      data: {
        ...data,
        assessment_items: {
          create: items.map(item => ({
            master_triage_rule_id: item.rule_id,
            notes: item.notes
          }))
        }
      },
      include: {
        assessment_items: true
      }
    });
    return assessment;
  }),

  findAssessmentById: (id) => prisma.triageAssessment.findFirst({
    where: { id: BigInt(id), deleted_at: null },
    include: {
      case_type: { where: { deleted_at: null } },
      assessment_items: {
        where: { deleted_at: null },
        include: {
          master_triage_rule: { where: { deleted_at: null } }
        }
      }
    }
  }),

  findAllAssessments: (params = {}) => {
    const { visit_number, medical_record_number, skip = 0, take = 10 } = params;
    return prisma.triageAssessment.findMany({
      where: {
        ...(visit_number && { visit_number }),
        ...(medical_record_number && { medical_record_number }),
        deleted_at: null
      },
      include: {
        case_type: { where: { deleted_at: null } }
      },
      orderBy: { assessment_time: 'desc' },
      skip: Number(skip),
      take: Number(take)
    });
  },

  deleteAssessment: (id) => prisma.triageAssessment.update({
    where: { id: BigInt(id) },
    data: { 
      deleted_at: new Date(),
      assessment_items: {
        updateMany: {
          where: { deleted_at: null },
          data: { deleted_at: new Date() }
        }
      }
    }
  })
};

export default TriageModel;
