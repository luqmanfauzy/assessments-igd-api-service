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
 * components:
 *   schemas:
 *     CaseType:
 *       type: object
 *       properties:
 *         code: { type: string }
 *         case_name: { type: string }
 *         description: { type: string }
 *         is_active: { type: boolean }
 *     Category:
 *       type: object
 *       properties:
 *         code: { type: string }
 *         category_name: { type: string }
 *         sort_order: { type: integer }
 *     Rule:
 *       type: object
 *       properties:
 *         category_id: { type: integer }
 *         scale: { type: integer }
 *         rule_name: { type: string }
 *         description: { type: string }
 *         triage_level:
 *           type: string
 *           enum: [RED, ORANGE, YELLOW, GREEN, BLUE, WHITE, BLACK]
 *         priority:
 *           type: string
 *           enum: [IMMEDIATE, EMERGENCY, URGENT, SEMI_URGENT, NON_URGENT]
 *         is_active: { type: boolean }
 *     TriageAssessment:
 *       type: object
 *       required:
 *         - medical_record_number
 *         - patient_name
 *         - visit_date
 *         - arrival_method
 *         - transportation
 *         - arrival_reason
 *         - chief_complaint
 *       properties:
 *         visit_number: { type: string }
 *         medical_record_number: { type: string }
 *         patient_name: { type: string }
 *         visit_date: { type: string, format: date-time }
 *         arrival_method: { type: string, enum: [WALK_IN, STRETCHER, WHEELCHAIR, CARRIED] }
 *         transportation: { type: string, enum: [AMBULANCE, SELF, PRIVATE, NONE] }
 *         arrival_reason: { type: string, enum: [SELF_ARRIVAL, POLICE, REFERRAL, NONE] }
 *         notes: { type: string }
 *         case_type_id: { type: integer }
 *         chief_complaint: { type: string }
 *         temperature: { type: number, format: float }
 *         pain_scale: { type: integer, minimum: 0, maximum: 10 }
 *         systolic_blood_pressure: { type: integer }
 *         diastolic_blood_pressure: { type: integer }
 *         heart_rate: { type: integer }
 *         oxygen_saturation: { type: number, format: float }
 *         respiratory_rate: { type: integer }
 *         consciousness_level: { type: string, enum: [COMPOS_MENTIS, APATHY, SOMNOLENCE, DELIRIUM, STUPOR, COMA] }
 *         airway_status: { type: string, enum: [CLEAR, PARTIAL_OBSTRUCTION, TOTAL_OBSTRUCTION] }
 *         gcs_e: { type: integer, minimum: 1, maximum: 4 }
 *         gcs_v: { type: integer, minimum: 1, maximum: 5 }
 *         gcs_m: { type: integer, minimum: 1, maximum: 6 }
 *         doa: { type: boolean }
 *         triage_level: { type: string, enum: [RED, ORANGE, YELLOW, GREEN, BLUE, WHITE, BLACK] }
 *         triage_priority: { type: string, enum: [IMMEDIATE, EMERGENCY, URGENT, SEMI_URGENT, NON_URGENT] }
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               rule_id: { type: integer }
 *               notes: { type: string }
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
 *   post:
 *     summary: Create a new case type
 *     tags: [Triage]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CaseType'
 *     responses:
 *       201:
 *         description: Case type created
 */
router.get('/case-types', TriageController.listCaseTypes);
router.post('/case-types', TriageController.createCaseType);
router.put('/case-types/:id', TriageController.updateCaseType);
router.delete('/case-types/:id', TriageController.deleteCaseType);

/**
 * @swagger
 * /api/triage/categories:
 *   get:
 *     summary: List all master triage categories with rules
 *     tags: [Triage]
 *     responses:
 *       200:
 *         description: List of categories and rules
 *   post:
 *     summary: Create a new triage category
 *     tags: [Triage]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       201:
 *         description: Category created
 */
router.get('/categories', TriageController.listCategories);
router.post('/categories', TriageController.createCategory);
router.put('/categories/:id', TriageController.updateCategory);
router.delete('/categories/:id', TriageController.deleteCategory);

/**
 * @swagger
 * /api/triage/rules:
 *   get:
 *     summary: List all master triage rules
 *     tags: [Triage]
 *     responses:
 *       200:
 *         description: List of rules
 *   post:
 *     summary: Create a new triage rule
 *     tags: [Triage]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Rule'
 *     responses:
 *       201:
 *         description: Rule created
 */
router.get('/rules', TriageController.listRules);
router.post('/rules', TriageController.createRule);
router.put('/rules/:id', TriageController.updateRule);
router.delete('/rules/:id', TriageController.deleteRule);

/**
 * @swagger
 * /api/triage/assessments:
 *   get:
 *     summary: List all triage assessments
 *     tags: [Triage]
 *     parameters:
 *       - in: query
 *         name: visit_number
 *         schema:
 *           type: string
 *       - in: query
 *         name: medical_record_number
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of assessments
 *   post:
 *     summary: Create a new triage assessment
 *     tags: [Triage]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TriageAssessment'
 *     responses:
 *       201:
 *         description: Assessment created
 */
router.get('/assessments', TriageController.listAssessments);
router.post('/assessments', TriageController.createAssessment);

/**
 * @swagger
 * /api/triage/preview:
 *   post:
 *     summary: Preview triage level and priority without saving
 *     tags: [Triage]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TriageAssessment'
 *     responses:
 *       200:
 *         description: Triage preview calculated
 */
router.post('/preview', TriageController.previewTriage);

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
