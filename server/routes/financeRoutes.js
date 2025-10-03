const express = require('express');
const router = express.Router();
const {
  createFinance,
  getAllFinance,
  getMonthlySummary,
  deleteFinance
} = require('../controllers/financeController');

// Routes
router.post('/', createFinance);
router.get('/', getAllFinance);
router.get('/summary', getMonthlySummary);
router.delete('/:id', deleteFinance);

module.exports = router;

