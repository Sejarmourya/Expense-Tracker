const express = require("express");
const Expense = require("../models/Expense");

const router = express.Router();

// POST - Create Expense
router.post("/", async (req, res) => {
  try {
    const expense = await Expense.create(req.body);

    res.status(201).json({
      success: true,
      expense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// GET - Get All Expenses
router.get("/", async (req, res) => {
  try {
    const expenses = await Expense.find();

    res.json({
      success: true,
      expenses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// DELETE - Delete Expense
router.delete("/:id", async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found"
      });
    }

    res.json({
      success: true,
      message: "Expense deleted successfully",
      expense
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;