import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API = "http://localhost:5000/api";

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isSignup, setIsSignup] = useState(false);

  // Auth fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  // Expense fields
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  // Edit
  const [editingId, setEditingId] = useState(null);

  // Search & Filter
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const getConfig = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  // =========================
  // LOGIN
  // =========================

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const response = await axios.post(`${API}/auth/login`, {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      setUser(response.data.user);
      setEmail("");
      setPassword("");
      setMessage("");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Login failed"
      );
    }
  };

  // =========================
  // SIGNUP
  // =========================

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      await axios.post(`${API}/auth/signup`, {
        name,
        email,
        password,
      });

      setMessage("Signup successful ✅ Now login.");

      setName("");
      setEmail("");
      setPassword("");
      setIsSignup(false);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Signup failed"
      );
    }
  };

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
  // GET EXPENSES
  // =========================

  const getExpenses = async () => {
    try {
      const response = await axios.get(
        `${API}/expenses`,
        getConfig()
      );

      setExpenses(response.data.expenses);
    } catch (error) {
      console.log(error);

      if (error.response?.status === 401) {
        handleLogout();
      }
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

    if (!title || !amount || !category) {
      alert("Please fill all expense fields");
      return;
    }

    try {
      if (editingId) {
        await axios.put(
          `${API}/expenses/${editingId}`,
          {
            title,
            amount,
            category,
          },
          getConfig()
        );
      } else {
        await axios.post(
          `${API}/expenses`,
          {
            title,
            amount,
            category,
          },
          getConfig()
        );
      }

      setTitle("");
      setAmount("");
      setCategory("");
      setEditingId(null);

      getExpenses();
    } catch (error) {
      console.log(error);

      alert(
        error.response?.data?.message ||
          "Something went wrong"
      );
    }
  };

  // =========================
  // EDIT
  // =========================

  const handleEdit = (expense) => {
    setEditingId(expense._id);
    setTitle(expense.title);
    setAmount(expense.amount);
    setCategory(expense.category);
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Delete this expense?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(
        `${API}/expenses/${id}`,
        getConfig()
      );

      getExpenses();
    } catch (error) {
      console.log(error);
    }
  };

  // =========================
  // SEARCH & FILTER
  // =========================

  const categories = [
    "All",
    ...new Set(expenses.map((expense) => expense.category)),
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
  // DASHBOARD SUMMARY
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
  // LOGIN / SIGNUP PAGE
  // =========================

  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <h1>Expense Tracker</h1>

          <h2>
            {isSignup ? "Create Account" : "Welcome Back"}
          </h2>

          {isSignup ? (
            <form onSubmit={handleSignup}>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />

              <button type="submit">
                Create Account
              </button>

              <p>{message}</p>

              <button
                type="button"
                onClick={() => {
                  setIsSignup(false);
                  setMessage("");
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
                onChange={(e) => setEmail(e.target.value)}
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />

              <button type="submit">Login</button>

              <p>{message}</p>

              <button
                type="button"
                onClick={() => {
                  setIsSignup(true);
                  setMessage("");
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
  // EXPENSE DASHBOARD
  // =========================

  return (
    <div className="app-container">
      <header>
        <div>
          <h1>Expense Tracker</h1>
          <p>Welcome, {user.name} 👋</p>
        </div>

        <button onClick={handleLogout}>
          Logout
        </button>
      </header>

      {/* DASHBOARD SUMMARY */}

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

      {/* ADD / UPDATE FORM */}

      <section className="expense-form">
        <h2>
          {editingId ? "Update Expense" : "Add Expense"}
        </h2>

        <form onSubmit={handleSubmitExpense}>
          <input
            type="text"
            placeholder="Expense title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />

          <button type="submit">
            {editingId ? "Update Expense" : "Add Expense"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setTitle("");
                setAmount("");
                setCategory("");
              }}
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
            onChange={(e) => setSearch(e.target.value)}
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

        {filteredExpenses.length === 0 ? (
          <p>No expenses found.</p>
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

              <div>
                <button
                  onClick={() => handleEdit(expense)}
                >
                  Edit
                </button>

                <button
                  onClick={() =>
                    handleDelete(expense._id)
                  }
                >
                  Delete
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