const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const scholarshipController = require('../controllers/scholarshipController');

const {
  getScholarships,
  getApplications,
  updateApplicationStatus,
  getScholarshipStats
} = scholarshipController;

// All scholarship routes are protected by institutional authentication
router.use(authMiddleware);

// Scholarship management endpoints
router.get('/', getScholarships);
router.get('/applications', authMiddleware.requireRoles(['admin', 'director', 'chairman']), getApplications);
router.patch('/status', authMiddleware.requireRoles(['admin', 'director', 'chairman']), updateApplicationStatus);
router.get('/stats', authMiddleware.requireRoles(['admin', 'director', 'chairman']), getScholarshipStats);

module.exports = router;
