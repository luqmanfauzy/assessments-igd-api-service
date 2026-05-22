import Joi from 'joi';
import TriageModel from '../models/Triage.model.js';
import { buildResponse } from '../helpers/App.helper.js';
import { determineTriage } from '../helpers/Triage.helper.js';

const messages = {
  'any.required': '{{#label}} wajib diisi',
  'string.empty': '{{#label}} tidak boleh kosong',
  'string.base': '{{#label}} harus berupa teks',
  'number.base': '{{#label}} harus berupa angka',
  'date.base': '{{#label}} harus berupa tanggal yang valid'
};

const assessmentSchema = Joi.object({
  visit_number: Joi.string().allow('', null),
  medical_record_number: Joi.string().required().messages({ 'any.required': 'Masukkan nomor rekam medis terlebih dahulu' }),
  patient_name: Joi.string().required().messages({ 'any.required': 'Masukkan nama pasien terlebih dahulu' }),
  visit_date: Joi.date().required().messages({ 'any.required': 'Masukkan tanggal kunjungan terlebih dahulu' }),
  arrival_method: Joi.string().valid('WALK_IN', 'STRETCHER', 'WHEELCHAIR', 'CARRIED').required().messages({ 'any.required': 'Pilih cara masuk terlebih dahulu' }),
  transportation: Joi.string().valid('AMBULANCE', 'SELF', 'PRIVATE', 'NONE').required().messages({ 'any.required': 'Pilih transportasi terlebih dahulu' }),
  arrival_reason: Joi.string().valid('SELF_ARRIVAL', 'POLICE', 'REFERRAL', 'NONE').required().messages({ 'any.required': 'Pilih alasan kedatangan terlebih dahulu' }),
  notes: Joi.string().allow('', null),
  case_type_id: Joi.number().allow(null),
  chief_complaint: Joi.string().required().messages({ 'any.required': 'Masukkan keluhan utama terlebih dahulu' }),
  temperature: Joi.number().precision(1).allow(null),
  pain_scale: Joi.number().integer().min(0).max(10).allow(null),
  systolic_blood_pressure: Joi.number().integer().allow(null),
  diastolic_blood_pressure: Joi.number().integer().allow(null),
  heart_rate: Joi.number().integer().allow(null),
  oxygen_saturation: Joi.number().precision(2).allow(null),
  respiratory_rate: Joi.number().integer().allow(null),
  consciousness_level: Joi.string().valid('COMPOS_MENTIS', 'APATHY', 'SOMNOLENCE', 'DELIRIUM', 'STUPOR', 'COMA').allow(null),
  airway_status: Joi.string().valid('CLEAR', 'PARTIAL_OBSTRUCTION', 'TOTAL_OBSTRUCTION').allow(null),
  gcs_e: Joi.number().integer().min(1).max(4).allow(null),
  gcs_v: Joi.number().integer().min(1).max(5).allow(null),
  gcs_m: Joi.number().integer().min(1).max(6).allow(null),
  doa: Joi.boolean().default(false),
  triage_level: Joi.string().valid('RED', 'ORANGE', 'YELLOW', 'GREEN', 'BLUE', 'WHITE', 'BLACK').allow('', null),
  triage_priority: Joi.string().valid('IMMEDIATE', 'EMERGENCY', 'URGENT', 'SEMI_URGENT', 'NON_URGENT').allow('', null),
  items: Joi.array().items(Joi.object({
    rule_id: Joi.number().required(),
    notes: Joi.string().allow('', null)
  })).default([])
});

const caseTypeSchema = Joi.object({
  code: Joi.string().max(10).required().messages({ 'any.required': 'Masukkan kode kasus terlebih dahulu' }),
  case_name: Joi.string().max(100).required().messages({ 'any.required': 'Masukkan nama kasus terlebih dahulu' }),
  description: Joi.string().allow('', null),
  is_active: Joi.boolean().default(true)
});

