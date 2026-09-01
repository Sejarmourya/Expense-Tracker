const express = require("express");
const Expense = require("../models/Expense");
const Budget = require("../models/Budget");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// =========================
// GET BUDGET
// =========================
router.get("/", authMiddleware, async (req, res) => {
  try {
    const month = req.query.month;

    if (!month) {
      return res.status(400).json({
        success: false,
        message: "Month is required",
      });
    }

    const budgetData = await Budget.findOne({
      userId: req.userId,
      month,
    });

    const expenses = await Expense.find({
      userId: req.userId,
    });

    const monthlyExpenses = expenses.filter((expense) => {
      const expenseDate = expense.date || expense.createdAt;

      if (!expenseDate) return false;

      const expenseMonth = new Date(expenseDate)
        .toISOString()
        .slice(0, 7);

      return expenseMonth === month;
    });

    const totalSpent = monthlyExpenses.reduce(
      (total, expense) =>
        total + Number(expense.amount || 0),
      0
    );

    const budget = budgetData
      ? Number(budgetData.amount)
      : 0;

    const remaining = budget - totalSpent;

    const percentage =
      budget > 0 ? (totalSpent / budget) * 100 : 0;

    res.json({
      success: true,
      budget,
      totalSpent,
      remaining,
      percentage,
      isOverBudget: budget > 0 && totalSpent > budget,
    });
  } catch (error) {
    console.error("GET BUDGET ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =========================
// CREATE / UPDATE BUDGET
// =========================
router.put("/", authMiddleware, async (req, res) => {
  try {
    const { month, amount } = req.body;

    console.log("Budget request:", {
      userId: req.userId,
      month,
      amount,
    });

    if (!month) {
      return res.status(400).json({
        success: false,
        message: "Month is required",
      });
    }

    if (amount === undefined || amount === null) {
      return res.status(400).json({
        success: false,
        message: "Budget amount is required",
      });
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid budget amount",
      });
    }

    const budget = await Budget.findOneAndUpdate(
      {
        userId: req.userId,
        month,
      },
      {
        userId: req.userId,
        month,
        amount: numericAmount,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    console.log("Budget saved:", budget);

    res.json({
      success: true,
      message: "Budget saved successfully",
      budget: budget.amount,
      data: budget,
    });
  } catch (error) {
    console.error("SAVE BUDGET ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;