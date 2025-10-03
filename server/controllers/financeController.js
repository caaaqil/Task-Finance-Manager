const Finance = require('../models/Finance');

// Create a new finance entry
const createFinance = async (req, res) => {
  try {
    const finance = new Finance(req.body);
    await finance.save();
    res.status(201).json(finance);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all finance entries
const getAllFinance = async (req, res) => {
  try {
    const finance = await Finance.find().sort({ date: -1 });
    res.json(finance);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get monthly summary
const getMonthlySummary = async (req, res) => {
  try {
    const { year, month } = req.query;
    const startDate = new Date(year || new Date().getFullYear(), (month || new Date().getMonth()) - 1, 1);
    const endDate = new Date(year || new Date().getFullYear(), month || new Date().getMonth(), 0, 23, 59, 59);

    const entries = await Finance.find({
      date: { $gte: startDate, $lte: endDate }
    });

    const summary = {
      totalIncome: 0,
      totalExpense: 0,
      balance: 0,
      entries: entries
    };

    entries.forEach(entry => {
      if (entry.type === 'income') {
        summary.totalIncome += entry.amount;
      } else {
        summary.totalExpense += entry.amount;
      }
    });

    summary.balance = summary.totalIncome - summary.totalExpense;

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a finance entry
const deleteFinance = async (req, res) => {
  try {
    const finance = await Finance.findByIdAndDelete(req.params.id);
    if (!finance) {
      return res.status(404).json({ error: 'Finance entry not found' });
    }
    res.json({ message: 'Finance entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createFinance,
  getAllFinance,
  getMonthlySummary,
  deleteFinance
};

