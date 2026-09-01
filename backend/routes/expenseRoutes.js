const express = require("express");

const Expense = require("../models/Expense");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// =========================
// GET ALL EXPENSES
// =========================

router.get("/", authMiddleware, async (req, res) => {
  try {
    const expenses = await Expense.find({
      userId: req.userId,
    }).sort({ date: -1 });

    res.json({
      success: true,
      expenses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =========================
// ADD EXPENSE
// =========================

router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      title,
      amount,
      category,
      date,
    } = req.body;

    if (!title || !amount || !category) {
      return res.status(400).json({
        success: false,
        message: "Please fill all expense fields",
      });
    }

    const expense = await Expense.create({
      title,
      amount,
      category,
      date: date || new Date(),
      userId: req.userId,
    });

    res.status(201).json({
      success: true,
      message: "Expense added successfully",
      expense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =========================
// UPDATE EXPENSE
// =========================

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const {
      title,
      amount,
      category,
      date,
    } = req.body;

    const expense = await Expense.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId,
      },
      {
        title,
        amount,
        category,
        date,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    res.json({
      success: true,
      message: "Expense updated successfully",
      expense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =========================
// DELETE EXPENSE
// =========================

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    res.json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;