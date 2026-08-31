const express = require("express");
const Expense = require("../models/Expense");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET all expenses of logged-in user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const expenses = await Expense.find({
      userId: req.userId,
    }).sort({ createdAt: -1 });

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

// ADD expense
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, amount, category } = req.body;

    const expense = await Expense.create({
      title,
      amount,
      category,
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

// UPDATE expense
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { title, amount, category } = req.body;

    const expense = await Expense.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId,
      },
      {
        title,
        amount,
        category,
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

// DELETE expense
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