import Joi from 'joi';
import TriageModel from '../models/Triage.model.js';
import { buildResponse } from '../helpers/App.helper.js';
import { determineTriage } from '../helpers/Triage.helper.js';

const assessmentSchema = Joi.object({
  no_rawat: Joi.string().allow('', null),
  no_rm: Joi.string().required(),
  nama_pasien: Joi.string().required(),
  tanggal_kunjungan: Joi.date().required(),
  cara_masuk: Joi.string().valid('JALAN', 'BRANKAR', 'KURSI_RODA', 'DIGENDONG').required(),
  transportasi: Joi.string().valid('AGD', 'SENDIRI', 'SWASTA', 'TIDAK_ADA').required(),
  alasan_kedatangan: Joi.string().valid('DATANG_SENDIRI', 'POLISI', 'RUJUKAN', 'BIDAN', 'PUSKESMAS', 'RUMAH_SAKIT', 'POLIKLINIK', 'FASKES_LAIN', 'TIDAK_ADA').required(),
  keterangan: Joi.string().allow('', null),
  macam_kasus_id: Joi.number().allow(null),
  keluhan_utama: Joi.string().required(),
  suhu: Joi.number().precision(1).allow(null),
  skala_nyeri: Joi.number().integer().min(0).max(10).allow(null),
  tekanan_darah_sistolik: Joi.number().integer().allow(null),
  tekanan_darah_diastolik: Joi.number().integer().allow(null),
  nadi_per_menit: Joi.number().integer().allow(null),
  saturasi_oksigen: Joi.number().precision(2).allow(null),
  respirasi_per_menit: Joi.number().integer().allow(null),
  tingkat_kesadaran: Joi.string().valid('COMPOS_MENTIS', 'APATIS', 'SOMNOLEN', 'SOPOR', 'KOMA').allow(null),
  status_jalan_nafas: Joi.string().valid('BEBAS', 'OBSTRUKSI_PARSIAL', 'OBSTRUKSI_TOTAL').allow(null),
  gcs_e: Joi.number().integer().min(1).max(4).allow(null),
  gcs_v: Joi.number().integer().min(1).max(5).allow(null),
  gcs_m: Joi.number().integer().min(1).max(6).allow(null),
  doa: Joi.boolean().default(false),
  level_triase: Joi.string().valid('MERAH', 'OREN', 'KUNING', 'HIJAU', 'BIRU', 'PUTIH', 'HITAM').allow('', null),
  prioritas_triase: Joi.string().valid('SEGERA', 'DARURAT', 'URGENT', 'SEMI_URGENT', 'NON_URGENT').allow('', null),
  perawat_triase_id: Joi.number().allow(null),
  items: Joi.array().items(Joi.object({
    rule_id: Joi.number().required(),
    catatan: Joi.string().allow('', null)
  })).default([])
});

const listCaseTypes = async (req, res, next) => {
  try {
    const data = await TriageModel.findAllCaseTypes();
    return res.json(buildResponse(true, 'Master Case Types retrieved', data));
  } catch (error) {
    return next(error);
  }
};

const listCategories = async (req, res, next) => {
  try {
    const data = await TriageModel.findAllCategories();
    return res.json(buildResponse(true, 'Master Triage Categories retrieved', data));
  } catch (error) {
    return next(error);
  }
};

const createAssessment = async (req, res, next) => {
  try {
    const { value, error } = assessmentSchema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(422).json(buildResponse(false, 'Validation failed', error.details));
    }

    const { items, ...assessmentData } = value;

    // Auto count total_gcs
    if (assessmentData.gcs_e || assessmentData.gcs_v || assessmentData.gcs_m) {
      assessmentData.total_gcs = (assessmentData.gcs_e || 0) + (assessmentData.gcs_v || 0) + (assessmentData.gcs_m || 0);
    }

    if (!assessmentData.no_rawat || assessmentData.no_rawat.trim() === '') {
      // Generate a unique no_rawat if not provided
      const now = new Date();
      const datePart = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
      const timePart = now.getTime(); // Milliseconds since epoch for uniqueness
      assessmentData.no_rawat = `RAWAT-${datePart}-${timePart}`;
    }

    // Auto determine/validate triage level and priority
    const determined = await determineTriage(assessmentData, items);

    const LEVEL_WEIGHTS = {
      HITAM: 6,
      MERAH: 5,
      OREN: 4,
      KUNING: 3,
      HIJAU: 2,
      BIRU: 1,
      PUTIH: 1
    };

    if (!assessmentData.level_triase || assessmentData.level_triase.trim() === '') {
      assessmentData.level_triase = determined.level_triase;
      assessmentData.prioritas_triase = determined.prioritas_triase;
    } else {
      const providedWeight = LEVEL_WEIGHTS[assessmentData.level_triase] || 0;
      const determinedWeight = LEVEL_WEIGHTS[determined.level_triase] || 0;
      if (determinedWeight > providedWeight) {
        assessmentData.level_triase = determined.level_triase;
        assessmentData.prioritas_triase = determined.prioritas_triase;
      }
    }

    const data = await TriageModel.createAssessment(assessmentData, items);

    return res.status(201).json(buildResponse(true, 'Triage assessment created', data));
  } catch (error) {
    return next(error);
  }
};

const getAssessment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await TriageModel.findAssessmentById(id);

    if (!data) {
      return res.status(404).json(buildResponse(false, 'Assessment not found'));
    }

    return res.json(buildResponse(true, 'Assessment retrieved', data));
  } catch (error) {
    return next(error);
  }
};

const listAssessments = async (req, res, next) => {
  try {
    const data = await TriageModel.findAllAssessments(req.query);
    return res.json(buildResponse(true, 'Assessments retrieved', data));
  } catch (error) {
    return next(error);
  }
};

const previewTriage = async (req, res, next) => {
  try {
    const { value, error } = assessmentSchema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(422).json(buildResponse(false, 'Validation failed', error.details));
    }

    const { items, ...assessmentData } = value;

    // Auto determine triage level and priority
    const determined = await determineTriage(assessmentData, items);

    return res.json(buildResponse(true, 'Triage preview calculated', {
      level_triase: determined.level_triase,
      prioritas_triase: determined.prioritas_triase
    }));
  } catch (error) {
    return next(error);
  }
};

export default {
  listCaseTypes,
  listCategories,
  createAssessment,
  getAssessment,
  listAssessments,
  previewTriage
};
