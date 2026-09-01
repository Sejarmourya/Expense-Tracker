import { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
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
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isSignup, setIsSignup] = useState(false);

  // Dark Mode
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  // Auth
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Expenses
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  // Edit
  const [editingId, setEditingId] = useState(null);

  // Search / Filter
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  // Loading
  const [authLoading, setAuthLoading] = useState(false);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [expenseSaving, setExpenseSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Messages
  const [authMessage, setAuthMessage] = useState("");
  const [error, setError] = useState("");

  // =========================
  // DARK MODE
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
  };

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async (e) => {
    e.preventDefault();

    setAuthMessage("");
    setError("");

    if (!email || !password) {
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
    } catch (err) {
      setAuthMessage(
        err.response?.data?.message ||
          "Login failed. Please try again."
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
    setError("");

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
    } catch (err) {
      setAuthMessage(
        err.response?.data?.message ||
          "Signup failed. Please try again."
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
    } catch (err) {
      console.log(err);

      if (err.response?.status === 401) {
        handleLogout();
        return;
      }

      setError(
        err.response?.data?.message ||
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
  // ADD / UPDATE EXPENSE
  // =========================

  const handleSubmitExpense = async (e) => {
    e.preventDefault();

    setError("");

    const cleanTitle = title.trim();
    const cleanCategory = category.trim();
    const numericAmount = Number(amount);

    if (!cleanTitle || !cleanCategory || !amount) {
      setError("Please fill all expense fields.");
      return;
    }

    if (numericAmount <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }

    if (!Number.isFinite(numericAmount)) {
      setError("Please enter a valid amount.");
      return;
    }

    setExpenseSaving(true);

    try {
      if (editingId) {
        await axios.put(
          `${API}/expenses/${editingId}`,
          {
            title: cleanTitle,
            amount: numericAmount,
            category: cleanCategory,
          },
          getConfig()
        );
      } else {
        await axios.post(
          `${API}/expenses`,
          {
            title: cleanTitle,
            amount: numericAmount,
            category: cleanCategory,
          },
          getConfig()
        );
      }

      setTitle("");
      setAmount("");
      setCategory("");
      setEditingId(null);

      await getExpenses();
    } catch (err) {
      console.log(err);

      if (err.response?.status === 401) {
        handleLogout();
        return;
      }

      setError(
        err.response?.data?.message ||
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

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // CANCEL EDIT
  // =========================

  const cancelEdit = () => {
    setEditingId(null);
    setTitle("");
    setAmount("");
    setCategory("");
    setError("");
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
        cancelEdit();
      }

      await getExpenses();
    } catch (err) {
      console.log(err);

      if (err.response?.status === 401) {
        handleLogout();
        return;
      }

      setError(
        err.response?.data?.message ||
          "Unable to delete expense."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // =========================
  // SEARCH / FILTER
  // =========================

  const categories = [
    "All",
    ...new Set(
      expenses.map((expense) => expense.category)
    ),
  ];

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      filterCategory === "All" ||
      expense.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  // =========================
  // SUMMARY
  // =========================

  const totalExpenses = expenses.reduce(
    (total, expense) =>
      total + Number(expense.amount),
    0
  );

  const expenseCount = expenses.length;

  const highestExpense =
    expenses.length > 0
      ? Math.max(
          ...expenses.map((expense) =>
            Number(expense.amount)
          )
        )
      : 0;

  // =========================
  // CATEGORY CHART DATA
  // =========================

  const categoryData = Object.values(
    expenses.reduce((result, expense) => {
      const categoryName = expense.category;

      if (!result[categoryName]) {
        result[categoryName] = {
          name: categoryName,
          value: 0,
        };
      }

      result[categoryName].value += Number(
        expense.amount
      );

      return result;
    }, {})
  );

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
                disabled={authLoading}
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
                disabled={authLoading}
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
      <header>
        <div>
          <h1>Expense Tracker</h1>
          <p>Welcome, {user.name} 👋</p>
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

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {/* SUMMARY */}

      <section className="summary-container">
        <div className="summary-card">
          <h3>Total Expenses</h3>
          <h2>₹{totalExpenses}</h2>
        </div>

        <div className="summary-card">
          <h3>Number of Expenses</h3>
          <h2>{expenseCount}</h2>
        </div>

        <div className="summary-card">
          <h3>Highest Expense</h3>
          <h2>₹{highestExpense}</h2>
        </div>
      </section>

      {/* ANALYTICS */}

      <section className="analytics-container">
        <h2>Spending by Category</h2>

        {expensesLoading ? (
          <div className="loading">
            Loading analytics...
          </div>
        ) : categoryData.length === 0 ? (
          <p>No expense data available.</p>
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
                    `₹${value}`
                  }
                />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* ADD / UPDATE */}

      <section className="expense-form">
        <h2>
          {editingId
            ? "Update Expense"
            : "Add Expense"}
        </h2>

        <form onSubmit={handleSubmitExpense}>
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
              onClick={cancelEdit}
              disabled={expenseSaving}
            >
              Cancel
            </button>
          )}
        </form>
      </section>

      {/* EXPENSE LIST */}

      <section className="expense-list">
        <h2>Your Expenses</h2>

        <div className="expense-filters">
          <input
            type="text"
            placeholder="Search expense..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

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

        {expensesLoading ? (
          <div className="loading">
            Loading expenses...
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="empty-state">
            <p>No expenses found.</p>
          </div>
        ) : (
          filteredExpenses.map((expense) => (
            <div
              className="expense-card"
              key={expense._id}
            >
              <div>
                <h3>{expense.title}</h3>

                <p>
                  Category: {expense.category}
                </p>

                <strong>
                  ₹{expense.amount}
                </strong>
              </div>

              <div className="expense-actions">
                <button
                  onClick={() =>
                    handleEdit(expense)
                  }
                  disabled={
                    deletingId === expense._id
                  }
                >
                  Edit
                </button>

                <button
                  onClick={() =>
                    handleDelete(expense._id)
                  }
                  disabled={
                    deletingId === expense._id
                  }
                >
                  {deletingId === expense._id
                    ? "Deleting..."
                    : "Delete"}
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

export default App;