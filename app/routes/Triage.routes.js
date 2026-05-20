import express from 'express';
import TriageController from '../controllers/Triage.controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Triage
 *   description: Triage assessment management
 */

/**
 * @swagger
 * /api/triage/case-types:
 *   get:
 *     summary: List all active master case types
 *     tags: [Triage]
 *     responses:
 *       200:
 *         description: List of case types
 */
router.get('/case-types', TriageController.listCaseTypes);

/**
 * @swagger
 * /api/triage/categories:
 *   get:
 *     summary: List all master triage categories with rules
 *     tags: [Triage]
 *     responses:
 *       200:
 *         description: List of categories and rules
 */
router.get('/categories', TriageController.listCategories);

/**
 * @swagger
 * /api/triage/assessments:
 *   get:
 *     summary: List all triage assessments
 *     tags: [Triage]
 *     parameters:
 *       - in: query
 *         name: no_rawat
 *         schema:
 *           type: string
 *       - in: query
 *         name: no_rm
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of assessments
 */
router.get('/assessments', TriageController.listAssessments);

/**
 * @swagger
 * /api/triage/assessments:
 *   post:
 *     summary: Create a new triage assessment
 *     tags: [Triage]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - no_rawat
 *               - no_rm
 *               - nama_pasien
 *               - tanggal_kunjungan
 *               - cara_masuk
 *               - transportasi
 *               - alasan_kedatangan
 *               - keluhan_utama
 *             properties:
 *               no_rawat: { type: string }
 *               no_rm: { type: string }
 *               nama_pasien: { type: string }
 *               tanggal_kunjungan: { type: string, format: date-time }
 *               cara_masuk: { type: string, enum: [JALAN, BRANKAR, KURSI_RODA, DIGENDONG] }
 *               transportasi: { type: string, enum: [AGD, SENDIRI, SWASTA, TIDAK_ADA] }
 *               alasan_kedatangan: { type: string, enum: [DATANG_SENDIRI, POLISI, RUJUKAN, BIDAN, PUSKESMAS, RUMAH_SAKIT, POLIKLINIK, FASKES_LAIN, TIDAK_ADA] }
 *               keluhan_utama: { type: string }
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     rule_id: { type: integer }
 *                     catatan: { type: string }
 *     responses:
 *       201:
 *         description: Assessment created
 */
router.post('/assessments', TriageController.createAssessment);

/**
 * @swagger
 * /api/triage/assessments/{id}:
 *   get:
 *     summary: Get triage assessment details
 *     tags: [Triage]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Assessment details
 *       404:
 *         description: Assessment not found
 */
router.get('/assessments/:id', TriageController.getAssessment);

export default router;
