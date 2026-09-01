import { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import "./App.css";

const API = "http://localhost:5000/api";

const CHART_COLORS = [
  "#2563eb",
  "#16a34a",
  "#f59e0b",
  "#dc2626",
  "#9333ea",
  "#0891b2",
  "#db2777",
  "#65a30d",
  "#ea580c",
  "#4f46e5",
];

function App() {
  // =========================
  // USER
  // =========================

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isSignup, setIsSignup] = useState(false);

  // =========================
  // DARK MODE
  // =========================

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  // =========================
  // AUTH
  // =========================

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [authMessage, setAuthMessage] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // =========================
  // EXPENSE
  // =========================

  const [expenses, setExpenses] = useState([]);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  const [date, setDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [editingId, setEditingId] = useState(null);

  // =========================
  // SEARCH / FILTER
  // =========================

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  // =========================
  // LOADING
  // =========================

  const [expensesLoading, setExpensesLoading] = useState(false);
  const [expenseSaving, setExpenseSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");

  // =========================
  // BUDGET
  // =========================

  const [budget, setBudget] = useState({
    budget: 0,
    totalSpent: 0,
    remaining: 0,
    percentage: 0,
    isOverBudget: false,
  });

  const [budgetLoading, setBudgetLoading] = useState(false);
  const [budgetSaving, setBudgetSaving] = useState(false);
  const [budgetInput, setBudgetInput] = useState("");

  const [budgetError, setBudgetError] = useState("");

  // =========================
  // DARK MODE SAVE
  // =========================

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  // =========================
  // API CONFIG
  // =========================

  const getConfig = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setExpenses([]);

    setBudget({
      budget: 0,
      totalSpent: 0,
      remaining: 0,
      percentage: 0,
      isOverBudget: false,
    });
  };

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async (e) => {
    e.preventDefault();

    setAuthMessage("");

    if (!email || !password) {
      setAuthMessage("Please enter email and password.");
      return;
    }

    setAuthLoading(true);

    try {
      const response = await axios.post(
        `${API}/auth/login`,
        {
          email: email.trim(),
          password,
        }
      );

      localStorage.setItem(
        "token",
        response.data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      setUser(response.data.user);

      setEmail("");
      setPassword("");
    } catch (error) {
      setAuthMessage(
        error.response?.data?.message ||
          "Login failed."
      );
    } finally {
      setAuthLoading(false);
    }
  };

  // =========================
  // SIGNUP
  // =========================

  const handleSignup = async (e) => {
    e.preventDefault();

    setAuthMessage("");

    if (!name.trim() || !email.trim() || !password) {
      setAuthMessage("Please fill all fields.");
      return;
    }

    if (password.length < 6) {
      setAuthMessage(
        "Password must be at least 6 characters."
      );
      return;
    }

    setAuthLoading(true);

    try {
      await axios.post(
        `${API}/auth/signup`,
        {
          name: name.trim(),
          email: email.trim(),
          password,
        }
      );

      setAuthMessage(
        "Signup successful ✅ Please login."
      );

      setName("");
      setEmail("");
      setPassword("");
      setIsSignup(false);
    } catch (error) {
      setAuthMessage(
        error.response?.data?.message ||
          "Signup failed."
      );
    } finally {
      setAuthLoading(false);
    }
  };

  // =========================
  // GET EXPENSES
  // =========================

  const getExpenses = async () => {
    setExpensesLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `${API}/expenses`,
        getConfig()
      );

      setExpenses(response.data.expenses || []);
    } catch (error) {
      console.log(error);

      if (error.response?.status === 401) {
        handleLogout();
        return;
      }

      setError(
        error.response?.data?.message ||
          "Unable to load expenses."
      );
    } finally {
      setExpensesLoading(false);
    }
  };

  // =========================
  // GET BUDGET
  // =========================

  const getBudget = async () => {
    setBudgetLoading(true);
    setBudgetError("");

    try {
      const response = await axios.get(
        `${API}/budget?month=${selectedMonth}`,
        getConfig()
      );

      const data = response.data;

      setBudget({
        budget: Number(data.budget || 0),
        totalSpent: Number(data.totalSpent || 0),
        remaining: Number(data.remaining || 0),
        percentage: Number(data.percentage || 0),
        isOverBudget: Boolean(data.isOverBudget),
      });

      setBudgetInput(
        data.budget
          ? String(data.budget)
          : ""
      );
    } catch (error) {
      console.log(error);

      if (error.response?.status === 401) {
        handleLogout();
        return;
      }

      setBudgetError(
        error.response?.data?.message ||
          "Unable to load budget."
      );
    } finally {
      setBudgetLoading(false);
    }
  };

  // =========================
  // LOAD DATA
  // =========================

  useEffect(() => {
    if (user) {
      getExpenses();
      getBudget();
    }
  }, [user, selectedMonth]);

  // =========================
  // ADD / UPDATE EXPENSE
  // =========================

  const handleSubmitExpense = async (e) => {
    e.preventDefault();

    setError("");

    const cleanTitle = title.trim();
    const cleanCategory = category.trim();
    const numericAmount = Number(amount);

    if (
      !cleanTitle ||
      !cleanCategory ||
      !amount ||
      !date
    ) {
      setError("Please fill all expense fields.");
      return;
    }

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      setError("Please enter a valid amount.");
      return;
    }

    setExpenseSaving(true);

    try {
      const expenseData = {
        title: cleanTitle,
        amount: numericAmount,
        category: cleanCategory,
        date,
      };

      if (editingId) {
        await axios.put(
          `${API}/expenses/${editingId}`,
          expenseData,
          getConfig()
        );
      } else {
        await axios.post(
          `${API}/expenses`,
          expenseData,
          getConfig()
        );
      }

      clearForm();

      await getExpenses();
      await getBudget();
    } catch (error) {
      console.log(error);

      if (error.response?.status === 401) {
        handleLogout();
        return;
      }

      setError(
        error.response?.data?.message ||
          "Unable to save expense."
      );
    } finally {
      setExpenseSaving(false);
    }
  };

  // =========================
  // CLEAR FORM
  // =========================

  const clearForm = () => {
    setTitle("");
    setAmount("");
    setCategory("");

    setDate(
      new Date().toISOString().split("T")[0]
    );

    setEditingId(null);
  };

  // =========================
  // EDIT
  // =========================

  const handleEdit = (expense) => {
    setError("");

    setEditingId(expense._id);

    setTitle(expense.title);
    setAmount(expense.amount);
    setCategory(expense.category);

    const expenseDate = expense.date
      ? new Date(expense.date)
          .toISOString()
          .split("T")[0]
      : new Date(expense.createdAt)
          .toISOString()
          .split("T")[0];

    setDate(expenseDate);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this expense?"
    );

    if (!confirmDelete) return;

    setDeletingId(id);
    setError("");

    try {
      await axios.delete(
        `${API}/expenses/${id}`,
        getConfig()
      );

      if (editingId === id) {
        clearForm();
      }

      await getExpenses();
      await getBudget();
    } catch (error) {
      console.log(error);

      if (error.response?.status === 401) {
        handleLogout();
        return;
      }

      setError(
        error.response?.data?.message ||
          "Unable to delete expense."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =========================
  // SAVE BUDGET
  // =========================

  const handleBudgetSave = async (e) => {
    e.preventDefault();

    setBudgetError("");

    const numericBudget = Number(budgetInput);

    if (
      !Number.isFinite(numericBudget) ||
      numericBudget < 0
    ) {
      setBudgetError(
        "Please enter a valid budget amount."
      );
      return;
    }

    setBudgetSaving(true);

    try {
      await axios.put(
        `${API}/budget`,
        {
          month: selectedMonth,
          amount: numericBudget,
        },
        getConfig()
      );

      await getBudget();
    } catch (error) {
      console.log(error);

      if (error.response?.status === 401) {
        handleLogout();
        return;
      }

      setBudgetError(
        error.response?.data?.message ||
          "Unable to save budget."
      );
    } finally {
      setBudgetSaving(false);
    }
  };

  // =========================
  // CATEGORIES
  // =========================

  const categories = [
    "All",
    ...new Set(
      expenses.map(
        (expense) => expense.category
      )
    ),
  ];

  // =========================
  // AVAILABLE MONTHS
  // =========================

  const availableMonths = [
    ...new Set(
      expenses
        .map((expense) => {
          const expenseDate =
            expense.date || expense.createdAt;

          if (!expenseDate) return null;

          return new Date(expenseDate)
            .toISOString()
            .slice(0, 7);
        })
        .filter(Boolean)
    ),
  ].sort((a, b) =>
    b.localeCompare(a)
  );

  // =========================
  // FILTERED EXPENSES
  // =========================

  const filteredExpenses = expenses.filter(
    (expense) => {
      const expenseDate =
        expense.date || expense.createdAt;

      const expenseMonth = new Date(expenseDate)
        .toISOString()
        .slice(0, 7);

      const matchesSearch =
        expense.title
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        filterCategory === "All" ||
        expense.category ===
          filterCategory;

      const matchesMonth =
        expenseMonth === selectedMonth;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesMonth
      );
    }
  );

  // =========================
  // MONTHLY EXPENSES
  // =========================

  const monthlyExpenses = expenses.filter(
    (expense) => {
      const expenseDate =
        expense.date || expense.createdAt;

      const expenseMonth = new Date(expenseDate)
        .toISOString()
        .slice(0, 7);

      return expenseMonth === selectedMonth;
    }
  );

  // =========================
  // TOTAL EXPENSE
  // =========================

  const totalExpenses = expenses.reduce(
    (total, expense) =>
      total + Number(expense.amount),
    0
  );

  // =========================
  // HIGHEST EXPENSE
  // =========================

  const highestExpense =
    expenses.length > 0
      ? Math.max(
          ...expenses.map((expense) =>
            Number(expense.amount)
          )
        )
      : 0;

  // =========================
  // CATEGORY PIE DATA
  // =========================

  const categoryData = Object.values(
    monthlyExpenses.reduce(
      (result, expense) => {
        const categoryName =
          expense.category;

        if (!result[categoryName]) {
          result[categoryName] = {
            name: categoryName,
            value: 0,
          };
        }

        result[categoryName].value +=
          Number(expense.amount);

        return result;
      },
      {}
    )
  );

  // =========================
  // MONTHLY BAR DATA
  // =========================

  const monthsForChart =
    availableMonths.length > 0
      ? availableMonths
      : [selectedMonth];

  const monthlyChartData = monthsForChart
    .slice()
    .reverse()
    .map((month) => {
      const monthExpenses =
        expenses.filter((expense) => {
          const expenseDate =
            expense.date ||
            expense.createdAt;

          const expenseMonth =
            new Date(expenseDate)
              .toISOString()
              .slice(0, 7);

          return expenseMonth === month;
        });

      const total =
        monthExpenses.reduce(
          (sum, expense) =>
            sum + Number(expense.amount),
          0
        );

      const monthName = new Date(
        `${month}-01`
      ).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      });

      return {
        month: monthName,
        total,
      };
    });

  // =========================
  // MONTH NAME
  // =========================

  const selectedMonthName = new Date(
    `${selectedMonth}-01`
  ).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  // =========================
  // AUTH PAGE
  // =========================

  if (!user) {
    return (
      <div
        className={`auth-container ${
          darkMode ? "dark-mode" : ""
        }`}
      >
        <div className="auth-box">
          <div className="auth-top">
            <h1>Expense Tracker</h1>

            <button
              className="theme-toggle"
              onClick={() =>
                setDarkMode(!darkMode)
              }
              type="button"
            >
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>

          <h2>
            {isSignup
              ? "Create Account"
              : "Welcome Back"}
          </h2>

          {isSignup ? (
            <form onSubmit={handleSignup}>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                disabled={authLoading}
              />

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                disabled={authLoading}
              />

              <input
                type="password"
                placeholder="Password (min 6 characters)"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                disabled={authLoading}
              />

              <button
                type="submit"
                disabled={authLoading}
              >
                {authLoading
                  ? "Creating..."
                  : "Create Account"}
              </button>

              {authMessage && (
                <p className="message">
                  {authMessage}
                </p>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsSignup(false);
                  setAuthMessage("");
                }}
              >
                Already have an account? Login
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                disabled={authLoading}
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                disabled={authLoading}
              />

              <button
                type="submit"
                disabled={authLoading}
              >
                {authLoading
                  ? "Logging in..."
                  : "Login"}
              </button>

              {authMessage && (
                <p className="message">
                  {authMessage}
                </p>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsSignup(true);
                  setAuthMessage("");
                }}
              >
                Create new account
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // =========================
  // DASHBOARD
  // =========================

  return (
    <div
      className={`app-container ${
        darkMode ? "dark-mode" : ""
      }`}
    >
      {/* HEADER */}

      <header>
        <div>
          <h1>Expense Tracker</h1>

          <p>
            Welcome, {user.name} 👋
          </p>
        </div>

        <div className="header-actions">
          <button
            className="theme-toggle"
            onClick={() =>
              setDarkMode(!darkMode)
            }
            type="button"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>

          <button
            className="logout-button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      {/* ERROR */}

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {/* SUMMARY */}

      <section className="summary-container">
        <div className="summary-card">
          <h3>Total Expenses</h3>

          <h2>
            ₹{totalExpenses.toLocaleString("en-IN")}
          </h2>

          <p>All time</p>
        </div>

        <div className="summary-card">
          <h3>This Month</h3>

          <h2>
            ₹
            {Number(
              budget.totalSpent || 0
            ).toLocaleString("en-IN")}
          </h2>

          <p>{selectedMonthName}</p>
        </div>

        <div className="summary-card">
          <h3>Highest Expense</h3>

          <h2>
            ₹{highestExpense.toLocaleString("en-IN")}
          </h2>

          <p>All time</p>
        </div>
      </section>

      {/* =========================
          MONTHLY BUDGET
      ========================= */}

      <section className="budget-container">
        <div className="section-heading">
          <div>
            <h2>Monthly Budget 💰</h2>

            <p>
              Set your spending limit for{" "}
              <strong>
                {selectedMonthName}
              </strong>
            </p>
          </div>

          <span className="budget-month">
            {selectedMonthName}
          </span>
        </div>

        {budgetLoading ? (
          <div className="loading">
            Loading budget...
          </div>
        ) : (
          <>
            <form
              className="budget-form"
              onSubmit={handleBudgetSave}
            >
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Enter monthly budget"
                value={budgetInput}
                onChange={(e) =>
                  setBudgetInput(
                    e.target.value
                  )
                }
                disabled={budgetSaving}
              />

              <button
                type="submit"
                disabled={budgetSaving}
              >
                {budgetSaving
                  ? "Saving..."
                  : budget.budget > 0
                  ? "Update Budget"
                  : "Set Budget"}
              </button>
            </form>

            {budgetError && (
              <p className="budget-error">
                ⚠️ {budgetError}
              </p>
            )}

            <div className="budget-stats">
              <div>
                <span>Budget</span>

                <strong>
                  ₹
                  {Number(
                    budget.budget || 0
                  ).toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>

              <div>
                <span>Spent</span>

                <strong>
                  ₹
                  {Number(
                    budget.totalSpent || 0
                  ).toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>

              <div>
                <span>
                  {budget.remaining >= 0
                    ? "Remaining"
                    : "Over Budget"}
                </span>

                <strong>
                  ₹
                  {Math.abs(
                    Number(
                      budget.remaining || 0
                    )
                  ).toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>
            </div>

            {Number(budget.budget) > 0 && (
              <div className="budget-progress-wrapper">
                <div className="budget-progress-top">
                  <span>
                    Budget Usage
                  </span>

                  <strong>
                    {Math.round(
                      Number(
                        budget.percentage ||
                          0
                      )
                    )}
                    %
                  </strong>
                </div>

                <div className="budget-progress">
                  <div
                    className={`budget-progress-bar ${
                      budget.isOverBudget
                        ? "over-budget"
                        : ""
                    }`}
                    style={{
                      width: `${Math.min(
                        Number(
                          budget.percentage ||
                            0
                        ),
                        100
                      )}%`,
                    }}
                  />
                </div>

                {budget.isOverBudget ? (
                  <p className="budget-warning">
                    ⚠️ You have exceeded your
                    monthly budget!
                  </p>
                ) : Number(
                    budget.percentage
                  ) >= 80 ? (
                  <p className="budget-warning">
                    ⚠️ You have used more than
                    80% of your budget.
                  </p>
                ) : (
                  <p className="budget-success">
                    ✅ You are within your
                    monthly budget.
                  </p>
                )}
              </div>
            )}

            {Number(budget.budget) === 0 && (
              <div className="budget-empty">
                <p>
                  💡 Set a monthly budget to
                  track your spending progress.
                </p>
              </div>
            )}
          </>
        )}
      </section>

      {/* =========================
          MONTH SELECTOR
      ========================= */}

      <section className="analytics-container">
        <div className="section-heading">
          <div>
            <h2>Monthly Overview</h2>

            <p>
              Track your spending month by month.
            </p>
          </div>

          <select
            value={selectedMonth}
            onChange={(e) =>
              setSelectedMonth(
                e.target.value
              )
            }
          >
            <option value={selectedMonth}>
              {selectedMonthName}
            </option>

            {availableMonths
              .filter(
                (month) =>
                  month !== selectedMonth
              )
              .map((month) => (
                <option
                  key={month}
                  value={month}
                >
                  {new Date(
                    `${month}-01`
                  ).toLocaleDateString(
                    "en-IN",
                    {
                      month: "long",
                      year: "numeric",
                    }
                  )}
                </option>
              ))}
          </select>
        </div>

        {expensesLoading ? (
          <div className="loading">
            Loading chart...
          </div>
        ) : monthlyChartData.length === 0 ? (
          <div className="empty-state">
            <p>
              No monthly expense data yet.
            </p>
          </div>
        ) : (
          <div className="chart-container">
            <ResponsiveContainer
              width="100%"
              height={330}
            >
              <BarChart
                data={monthlyChartData}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis dataKey="month" />

                <YAxis />

                <Tooltip
                  formatter={(value) =>
                    `₹${Number(
                      value
                    ).toLocaleString(
                      "en-IN"
                    )}`
                  }
                />

                <Bar
                  dataKey="total"
                  name="Expenses"
                  fill="#2563eb"
                  radius={[
                    8,
                    8,
                    0,
                    0,
                  ]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* =========================
          CATEGORY PIE
      ========================= */}

      <section className="analytics-container">
        <h2>Spending by Category</h2>

        {categoryData.length === 0 ? (
          <div className="empty-state">
            <p>
              No expenses found for this month.
            </p>
          </div>
        ) : (
          <div className="chart-container">
            <ResponsiveContainer
              width="100%"
              height={350}
            >
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label
                >
                  {categoryData.map(
                    (entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          CHART_COLORS[
                            index %
                              CHART_COLORS.length
                          ]
                        }
                      />
                    )
                  )}
                </Pie>

                <Tooltip
                  formatter={(value) =>
                    `₹${Number(
                      value
                    ).toLocaleString(
                      "en-IN"
                    )}`
                  }
                />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* =========================
          ADD / UPDATE EXPENSE
      ========================= */}

      <section className="expense-form">
        <h2>
          {editingId
            ? "Update Expense"
            : "Add Expense"}
        </h2>

        <form
          onSubmit={handleSubmitExpense}
        >
          <input
            type="text"
            placeholder="Expense title"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            disabled={expenseSaving}
          />

          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Amount"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value)
            }
            disabled={expenseSaving}
          />

          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
            disabled={expenseSaving}
          />

          <input
            type="date"
            value={date}
            onChange={(e) =>
              setDate(e.target.value)
            }
            disabled={expenseSaving}
          />

          <button
            type="submit"
            disabled={expenseSaving}
          >
            {expenseSaving
              ? editingId
                ? "Updating..."
                : "Adding..."
              : editingId
              ? "Update Expense"
              : "Add Expense"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={clearForm}
              disabled={expenseSaving}
            >
              Cancel
            </button>
          )}
        </form>
      </section>

      {/* =========================
          EXPENSE LIST
      ========================= */}

      <section className="expense-list">
        <div className="section-heading">
          <div>
            <h2>Your Expenses</h2>

            <p>
              {filteredExpenses.length}{" "}
              expense
              {filteredExpenses.length !== 1
                ? "s"
                : ""}{" "}
              found
            </p>
          </div>
        </div>

        {/* SEARCH / FILTER */}

        <div className="expense-filters">
          <input
            type="text"
            placeholder="🔎 Search expense..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <select
            value={filterCategory}
            onChange={(e) =>
              setFilterCategory(
                e.target.value
              )
            }
          >
            {categories.map(
              (categoryName) => (
                <option
                  key={categoryName}
                  value={categoryName}
                >
                  {categoryName}
                </option>
              )
            )}
          </select>
        </div>

        {/* LIST */}

        {expensesLoading ? (
          <div className="loading">
            Loading expenses...
          </div>
        ) : filteredExpenses.length ===
          0 ? (
          <div className="empty-state">
            <p>
              No expenses found for this
              month.
            </p>
          </div>
        ) : (
          filteredExpenses.map(
            (expense) => {
              const expenseDate =
                expense.date ||
                expense.createdAt;

              return (
                <div
                  className="expense-card"
                  key={expense._id}
                >
                  <div>
                    <h3>
                      {expense.title}
                    </h3>

                    <p>
                      Category:{" "}
                      <strong>
                        {expense.category}
                      </strong>
                    </p>

                    <p>
                      📅{" "}
                      {new Date(
                        expenseDate
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}
                    </p>

                    <strong>
                      ₹
                      {Number(
                        expense.amount
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>

                  <div className="expense-actions">
                    <button
                      onClick={() =>
                        handleEdit(
                          expense
                        )
                      }
                      disabled={
                        deletingId ===
                        expense._id
                      }
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(
                          expense._id
                        )
                      }
                      disabled={
                        deletingId ===
                        expense._id
                      }
                    >
                      {deletingId ===
                      expense._id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              );
            }
          )
        )}
      </section>
    </div>
  );
}

export default App;