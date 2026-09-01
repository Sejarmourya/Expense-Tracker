import { useEffect, useMemo, useState } from "react";
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
  "#6366f1",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#a855f7",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
  "#f97316",
  "#14b8a6",
];

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isSignup, setIsSignup] = useState(false);

  // =========================
  // THEME
  // =========================

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") !== "false"
  );

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

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
  // FILTERS
  // =========================

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  // =========================
  // LOADING / ERROR
  // =========================

  const [expensesLoading, setExpensesLoading] = useState(false);
  const [expenseSaving, setExpenseSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

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
  };

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async (e) => {
    e.preventDefault();

    setAuthMessage("");

    if (!email.trim() || !password) {
      setAuthMessage("Please enter email and password.");
      return;
    }

    setAuthLoading(true);

    try {
      const response = await axios.post(`${API}/auth/login`, {
        email: email.trim(),
        password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      setUser(response.data.user);

      setEmail("");
      setPassword("");
    } catch (error) {
      setAuthMessage(
        error.response?.data?.message || "Login failed."
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
      setAuthMessage("Password must be at least 6 characters.");
      return;
    }

    setAuthLoading(true);

    try {
      await axios.post(`${API}/auth/signup`, {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      setAuthMessage(
        "Signup successful ✅ Please login."
      );

      setName("");
      setEmail("");
      setPassword("");
      setIsSignup(false);
    } catch (error) {
      setAuthMessage(
        error.response?.data?.message || "Signup failed."
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

  useEffect(() => {
    if (user) {
      getExpenses();
    }
  }, [user]);

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
    setError("");
  };

  // =========================
  // ADD / UPDATE
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
  // EDIT
  // =========================

  const handleEdit = (expense) => {
    setError("");

    setEditingId(expense._id);
    setTitle(expense.title);
    setAmount(expense.amount);
    setCategory(expense.category);

    const expenseDate =
      expense.date || expense.createdAt;

    if (expenseDate) {
      setDate(
        new Date(expenseDate)
          .toISOString()
          .split("T")[0]
      );
    }

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
  // CATEGORY LIST
  // =========================

  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(
        expenses
          .map((expense) => expense.category)
          .filter(Boolean)
      ),
    ];
  }, [expenses]);

  // =========================
  // MONTH LIST
  // =========================

  const availableMonths = useMemo(() => {
    const months = expenses
      .map((expense) => {
        const expenseDate =
          expense.date || expense.createdAt;

        if (!expenseDate) return null;

        return new Date(expenseDate)
          .toISOString()
          .slice(0, 7);
      })
      .filter(Boolean);

    const uniqueMonths = [...new Set(months)];

    const currentMonth = new Date()
      .toISOString()
      .slice(0, 7);

    if (!uniqueMonths.includes(currentMonth)) {
      uniqueMonths.push(currentMonth);
    }

    return uniqueMonths.sort((a, b) =>
      b.localeCompare(a)
    );
  }, [expenses]);

  // =========================
  // FILTERED EXPENSES
  // =========================

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const expenseDate =
        expense.date || expense.createdAt;

      if (!expenseDate) return false;

      const expenseMonth = new Date(expenseDate)
        .toISOString()
        .slice(0, 7);

      const matchesSearch =
        expense.title
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        expense.category
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        filterCategory === "All" ||
        expense.category === filterCategory;

      const matchesMonth =
        expenseMonth === selectedMonth;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesMonth
      );
    });
  }, [
    expenses,
    search,
    filterCategory,
    selectedMonth,
  ]);

  // =========================
  // MONTHLY EXPENSES
  // =========================

  const monthlyExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const expenseDate =
        expense.date || expense.createdAt;

      if (!expenseDate) return false;

      return (
        new Date(expenseDate)
          .toISOString()
          .slice(0, 7) === selectedMonth
      );
    });
  }, [expenses, selectedMonth]);

  // =========================
  // TOTALS
  // =========================

  const totalExpenses = expenses.reduce(
    (total, expense) =>
      total + Number(expense.amount || 0),
    0
  );

  const monthlyTotal = monthlyExpenses.reduce(
    (total, expense) =>
      total + Number(expense.amount || 0),
    0
  );

  const highestExpense =
    expenses.length > 0
      ? Math.max(
          ...expenses.map((expense) =>
            Number(expense.amount || 0)
          )
        )
      : 0;

  // =========================
  // CATEGORY DATA
  // =========================

  const categoryData = Object.values(
    monthlyExpenses.reduce((result, expense) => {
      const categoryName =
        expense.category || "Other";

      if (!result[categoryName]) {
        result[categoryName] = {
          name: categoryName,
          value: 0,
        };
      }

      result[categoryName].value += Number(
        expense.amount || 0
      );

      return result;
    }, {})
  );

  // =========================
  // MONTHLY BAR DATA
  // =========================

  const monthlyChartData = availableMonths
    .slice()
    .reverse()
    .map((month) => {
      const monthExpenses = expenses.filter(
        (expense) => {
          const expenseDate =
            expense.date || expense.createdAt;

          if (!expenseDate) return false;

          return (
            new Date(expenseDate)
              .toISOString()
              .slice(0, 7) === month
          );
        }
      );

      const total = monthExpenses.reduce(
        (sum, expense) =>
          sum + Number(expense.amount || 0),
        0
      );

      return {
        month: new Date(
          `${month}-01`
        ).toLocaleDateString("en-IN", {
          month: "short",
          year: "2-digit",
        }),
        total,
      };
    });

  const selectedMonthLabel = new Date(
    `${selectedMonth}-01`
  ).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  // =========================
  // AUTH SCREEN
  // =========================

  if (!user) {
    return (
      <div
        className={`auth-container ${
          darkMode ? "dark-mode" : ""
        }`}
      >
        <div className="auth-background-circle circle-one" />
        <div className="auth-background-circle circle-two" />

        <div className="auth-box">
          <div className="auth-brand">
            <div className="brand-icon">₹</div>

            <div>
              <h1>ExpenseFlow</h1>
              <p>Smart money management</p>
            </div>
          </div>

          <div className="auth-heading">
            <h2>
              {isSignup
                ? "Create your account"
                : "Welcome back"}
            </h2>

            <p>
              {isSignup
                ? "Start tracking your expenses today."
                : "Manage your spending with ease."}
            </p>
          </div>

          {isSignup ? (
            <form
              className="auth-form"
              onSubmit={handleSignup}
            >
              <label>Full Name</label>

              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                disabled={authLoading}
              />

              <label>Email Address</label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                disabled={authLoading}
              />

              <label>Password</label>

              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                disabled={authLoading}
              />

              <button
                className="primary-auth-button"
                type="submit"
                disabled={authLoading}
              >
                {authLoading
                  ? "Creating account..."
                  : "Create Account"}
              </button>

              {authMessage && (
                <p className="auth-message">
                  {authMessage}
                </p>
              )}

              <p className="switch-auth">
                Already have an account?
                <button
                  type="button"
                  onClick={() => {
                    setIsSignup(false);
                    setAuthMessage("");
                  }}
                >
                  Login
                </button>
              </p>
            </form>
          ) : (
            <form
              className="auth-form"
              onSubmit={handleLogin}
            >
              <label>Email Address</label>

              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                disabled={authLoading}
              />

              <label>Password</label>

              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                disabled={authLoading}
              />

              <button
                className="primary-auth-button"
                type="submit"
                disabled={authLoading}
              >
                {authLoading
                  ? "Logging in..."
                  : "Login"}
              </button>

              {authMessage && (
                <p className="auth-message">
                  {authMessage}
                </p>
              )}

              <p className="switch-auth">
                Don't have an account?
                <button
                  type="button"
                  onClick={() => {
                    setIsSignup(true);
                    setAuthMessage("");
                  }}
                >
                  Create Account
                </button>
              </p>
            </form>
          )}

          <button
            className="auth-theme-button"
            onClick={() =>
              setDarkMode(!darkMode)
            }
            type="button"
          >
            {darkMode
              ? "☀️ Light Mode"
              : "🌙 Dark Mode"}
          </button>
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
        darkMode ? "dark-mode" : "light-mode"
      }`}
    >
      <header className="top-header">
        <div className="brand-section">
          <div className="brand-logo">₹</div>

          <div>
            <h1>ExpenseFlow</h1>
            <p>
              Welcome back,{" "}
              <strong>{user.name}</strong> 👋
            </p>
          </div>
        </div>

        <div className="header-actions">
          <button
            className="theme-toggle"
            onClick={() =>
              setDarkMode(!darkMode)
            }
            type="button"
            title="Toggle theme"
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

      {error && (
        <div className="error-message">
          <span>⚠️</span>
          {error}

          <button
            onClick={() => setError("")}
          >
            ×
          </button>
        </div>
      )}

      {/* SUMMARY */}

      <section className="summary-container">
        <div className="summary-card">
          <div className="summary-icon purple">
            ₹
          </div>

          <div>
            <p>Total Expenses</p>
            <h2>₹{totalExpenses.toLocaleString("en-IN")}</h2>
            <span>All time spending</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon green">
            ↗
          </div>

          <div>
            <p>This Month</p>
            <h2>₹{monthlyTotal.toLocaleString("en-IN")}</h2>
            <span>{selectedMonthLabel}</span>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon orange">
            ★
          </div>

          <div>
            <p>Highest Expense</p>
            <h2>₹{highestExpense.toLocaleString("en-IN")}</h2>
            <span>Largest transaction</span>
          </div>
        </div>
      </section>

      {/* ANALYTICS */}

      <div className="analytics-grid">
        {/* MONTHLY OVERVIEW */}

        <section className="analytics-container monthly-card">
          <div className="section-heading">
            <div>
              <span className="section-label">
                ANALYTICS
              </span>

              <h2>Monthly Overview</h2>

              <p>
                Track your spending over time.
              </p>
            </div>

            <select
              value={selectedMonth}
              onChange={(e) =>
                setSelectedMonth(e.target.value)
              }
            >
              {availableMonths.map((month) => (
                <option
                  key={month}
                  value={month}
                >
                  {new Date(
                    `${month}-01`
                  ).toLocaleDateString("en-IN", {
                    month: "long",
                    year: "numeric",
                  })}
                </option>
              ))}
            </select>
          </div>

          {expensesLoading ? (
            <div className="loading">
              <div className="spinner" />
              Loading chart...
            </div>
          ) : monthlyChartData.length === 0 ? (
            <div className="empty-state">
              <div>📊</div>
              <p>No monthly data yet.</p>
            </div>
          ) : (
            <div className="chart-container bar-chart">
              <ResponsiveContainer
                width="100%"
                height={320}
              >
                <BarChart
                  data={monthlyChartData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -15,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="4 4"
                    vertical={false}
                    stroke={
                      darkMode
                        ? "#334155"
                        : "#e2e8f0"
                    }
                  />

                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: darkMode
                        ? "#94a3b8"
                        : "#64748b",
                      fontSize: 12,
                    }}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: darkMode
                        ? "#94a3b8"
                        : "#64748b",
                      fontSize: 12,
                    }}
                  />

                  <Tooltip
                    cursor={{
                      fill: darkMode
                        ? "#273449"
                        : "#f1f5f9",
                    }}
                    contentStyle={{
                      background: darkMode
                        ? "#111827"
                        : "#ffffff",
                      border: darkMode
                        ? "1px solid #334155"
                        : "1px solid #e2e8f0",
                      borderRadius: "12px",
                    }}
                    formatter={(value) => [
                      `₹${Number(value).toLocaleString(
                        "en-IN"
                      )}`,
                      "Expenses",
                    ]}
                  />

                  <Bar
                    dataKey="total"
                    fill="#6366f1"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={55}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* PIE CHART */}

        <section className="analytics-container category-card">
          <div className="section-heading">
            <div>
              <span className="section-label">
                BREAKDOWN
              </span>

              <h2>Spending by Category</h2>

              <p>
                {selectedMonthLabel}
              </p>
            </div>
          </div>

          {categoryData.length === 0 ? (
            <div className="empty-state">
              <div>🥧</div>
              <p>No category data yet.</p>
            </div>
          ) : (
            <div className="pie-wrapper">
              <ResponsiveContainer
                width="100%"
                height={330}
              >
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={3}
                    labelLine={false}
                    label={({ percent }) =>
                      `${(
                        percent * 100
                      ).toFixed(0)}%`
                    }
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
                          stroke="none"
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      background: darkMode
                        ? "#111827"
                        : "#ffffff",
                      border: darkMode
                        ? "1px solid #334155"
                        : "1px solid #e2e8f0",
                      borderRadius: "12px",
                    }}
                    formatter={(value) => [
                      `₹${Number(value).toLocaleString(
                        "en-IN"
                      )}`,
                      "Spent",
                    ]}
                  />

                  <Legend
                    verticalAlign="bottom"
                    height={45}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>

      {/* ADD EXPENSE */}

      <section className="expense-form">
        <div className="form-heading">
          <div className="form-icon">
            {editingId ? "✎" : "+"}
          </div>

          <div>
            <span className="section-label">
              {editingId
                ? "EDIT TRANSACTION"
                : "NEW TRANSACTION"}
            </span>

            <h2>
              {editingId
                ? "Update Expense"
                : "Add Expense"}
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmitExpense}>
          <div className="input-group">
            <label>Expense Title</label>

            <input
              type="text"
              placeholder="e.g. Grocery shopping"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              disabled={expenseSaving}
            />
          </div>

          <div className="input-group">
            <label>Amount</label>

            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="₹ 0.00"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value)
              }
              disabled={expenseSaving}
            />
          </div>

          <div className="input-group">
            <label>Category</label>

            <input
              type="text"
              placeholder="e.g. Food"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
              disabled={expenseSaving}
            />
          </div>

          <div className="input-group">
            <label>Date</label>

            <input
              type="date"
              value={date}
              onChange={(e) =>
                setDate(e.target.value)
              }
              disabled={expenseSaving}
            />
          </div>

          <div className="form-buttons">
            <button
              className="add-button"
              type="submit"
              disabled={expenseSaving}
            >
              {expenseSaving
                ? "Saving..."
                : editingId
                ? "Update Expense"
                : "Add Expense"}
            </button>

            {editingId && (
              <button
                className="cancel-button"
                type="button"
                onClick={clearForm}
                disabled={expenseSaving}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {/* EXPENSE LIST */}

      <section className="expense-list">
        <div className="expense-list-header">
          <div>
            <span className="section-label">
              TRANSACTIONS
            </span>

            <h2>Your Expenses</h2>

            <p>
              {filteredExpenses.length} expense
              {filteredExpenses.length !== 1
                ? "s"
                : ""}{" "}
              found
            </p>
          </div>

          <div className="total-mini">
            <span>Monthly Total</span>
            <strong>
              ₹{monthlyTotal.toLocaleString("en-IN")}
            </strong>
          </div>
        </div>

        {/* FILTERS */}

        <div className="expense-filters">
          <div className="search-box">
            <span>⌕</span>

            <input
              type="text"
              placeholder="Search expenses..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                type="button"
              >
                ×
              </button>
            )}
          </div>

          <select
            value={filterCategory}
            onChange={(e) =>
              setFilterCategory(e.target.value)
            }
          >
            {categories.map((categoryName) => (
              <option
                key={categoryName}
                value={categoryName}
              >
                {categoryName}
              </option>
            ))}
          </select>
        </div>

        {/* LIST */}

        {expensesLoading ? (
          <div className="loading list-loading">
            <div className="spinner" />
            Loading expenses...
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="empty-state expense-empty">
            <div>💸</div>

            <h3>No expenses found</h3>

            <p>
              Try another month, category or search.
            </p>
          </div>
        ) : (
          <div className="expenses-wrapper">
            {filteredExpenses.map((expense) => {
              const expenseDate =
                expense.date || expense.createdAt;

              const categoryIndex =
                categories.indexOf(
                  expense.category
                );

              const categoryColor =
                CHART_COLORS[
                  Math.max(categoryIndex - 1, 0) %
                    CHART_COLORS.length
                ];

              return (
                <div
                  className="expense-card"
                  key={expense._id}
                >
                  <div
                    className="expense-category-icon"
                    style={{
                      background: `${categoryColor}20`,
                      color: categoryColor,
                    }}
                  >
                    {expense.category
                      ?.charAt(0)
                      .toUpperCase() || "E"}
                  </div>

                  <div className="expense-info">
                    <h3>{expense.title}</h3>

                    <div className="expense-meta">
                      <span>
                        {expense.category}
                      </span>

                      <span>•</span>

                      <span>
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
                      </span>
                    </div>
                  </div>

                  <div className="expense-amount">
                    <strong>
                      ₹
                      {Number(
                        expense.amount
                      ).toLocaleString("en-IN")}
                    </strong>
                  </div>

                  <div className="expense-actions">
                    <button
                      className="edit-button"
                      onClick={() =>
                        handleEdit(expense)
                      }
                      disabled={
                        deletingId ===
                        expense._id
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="delete-button"
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
                        ? "..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <footer className="footer">
        <p>
          ExpenseFlow • Manage your money smarter
        </p>
      </footer>
    </div>
  );
}

export default App;