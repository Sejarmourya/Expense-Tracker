const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const expenseRoutes = require("./routes/expenseRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/expenses", expenseRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected ✅");

    app.listen(5000, () => {
      console.log("Server running on port 5000 🚀");
    });
  })
  .catch((error) => {
    console.log("MongoDB Connection Failed ❌");
    console.log(error.message);
  });