const categorySchema = Joi.object({
  code: Joi.string().max(20).required().messages({ 'any.required': 'Masukkan kode kategori terlebih dahulu' }),
  category_name: Joi.string().max(100).required().messages({ 'any.required': 'Masukkan nama kategori terlebih dahulu' }),
  sort_order: Joi.number().integer().allow(null)
});

const ruleSchema = Joi.object({
  category_id: Joi.number().required().messages({ 'any.required': 'Pilih kategori terlebih dahulu' }),
  scale: Joi.number().integer().required().messages({ 'any.required': 'Masukkan skala terlebih dahulu' }),
  rule_name: Joi.string().max(150).required().messages({ 'any.required': 'Masukkan nama Rule terlebih dahulu' }),
  description: Joi.string().allow('', null),
  triage_level: Joi.string().valid('RED', 'ORANGE', 'YELLOW', 'GREEN', 'BLUE', 'WHITE', 'BLACK').required().messages({ 'any.required': 'Pilih level triase terlebih dahulu' }),
  priority: Joi.string().valid('IMMEDIATE', 'EMERGENCY', 'URGENT', 'SEMI_URGENT', 'NON_URGENT').required().messages({ 'any.required': 'Pilih prioritas terlebih dahulu' }),
  is_active: Joi.boolean().default(true)
});

const listCaseTypes = async (req, res, next) => {
  try {
    const data = await TriageModel.findAllCaseTypes();
    return res.json(buildResponse(true, 'Data Master Macam Kasus berhasil diambil', data));
  } catch (error) {
    return next(error);
  }
};

const createCaseType = async (req, res, next) => {
  try {
    const { value, error } = caseTypeSchema.validate(req.body);
    if (error) return res.status(422).json(buildResponse(false, error.details[0].message, error.details));
    const data = await TriageModel.createCaseType(value);
    return res.status(201).json(buildResponse(true, 'Macam Kasus berhasil dibuat', data));
  } catch (error) {
    return next(error);
  }
};

const updateCaseType = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { value, error } = caseTypeSchema.validate(req.body);
    if (error) return res.status(422).json(buildResponse(false, error.details[0].message, error.details));
    const data = await TriageModel.updateCaseType(id, value);
    return res.json(buildResponse(true, 'Macam Kasus berhasil diperbarui', data));
  } catch (error) {
    return next(error);
  }
};

const deleteCaseType = async (req, res, next) => {
  try {
    const { id } = req.params;
    await TriageModel.deleteCaseType(id);
    return res.json(buildResponse(true, 'Macam Kasus berhasil dihapus'));
  } catch (error) {
    return next(error);
  }
};

const listCategories = async (req, res, next) => {
  try {
    const data = await TriageModel.findAllCategories();
    return res.json(buildResponse(true, 'Data Master Kategori Triase berhasil diambil', data));
  } catch (error) {
    return next(error);
  }
};

const createCategory = async (req, res, next) => {
  try {
    const { value, error } = categorySchema.validate(req.body);
    if (error) return res.status(422).json(buildResponse(false, error.details[0].message, error.details));
    const data = await TriageModel.createCategory(value);
    return res.status(201).json(buildResponse(true, 'Kategori berhasil dibuat', data));
  } catch (error) {
    return next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { value, error } = categorySchema.validate(req.body);
    if (error) return res.status(422).json(buildResponse(false, error.details[0].message, error.details));
    const data = await TriageModel.updateCategory(id, value);
    return res.json(buildResponse(true, 'Kategori berhasil diperbarui', data));
  } catch (error) {
    return next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    await TriageModel.deleteCategory(id);
    return res.json(buildResponse(true, 'Kategori berhasil dihapus'));
  } catch (error) {
    return next(error);
  }
};

const listRules = async (req, res, next) => {
  try {
    const data = await TriageModel.findAllRules();
    return res.json(buildResponse(true, 'Data Master Rule Triase berhasil diambil', data));
  } catch (error) {
    return next(error);
  }
};

const createRule = async (req, res, next) => {
  try {
    const { value, error } = ruleSchema.validate(req.body);
    if (error) return res.status(422).json(buildResponse(false, error.details[0].message, error.details));
    const data = await TriageModel.createRule(value);
    return res.status(201).json(buildResponse(true, 'Rule berhasil dibuat', data));
  } catch (error) {
    return next(error);
  }
};

