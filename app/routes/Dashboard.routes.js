import express from 'express';

const router = express.Router();

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Dashboard stats (placeholder)
 *     responses:
 *       200:
 *         description: Stats retrieved
 */
router.get('/stats', (req, res) => res.json({ success: true, message: 'Dashboard stats' }));

export default router;
