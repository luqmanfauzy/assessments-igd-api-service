import express from 'express';
import AppController from '../controllers/App.controller.js';
import DashboardRoutes from './Dashboard.routes.js';
import TriageRoutes from './Triage.routes.js';
import { serviceAuth } from '../middleware/init.js';

const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check API health
 *     responses:
 *       200:
 *         description: API is running
 */
router.get('/', AppController.home);
router.get('/about', AppController.about);
router.get('/contact', AppController.contact);
router.get('/health', AppController.health);
router.use('/api/dashboard', serviceAuth, DashboardRoutes);
router.use('/api/triage', serviceAuth, TriageRoutes);

export default router;