const updateRule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { value, error } = ruleSchema.validate(req.body);
    if (error) return res.status(422).json(buildResponse(false, error.details[0].message, error.details));
    const data = await TriageModel.updateRule(id, value);
    return res.json(buildResponse(true, 'Rule berhasil diperbarui', data));
  } catch (error) {
    return next(error);
  }
};

const deleteRule = async (req, res, next) => {
  try {
    const { id } = req.params;
    await TriageModel.deleteRule(id);
    return res.json(buildResponse(true, 'Rule berhasil dihapus'));
  } catch (error) {
    return next(error);
  }
};

const createAssessment = async (req, res, next) => {
  try {
    const { value, error } = assessmentSchema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(422).json(buildResponse(false, error.details[0].message, error.details));
    }

    const { items, ...assessmentData } = value;

    // Auto count total_gcs
    if (assessmentData.gcs_e || assessmentData.gcs_v || assessmentData.gcs_m) {
      assessmentData.total_gcs = (assessmentData.gcs_e || 0) + (assessmentData.gcs_v || 0) + (assessmentData.gcs_m || 0);
    }

    if (!assessmentData.visit_number || assessmentData.visit_number.trim() === '') {
      // Generate a unique visit_number if not provided
      const now = new Date();
      const datePart = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
      const timePart = now.getTime(); // Milliseconds since epoch for uniqueness
      assessmentData.visit_number = `RAWAT-${datePart}-${timePart}`;
    }

    // Auto determine/validate triage level and priority
    const determined = await determineTriage(assessmentData, items);

    const LEVEL_WEIGHTS = {
      BLACK: 6,
      RED: 5,
      ORANGE: 4,
      YELLOW: 3,
      GREEN: 2,
      BLUE: 1,
      WHITE: 1
    };

    if (!assessmentData.triage_level || assessmentData.triage_level.trim() === '') {
      assessmentData.triage_level = determined.triage_level;
      assessmentData.triage_priority = determined.triage_priority;
    } else {
      const providedWeight = LEVEL_WEIGHTS[assessmentData.triage_level] || 0;
      const determinedWeight = LEVEL_WEIGHTS[determined.triage_level] || 0;
      if (determinedWeight > providedWeight) {
        assessmentData.triage_level = determined.triage_level;
        assessmentData.triage_priority = determined.triage_priority;
      }
    }

    const data = await TriageModel.createAssessment(assessmentData, items);

    return res.status(201).json(buildResponse(true, 'Asesmen triase berhasil dibuat', data));
  } catch (error) {
    return next(error);
  }
};

const getAssessment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await TriageModel.findAssessmentById(id);

    if (!data) {
      return res.status(404).json(buildResponse(false, 'Asesmen tidak ditemukan'));
    }

    return res.json(buildResponse(true, 'Asesmen berhasil diambil', data));
  } catch (error) {
    return next(error);
  }
};

const listAssessments = async (req, res, next) => {
  try {
    const data = await TriageModel.findAllAssessments(req.query);
    return res.json(buildResponse(true, 'Data Asesmen berhasil diambil', data));
  } catch (error) {
    return next(error);
  }
};

const previewTriage = async (req, res, next) => {
  try {
    const { value, error } = assessmentSchema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(422).json(buildResponse(false, error.details[0].message, error.details));
    }

    const { items, ...assessmentData } = value;

    // Auto determine triage level and priority
    const determined = await determineTriage(assessmentData, items);

    return res.json(buildResponse(true, 'Pratinjau triase berhasil dihitung', {
      triage_level: determined.triage_level,
      triage_priority: determined.triage_priority
    }));
  } catch (error) {
    return next(error);
  }
};

export default {
  listCaseTypes,
  createCaseType,
  updateCaseType,
  deleteCaseType,
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  listRules,
  createRule,
  updateRule,
  deleteRule,
  createAssessment,
  getAssessment,
  listAssessments,
  previewTriage
};
